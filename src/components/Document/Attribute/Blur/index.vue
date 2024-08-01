<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { Context } from '@/context';
import { ShapeView, ShapeType, Blur, Point2D, BlurType } from "@kcdesign/data";
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import {
    get_actions_add_blur,
    get_actions_blur_delete,
    get_actions_blur_enabled,
    get_actions_blur_unify,
    get_blur
} from '@/utils/shape_style';
import { hidden_selection } from '@/utils/content';
import BlurDetail from "./BlurDetail.vue";
import BlurTypeSelect from "./BlurTypeSelect.vue";

interface Props {
    context: Context
    shapes: ShapeView[]
}

const props = defineProps<Props>();
const { t } = useI18n();
const watchedShapes = new Map();
const blurInfo = ref<Blur>();
const mixed = ref<boolean>(false);
const reflush = ref<number>(0);

function watchShapes() {
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.hoveredShape) {
        needWatchShapes.set(selection.hoveredShape.id, selection.hoveredShape);
    }

    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length > 0) {
        for (let i = 0, l = selectedShapes.length; i < l; i++) {
            const v = selectedShapes[i];
            if (v.isVirtualShape) {
                let p = v.parent;
                while (p) {
                    if (p.type === ShapeType.SymbolRef) {
                        needWatchShapes.set(p.id, p);
                        break;
                    }
                    p = p.parent;
                }
            }
            needWatchShapes.set(v.id, v);
        }
    }

    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(watcher);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(watcher);
        watchedShapes.set(k, v);
    })
}

function updateData() {
    mixed.value = false;
    blurInfo.value = undefined;
    const len = props.shapes.length;
    if (len === 1) {
        const shape = props.shapes[0];
        const blur = shape.blur;
        blurInfo.value = blur;
    } else if (len > 1) {
        const blur = get_blur(props.shapes);
        if (blur === 'mixed') {
            mixed.value = true;
        } else {
            blurInfo.value = blur;
        }
    }
    reflush.value++;
}

function watcher(...args: any[]) {
    if (args.length > 0 && (args.includes('layout'))) updateData();
}

function addBlur(): void {
    const len = props.shapes.length;
    if (len < 1) return;
    const blur = new Blur(true, new Point2D(0, 0), 10, BlurType.Gaussian);
    if (mixed.value) {
        const actions = get_actions_blur_unify(props.shapes);
        const page = props.context.selection.selectedPage;
        if (page && actions) {
            const editor = props.context.editor4Page(page);
            editor.shapesBlurUnify(actions);
        }
    } else {
        const actions = get_actions_add_blur(props.shapes, blur);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.shapesAddBlur(actions);
        }
    }
    hidden_selection(props.context);
}

function first() {
    if (!blurInfo.value && !mixed.value) addBlur();
}

function deleteBlur() {
    const len = props.shapes.length;
    if (len < 1) return;
    const actions = get_actions_blur_delete(props.shapes);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.shapeDeleteBlur(actions);
    }
    hidden_selection(props.context);
}

function toggleVisible() {
    const len = props.shapes.length;
    const isEnabled = !blurInfo.value!.isEnabled;
    if (len < 1) return;
    const actions = get_actions_blur_enabled(props.shapes, isEnabled);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapeBlurEnabled(actions);
    }
    hidden_selection(props.context);
}

function update_by_shapes() {
    watchShapes();
    updateData();
}

// hooks
const stop = watch(() => props.shapes, update_by_shapes);
onMounted(update_by_shapes);
onUnmounted(() => {
    stop();
    watchedShapes.forEach(i => i.unwatch(watcher));
    watchedShapes.clear();
});
</script>

<template>
<div class="blur-panel">
    <TypeHeader :title="t('blur.blur')" class="mt-24" @click="first" :active="blurInfo ? true : false">
        <template #tool>
            <div class="add" @click.stop="addBlur" v-if="!blurInfo || mixed">
                <svg-icon icon-class="add"></svg-icon>
            </div>
        </template>
    </TypeHeader>
    <div class="tips-wrap" v-if="mixed">
        <span class="mixed-tips">{{ t('attr.mixed_lang') }}</span>
    </div>
    <div class="blur-container" v-else-if="!mixed && blurInfo">
        <div class="blur">
            <div :class="blurInfo.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible()">
                <svg-icon v-if="blurInfo.isEnabled" icon-class="select" />
            </div>
            <div class="blur_posi">
                <BlurTypeSelect :context="context" :blur="blurInfo" :shapes="shapes" />
            </div>
            <div class="detail">
                <BlurDetail :context="context" :blur="blurInfo" :shapes="shapes" />
            </div>
            <div class="delete" @click="deleteBlur">
                <svg-icon icon-class="delete" />
            </div>
        </div>
    </div>
</div>
</template>

<style scoped lang="scss">
.blur-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .add {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-radius: var(--default-radius);
        transition: .2s;

        > svg {
            width: 16px;
            height: 16px;
        }
    }

    .add:hover {
        background-color: #F5F5F5;
    }

    //.add:hover {
    //  transform: scale(1.25);
    //}

    .blur-container {
        padding: 6px 0;

        .blur {
            height: 30px;
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            box-sizing: border-box;
            margin-top: 4px;

            .visibility {
                flex: 0 0 14px;
                width: 14px;
                height: 14px;
                background-color: var(--active-color);
                box-sizing: border-box;
                color: #ffffff;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 4px;
                margin-right: 5px;

                > svg {
                    width: 60%;
                    height: 60%;
                }
            }

            .hidden {
                flex: 0 0 14px;
                width: 14px;
                height: 14px;
                background: #FFFFFF;
                border-radius: 4px;
                border: 1px solid #EBEBEB;
                box-sizing: border-box;
                margin-right: 5px
            }

            .blur_posi {
                flex: 1;
                height: 100%;
                margin-right: 5px;
                //padding: 0px 5px;
                box-sizing: border-box;
            }

            .delete {
                flex: 0 0 28px;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 28px;
                height: 28px;
                border-radius: var(--default-radius);
                transition: .2s;

                > svg {
                    width: 16px;
                    height: 16px;
                }
            }

            .detail {
                flex: 0 0 28px;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 28px;
                height: 28px;
            }

            .delete:hover {
                background-color: #F5F5F5;
            }
        }
    }

    .tips-wrap {
        padding: 12px 0;

        .mixed-tips {
            display: block;
            width: 218px;
            height: 14px;
            text-align: center;
            font-size: var(--font-default-fontsize);
            color: #737373;
        }
    }

}
</style>