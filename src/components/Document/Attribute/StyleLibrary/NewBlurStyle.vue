<template>
    <div class="new-style" :style="{ top: props.top + 'px', left: props.left + 'px' }" @click.stop @mousedown.stop>
        <div class="header">
            <div class="title">创建模糊样式</div>
            <div class="close" @click.stop="emits('close')">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">名称</label>
                <input v-focus ref="inputname" type="text" id="name" v-model="name"
                    @keydown.esc="props.context.escstack.execute()">
            </div>
            <div class="des">
                <label for="des">描述</label>
                <input type="text" id="des" v-model="des">
            </div>
        </div>
        <div class="effect">
            <div class="create-effect">
                <div class="title">模糊</div>
                <div class="add" v-if="!blurInfo" @click="addShadow">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
            </div>
            <div v-if="blurInfo" class="effect-list">
                <div class="item">
                    <div class="show">
                        <div :class="blurInfo.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible()">
                            <svg-icon v-if="blurInfo.isEnabled" icon-class="select"></svg-icon>
                        </div>
                    </div>
                    <Select class="select" :context="props.context" :shapes="props.shapes"
                        :source="positonOptionsSource"
                        :selected="positonOptionsSource.find(i => i.data.value === blurInfo?.type)?.data"
                        @select="(value) => positionSelect(value)"></Select>
                    <BlurDetail :context="props.context" :blur="blurInfo" :shapes="props.shapes" />
                    <div class="delete" :class="{ disable }">
                        <svg-icon icon-class="delete"></svg-icon>
                    </div>
                </div>
            </div>
        </div>
        <div class="create-bnt" :class="{ 'invalid': invalid }" @click.stop="Neweffect">创建样式</div>
    </div>

</template>
<script setup lang="ts">
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { Context } from '@/context';
import { ShapeView, BlurType, Shadow, ShapeType, BasicArray, ShadowMask, Point2D, Blur, BlurMask } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { genOptions } from '@/utils/common';
import BlurDetail from "../Blur/BlurDetail.vue";
import {
    get_actions_add_blur,
    get_actions_blur_enabled,
    get_actions_blur_modify,
    get_actions_blur_unify,
    get_blur,
} from '@/utils/shape_style';
import { computed } from 'vue';
import { v4 } from 'uuid';
import { hidden_selection } from '@/utils/content';
import { getShapesForStyle } from '@/utils/style';

const props = defineProps<{
    context: Context;
    shapes: ShapeView[];
    top: number;
    left: number
}>();

const emits = defineEmits<{
    (e: 'close'): void
}>()

const { t } = useI18n();
const name = ref<string>('')
const des = ref<string>('')
const blurInfo = ref<Blur>();
const inputname = ref<HTMLInputElement>()
const mixed = ref<boolean>(false);
const positonOptionsSource: SelectSource[] = genOptions([
    [BlurType.Gaussian, t(`blur.gaussian`)],
    [BlurType.Background, t(`blur.background`)]
]);
const watchedShapes2 = new Map();
const reflush = ref<number>(0);

const invalid = computed(() => {
    return !blurInfo.value || !name.value
})

function positionSelect(selected: SelectItem) {
    const actions = get_actions_blur_modify(props.shapes, selected.value);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapeBlurType(actions);
    }
    hidden_selection(props.context);
}

const Neweffect = () => {
    if (invalid.value) return
    const editor = props.context.editor4Doc()
    if (!blurInfo.value) return
    const style = new BlurMask(new BasicArray(), props.context.data.id, v4(), name.value, des.value, blurInfo.value)
    const page = props.context.selection.selectedPage!
    const selected = props.context.selection.selectedShapes;
    const shapes = getShapesForStyle(selected);
    editor.insertStyleLib(style, page, shapes);
    props.context.escstack.execute()
    emits('close')
}

function addShadow(): void {
    const len = props.shapes.length;
    if (len < 1) return;
    const blur = new Blur(new BasicArray(), true, new Point2D(0, 0), 10, BlurType.Gaussian);
    const page = props.context.selection.selectedPage!;
    if (mixed.value) {
        const actions = get_actions_blur_unify(props.shapes);
        if (actions) {
            const editor = props.context.editor4Page(page);
            editor.shapesBlurUnify(actions);
        }
    } else {
        const editor = props.context.editor4Page(page);
        editor.shapesAddBlur(get_actions_add_blur(props.shapes, blur));
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

function watchShapes() {
    const needWatchShapes2 = new Map();
    const selection = props.context.selection;
    if (selection.hoveredShape) {
        needWatchShapes2.set(selection.hoveredShape.id, selection.hoveredShape);
    }

    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length > 0) {
        for (let i = 0, l = selectedShapes.length; i < l; i++) {
            const v = selectedShapes[i];
            if (v.isVirtualShape) {
                let p = v.parent;
                while (p) {
                    if (p.type === ShapeType.SymbolRef) {
                        needWatchShapes2.set(p.id, p);
                        break;
                    }
                    p = p.parent;
                }
            }
            needWatchShapes2.set(v.id, v);
        }
    }

    watchedShapes2.forEach((v, k) => {
        if (needWatchShapes2.has(k)) return;
        v.unwatch(watcher);
        watchedShapes2.delete(k);
    })
    needWatchShapes2.forEach((v, k) => {
        if (watchedShapes2.has(k)) return;
        v.watch(watcher);
        watchedShapes2.set(k, v);
    })
}

const updateData2 = () => {
    mixed.value = false;
    blurInfo.value = undefined;
    const len = props.shapes.length;
    if (len === 1) {
        const shape = props.shapes[0];
        blurInfo.value = shape.blur;
    } else if (len > 1) {
        const blur = get_blur(props.shapes);
        if (blur === 'mixed') {
            mixed.value = true;
        } else if (blur === 'mask') {
            return
        } else {
            blurInfo.value = blur;
        }
    }
    reflush.value++;
}

const disable = computed(() => {
    return blurInfo.value ? true : false
})

function watcher(...args: any[]) {
    if (args.length > 0 && (args.includes('layout'))) updateData2();
}

function update_by_shapes() {
    watchShapes();
    updateData2();
}

const stop = watch(() => props.shapes, update_by_shapes);

onMounted(() => {
    update_by_shapes();
})
onUnmounted(() => {
    stop();
});


</script>
<style lang="scss" scoped>
.disable {
    pointer-events: none;
    opacity: 0.4;
}

.new-style {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 250px;
    gap: 8px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.18);
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40px;
        padding: 0 12px;
        border-bottom: 1px solid #f0f0f0;
        box-sizing: border-box;

        .close {
            width: 28px;
            height: 28px;
            display: flex;
            border-radius: 4px;

            &:hover {
                background-color: #F5F5F5;
            }

            svg {
                width: 16px;
                height: 16px;
                margin: auto;
                padding: 2px;
                /* margin-top: 1px; */
                box-sizing: border-box;
            }
        }
    }

    .detail {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px;
        box-sizing: border-box;

        .name,
        .des {
            display: flex;
            align-items: center;
            height: 32px;
            gap: 8px;

            input {
                flex: 1;
                outline: none;
                font-size: 12px;
                padding: 10px 8px;
                height: 32px;
                border-radius: 6px;
                border: 1px solid transparent;
                background-color: #F5F5F5;
                box-sizing: border-box;

                &:focus {
                    border: 1px solid #1878f5;
                }
            }
        }
    }

    .effect {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px;
        margin-bottom: 8px;
        box-sizing: border-box;

        .create-effect {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 32px;

            .add {
                width: 28px;
                height: 28px;
                display: flex;
                border-radius: 4px;

                &:hover {
                    background-color: #F5F5F5;
                }

                svg {
                    width: 16px;
                    height: 16px;
                    margin: auto;
                }
            }
        }

        .effect-list {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .item {
                display: flex;
                align-items: center;
                height: 32px;
                gap: 8px;

                .show {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;

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

                        >svg {
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
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                }


                .select {
                    flex: 1;
                }

                .setting,
                .delete {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    border-radius: 4px;

                    &:hover {
                        background-color: #F5F5F5;
                    }

                    svg {
                        width: 16px;
                        height: 16px;
                        margin: auto;
                    }
                }
            }
        }
    }

    .create-bnt {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: auto;
        margin-bottom: 12px;
        font-size: 12px;
        width: 100px;
        height: 40px;
        border-radius: 6px;
        background-color: #1878f5;
        color: #fff;

        &:hover {
            background-color: #429AFF;
        }

        &:active {
            background-color: #0A59CF;
        }
    }

    .invalid {
        opacity: 0.5;
        pointer-events: none;
    }
}
</style>
