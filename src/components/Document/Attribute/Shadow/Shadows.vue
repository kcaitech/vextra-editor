<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Context } from '@/context';
import { Color, Shadow, ShadowPosition, ShapeView, ShapeType, BasicArray } from "@kcdesign/data";
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import ShadowDetail from './ShadowDetail.vue'
import { v4 } from 'uuid';
import ShadowPositionItem from './ShadowPosition.vue';
import {
    get_actions_add_shadow,
    get_actions_shadow_delete,
    get_actions_shadow_enabled,
    get_actions_shadow_unify,
    get_shadows
} from '@/utils/shape_style';
import { hidden_selection } from '@/utils/content';

interface ShadowItem {
    id: number,
    shadow: Shadow
}

interface Props {
    context: Context
    shapes: ShapeView[]
}

const props = defineProps<Props>();
const { t } = useI18n();
const watchedShapes = new Map();
const shadows: ShadowItem[] = reactive([]);
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
    shadows.length = 0;
    mixed.value = false;
    const len = props.shapes.length;
    if (len === 1) {
        const shape = props.shapes[0];
        const _shadows = shape.getShadows();
        for (let i = 0, len = _shadows.length; i < len; i++) {
            const shadow = _shadows[i];
            const s = { id: i, shadow };
            shadows.unshift(s);
        }
    } else if (len > 1) {
        const _shadows = get_shadows(props.shapes);
        if (_shadows === 'mixed') {
            mixed.value = true;
        } else {
            shadows.push(..._shadows.reverse());
        }
    }
    reflush.value++;
}

function watcher(...args: any[]) {
    if (args.length > 0 && (args.includes('layout'))) updateData();
}

function addShadow(): void {
    const len = props.shapes.length;
    const s = new Shadow(new BasicArray(), v4(), true, 10, new Color(0.3, 0, 0, 0), 0, 4, 0, ShadowPosition.Outer);
    if (len === 1) {
        const e = props.context.editor4Shape(props.context.selection.selectedShapes[0]);
        e.addShadow(s);
    } else if (len > 1) {
        if (mixed.value) {
            const actions = get_actions_shadow_unify(props.shapes);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesShadowsUnify(actions);
            }
        } else {
            const actions = get_actions_add_shadow(props.shapes, s);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesAddShadow(actions);
            }
        }
    }
    hidden_selection(props.context);
}

function first() {
    if (shadows.length === 0 && !mixed.value) addShadow();
}

function deleteFill(idx: number) {
    const _idx = shadows.length - idx - 1;
    const len = props.shapes.length;
    if (len === 1) {
        const e = props.context.editor4Shape(props.context.selection.selectedShapes[0]);
        e.deleteShadow(_idx)
    } else if (len > 1) {
        const actions = get_actions_shadow_delete(props.shapes, _idx);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.shapesDeleteShadow(actions);
        }
    }
    hidden_selection(props.context);
}

function toggleVisible(idx: number) {
    const _idx = shadows.length - idx - 1;
    const len = props.shapes.length;
    const shadow = shadows[idx].shadow;
    const isEnabled = !shadow.isEnabled;
    if (len === 1) {
        const e = props.context.editor4Shape(props.context.selection.selectedShapes[0]);
        e.setShadowEnable(_idx, isEnabled)
    } else if (len > 1) {
        const actions = get_actions_shadow_enabled(props.shapes, _idx, isEnabled);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesShadowEnabled(actions);
        }
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
<div class="shadow-panel">
    <TypeHeader :title="t('shadow.shadow_stting')" class="mt-24" @click="first" :active="!!shadows.length">
        <template #tool>
            <div class="add" @click.stop="addShadow">
                <svg-icon icon-class="add"></svg-icon>
            </div>
        </template>
    </TypeHeader>
    <div class="tips-wrap" v-if="mixed">
        <span class="mixed-tips">{{ t('attr.mixed_lang') }}</span>
    </div>
    <div class="shadows-container" v-else-if="!mixed && shadows.length">
        <div class="shadow" v-for="(s, idx) in shadows" :key="s.id">
            <div :class="s.shadow.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible(idx)">
                <svg-icon v-if="s.shadow.isEnabled" icon-class="select"></svg-icon>
            </div>
            <div class="shadow_posi">
                <ShadowPositionItem :context="context" :shadow="s.shadow" :idx="idx" :length="shadows.length"
                                    :shapes="props.shapes" :reflush="reflush"></ShadowPositionItem>
            </div>
            <div class="detail">
                <ShadowDetail :context="props.context" :shadow="s.shadow" :idx="idx" :length="shadows.length"
                              :shapes="props.shapes" :reflush="reflush"></ShadowDetail>
            </div>
            <div class="delete" @click="deleteFill(idx)">
                <svg-icon icon-class="delete"></svg-icon>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped lang="scss">
.shadow-panel {
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

    .shadows-container {
        padding: 6px 0;

        .shadow {
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

            .shadow_posi {
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