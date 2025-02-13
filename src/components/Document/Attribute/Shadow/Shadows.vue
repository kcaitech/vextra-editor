<script setup lang="ts">
import add_icon from '@/assets/icons/svg/add.svg';
import select_icon from '@/assets/icons/svg/select.svg';
import delete_icon from '@/assets/icons/svg/delete.svg';
import style_icon from '@/assets/icons/svg/styles.svg';
import unbind_icon from '@/assets/icons/svg/unbind.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Context } from '@/context';
import { Color, Shadow, ShadowPosition, ShapeView, BasicArray, ShadowMask } from "@kcdesign/data";
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import ShadowDetail from './ShadowDetail.vue'
import { v4 } from 'uuid';
import ShadowPositionItem from './ShadowPosition.vue';
import {
    get_actions_add_mask,
    get_actions_add_shadow,
    get_actions_shadow_delete,
    get_actions_shadow_enabled,
    get_actions_shadow_mask,
    get_actions_shadow_unify,
    get_shadows
} from '@/utils/shape_style';
import { hidden_selection } from '@/utils/content';
import ShadowStyle from '@/components/Document/Attribute/Shadow/Lib/ShadowStyle.vue';
import { getShapesForStyle } from '@/utils/style';
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";

interface ShadowItem {
    id: number,
    shadow: Shadow
}

interface Props {
    context: Context;
    shapes: ShapeView[];
    selectionChange: number;
    trigger: any[];
}

const props = defineProps<Props>();
const { t } = useI18n();
const shadows: ShadowItem[] = reactive([]);
const mixed = ref<boolean>(false);
const reflush = ref<number>(0);
const mask = ref<boolean>(false)
const shadow = ref<ShadowMask>()

const shadowLibStatus = reactive<ElementStatus>({id: '#shadow-lib-panel', visible: false});
const shadowPanelStatusMgr = new ElementManager(
    props.context,
    shadowLibStatus,
    {whiteList: ['.shadow-container', '.shadow-style', '.shadow-left']}
);

function updateData() {
    shadows.length = 0;
    mixed.value = false;
    mask.value = false;
    shadow.value = undefined;
    const len = props.shapes.length;
    if (len === 1) {
        const shape = props.shapes[0];
        const _shadows = shape.getShadows();
        if (shape.style.shadowsMask) {
            const id = props.shapes[0].style.shadowsMask
            if (!id) return
            const libs = props.shapes[0].style.getStylesMgr()
            shadow.value = libs?.getSync(id) as ShadowMask
            return mask.value = true
        }

        for (let i = 0, len = _shadows.length; i < len; i++) {
            const shadow = _shadows[i];
            const s = { id: i, shadow };
            shadows.unshift(s);
        }
    } else if (len > 1) {
        const _shadows = get_shadows(props.shapes);
        if (_shadows === 'mixed') {
            mixed.value = true;
        } else if (_shadows === 'mask') {
            const id = props.shapes[0].style.shadowsMask
            if (!id) return
            const libs = props.shapes[0].style.getStylesMgr()
            shadow.value = libs?.getSync(id) as ShadowMask
            mask.value = true
        } else {
            shadows.push(..._shadows.reverse());
        }
    }
    reflush.value++;
}

function addShadow(): void {
    const len = props.shapes.length;
    const s = new Shadow(new BasicArray(), v4(), true, 10, new Color(0.3, 0, 0, 0), 0, 4, 0, ShadowPosition.Outer);
    if (len === 1) {
        const e = props.context.editor4Shape(props.context.selection.selectedShapes[0]);
        // e.addShadow(s);
    } else if (len > 1) {
        const page = props.context.selection.selectedPage;
        const mask = props.shapes.some(s => s.style.shadowsMask)
        if (!page) return;
        const editor = props.context.editor4Page(page);
        if (mixed.value) {
            if (mask) {
                const s = props.shapes.find(i => i.style.shadowsMask)
                const id = s?.style.shadowsMask as string
                const actions = get_actions_add_mask(props.shapes, id);
                editor.shapesSetShadowMask(actions);
            } else {
                const actions = get_actions_shadow_unify(props.shapes);
                editor.shapesShadowsUnify(actions);
            }
        } else {
            const actions = get_actions_add_shadow(props.shapes, s);
            editor.shapesAddShadow(actions);
        }
    }
    hidden_selection(props.context);
}

function first() {
    if (shadows.length === 0 && !mixed.value && !mask.value) addShadow();
}

function deleteFill(idx: number) {
    const _idx = shadows.length - idx - 1;
    const len = props.shapes.length;
    if (len === 1) {
        const e = props.context.editor4Shape(props.context.selection.selectedShapes[0]);
        // e.deleteShadow(_idx)
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
        // e.setShadowEnable(_idx, isEnabled)
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

const showShadowLibPanel = (e: MouseEvent) => {
    let ele: Element | null = e.target as Element;
    while (ele) {
        if (ele.classList.contains('shadow-left')) {
            shadowPanelStatusMgr.showBy(ele, {once: {offsetLeft: -264}});
            break;
        }
        if (ele.classList.contains('shadow-style')) {
            shadowPanelStatusMgr.showBy(ele, {once: {offsetLeft: -424}});
            break;
        }
        ele = ele.parentElement;
    }
}

const closeShadowLibPanel = () => {
    shadowPanelStatusMgr.close();
}

const delShadowMask = () => {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const shapes = getShapesForStyle(selected);
    const actions = get_actions_shadow_mask(shapes)
    const editor = props.context.editor4Page(page);
    editor.shapesDelShadowMask(actions);
}

const delStyleShadow = () => {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const shapes = getShapesForStyle(selected);
    const actions = get_actions_shadow_mask(shapes)
    const editor = props.context.editor4Page(page);
    editor.shapesDelStyleShadow(actions);
}

const stop1 = watch(() => props.trigger, v => v?.includes('style') && updateData());
const stop2 = watch(() => props.selectionChange, updateData);
onMounted(updateData);
onUnmounted(() => {
    stop1();
    stop2();
    shadowPanelStatusMgr.unmounted();
});
</script>
<template>
    <div class="shadow-panel">
        <TypeHeader :title="t('shadow.shadow')" @click="first" :active="!!shadows.length">
            <template v-if="!mask" #tool>
                <div v-if="!mixed" class="shadow-style" @click="showShadowLibPanel($event)">
                    <SvgIcon :icon="style_icon"/>
                </div>
                <div class="add" @click="addShadow">
                    <SvgIcon :icon="add_icon"/>
                </div>
            </template>
        </TypeHeader>
        <div class="tips-wrap" v-if="mixed && !mask">
            <span class="mixed-tips">{{ t('attr.mixed_lang') }}</span>
        </div>
        <div class="shadows-container" v-if="!mixed && shadows.length && !mask">
            <div class="shadow" v-for="(s, idx) in shadows" :key="s.shadow.id">
                <div :class="s.shadow.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible(idx)">
                    <SvgIcon v-if="s.shadow.isEnabled" :icon="select_icon"/>
                </div>
                <div class="shadow-position">
                    <ShadowPositionItem :context="context" :shadow="s.shadow" :idx="idx" :length="shadows.length"
                                        :shapes="props.shapes" :reflush="reflush"/>
                </div>
                <div class="detail">
                    <ShadowDetail :context="props.context" :shadow="s.shadow" :id:="s.shadow.id" :idx="idx"
                                  :length="shadows.length" :shapes="props.shapes" :reflush="reflush"/>
                </div>
                <div class="delete" @click="deleteFill(idx)">
                    <SvgIcon :icon="delete_icon"/>
                </div>
            </div>
        </div>
        <div class="shadow-mask" v-if="mask">
            <div class="info">
                <div class="shadow-left" @click="showShadowLibPanel($event)">
                    <div class="effect" :style="{
                        boxShadow: `
                        ${shadow?.shadows[0].position.includes('in') ? 'inset' : ''} 
                        ${shadow!.shadows[0].offsetX > 0 ? '1px' : shadow!.shadows[0].offsetX < 0 ? '-1px' : '0'} 
                        ${shadow!.shadows[0].offsetY > 0 ? '1px' : shadow!.shadows[0].offsetY < 0 ? '-1px' : '0'} 
                        ${shadow!.shadows[0].blurRadius > 0 ? '1px' : '0'}
                        ${shadow!.shadows[0].spread > 0 ? '1px' : '0'}
                        #0000004d
                        `}">
                    </div>
                    <div class="name">{{ shadow?.name }}</div>
                </div>
                <div class="unbind" @click.stop="delShadowMask">
                    <SvgIcon :icon="unbind_icon"/>
                </div>
            </div>
            <div class="delete-style" @click="delStyleShadow">
                <SvgIcon :icon="delete_icon"/>
            </div>
        </div>
        <ShadowStyle v-if="shadowLibStatus.visible" :context="props.context" :shapes="props.shapes" :id="shadow?.id"
                     @close="closeShadowLibPanel"/>
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

    .add,
    .shadow-style {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-radius: var(--default-radius);

        >img {
            width: 16px;
            height: 16px;
        }
    }

    .shadow-style img {
        padding: 2px;
        box-sizing: border-box;
    }

    .add:hover {
        background-color: #F5F5F5;
    }

    .shadow-style:hover {
        background-color: #F5F5F5;
    }

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

                >img {
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

            .shadow-position {
                flex: 1;
                height: 100%;
                margin-right: 5px;
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

                >svg {
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

    .shadow-mask {
        display: flex;
        height: 32px;
        border-radius: 6px;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
        gap: 8px;

        .info {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 6px;
            overflow: hidden;
            background-color: #f4f5f5;
            height: 100%;

            .shadow-left {
                flex: 1;
                display: flex;
                align-items: center;
                background-color: #F5F5F5;
                height: 100%;

                &:hover {
                    background-color: #e5e5e5;
                }

                .effect {
                    width: 16px;
                    height: 16px;
                    background-color: #fff;
                    border: 1px solid #000000e5;
                    border-radius: 3px;
                    overflow: hidden;
                    margin: 0 8px;
                }
            }

            .unbind {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 32px;

                >img {
                    width: 16px;
                    height: 16px;
                }
            }

            .unbind:hover {
                background-color: #e5e5e5;
            }
        }


        .delete-style {
            flex: 0 0 28px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 28px;
            height: 28px;
            border-radius: var(--default-radius);
            overflow: hidden;

            >img {
                width: 16px;
                height: 16px;
            }
        }

        .delete-style:hover {
            background-color: #F5F5F5;
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