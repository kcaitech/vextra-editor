/*
* Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
*
* This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
* The full license text can be found in the LICENSE file in the root directory of this source tree.
*
* For more information about the AGPL-3.0 license, please visit:
* https://www.gnu.org/licenses/agpl-3.0.html
*/

<script lang="ts" setup>
import { Context } from '@/context';
import { ArtboardView, ShapeType, ShapeView, SymbolView } from '@kcdesign/data';
import { PositionAdjust } from "@kcdesign/data";
import { onMounted, onUnmounted, watch } from 'vue';
import {
    align_left,
    align_center_x,
    align_right,
    align_top,
    align_center_y,
    align_bottom,
    distribute_horizontally,
    vertical_uniform_distribution,
    is_container,
    align_left_relative,
    align_center_x_relative,
    align_right_relative,
    align_top_relative,
    align_center_y_relative,
    align_bottom_relative
} from '@/utils/arrange';
import { useI18n } from 'vue-i18n';
import Tooltip from '@/components/common/Tooltip.vue';
import { Arrange } from '@/context/arrange';
import { reactive } from 'vue';
import { throttle } from 'lodash';
import { string_by_sys } from "@/utils/common";
import SvgIcon from '@/components/common/SvgIcon.vue';
import flex_start_icon from '@/assets/icons/svg/flex-start.svg';
import justify_middle_h_icon from '@/assets/icons/svg/justify-midle-h.svg';
import flex_end_icon from '@/assets/icons/svg/flex-end.svg';
import flex_start_col_icon from '@/assets/icons/svg/flex-start-col.svg';
import justify_middle_v_icon from '@/assets/icons/svg/justify-midle-v.svg';
import flex_end_col_icon from '@/assets/icons/svg/flex-end-col.svg';
import space_around_h_icon from '@/assets/icons/svg/space-around-h.svg';
import space_around_v_icon from '@/assets/icons/svg/space-around-v.svg';

type Props = {
    context: Context;
    shapes: ShapeView[];
    trigger: any[];
    selectionChange: number;
}

const props = defineProps<Props>();
const { t } = useI18n();
const model_enable = reactive<{ hv: boolean, o: boolean }>({ hv: false, o: false });

// 靠左对齐
function flex_start() {
    if (!model_enable.o) {
        return;
    }
    const actions: PositionAdjust[] = align_left(props.shapes);
    // const actions: PositionAdjust[] = align_left_relative(props.shapes);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        if (actions.find(i => i.transX !== 0)) {
            editor.arrange(actions);
        }
    }
}

// 水平线对齐
function justify_middle_h() {
    if (!model_enable.o) return;
    const actions: PositionAdjust[] = align_center_x(props.shapes);
    // const actions: PositionAdjust[] = align_center_x_relative(props.shapes);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        if (actions.find(i => i.transX !== 0)) {
            editor.arrange(actions);
        }
    }
}

// 靠右对齐
function flex_end() {
    if (!model_enable.o) return;
    const actions: PositionAdjust[] = align_right(props.shapes);
    // const actions: PositionAdjust[] = align_right_relative(props.shapes);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        if (actions.find(i => i.transX !== 0)) {
            editor.arrange(actions);
        }
    }
}

// 靠顶部对齐
function flex_start_col() {
    if (!model_enable.o) return;
    const actions: PositionAdjust[] = align_top(props.shapes);
    // const actions: PositionAdjust[] = align_top_relative(props.shapes);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        if (actions.find(i => i.transY !== 0)) {
            editor.arrange(actions);
        }
    }
}

// 中线对齐
function justify_middle_v() {
    if (!model_enable.o) return;
    const actions: PositionAdjust[] = align_center_y(props.shapes);
    // const actions: PositionAdjust[] = align_center_y_relative(props.shapes);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        if (actions.find(i => i.transY !== 0)) {
            editor.arrange(actions);
        }
    }
}

// 靠底部对齐
function flex_end_col() {
    if (!model_enable.o) return;
    const actions: PositionAdjust[] = align_bottom(props.shapes);
    // const actions: PositionAdjust[] = align_bottom_relative(props.shapes);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        if (actions.find(i => i.transY !== 0)) {
            editor.arrange(actions);
        }
    }
}

function space_around_h() {
    if (!model_enable.hv) {
        return;
    }
    const page = props.context.selection.selectedPage;
    const actions = distribute_horizontally(props.shapes);
    if (actions && page) {
        const editor = props.context.editor4Page(page);
        if (actions.find(i => i.transX !== 0)) {
            editor.arrange(actions);
        }
    }
}

function space_around_v() {
    if (!model_enable.hv) {
        return;
    }
    const page = props.context.selection.selectedPage;
    const actions = vertical_uniform_distribution(props.shapes);
    if (actions && page) {
        const editor = props.context.editor4Page(page);
        if (actions.find(i => i.transY !== 0)) {
            editor.arrange(actions);
        }
    }
}

function arrange_watcher(t: Number) {
    switch (t) {
        case Arrange.FLEX_START:
            flex_start();
            break;
        case Arrange.SPACE_AROUND_HOR:
            space_around_h();
            break;
        case Arrange.ITEMS_ALIGN:
            justify_middle_h();
            break;
        case Arrange.FLEX_END:
            flex_end();
            break;
        case Arrange.FLEX_START_COL:
            flex_start_col();
            break;
        case Arrange.SPACE_AROUND_VER:
            space_around_v();
            break;
        case Arrange.ITEMS_ALIGN_VER:
            justify_middle_v();
            break;
        case Arrange.FLEX_END_COL:
            flex_end_col();
            break;
        default:
            break;
    }
}

function _modify_model_disable() {
    reset_model();
    const selected = props.context.selection.selectedShapes;

    if (selected.length === 0) {
        return;
    }
    const first = selected[0];
    const first_p = first.parent;

    if (!first_p) {
        return;
    }

    if (selected.length === 1) {
        if (first_p.type !== ShapeType.Page) {
            model_enable.o = true;
        }
        if (is_container(first)) {
            model_enable.o = true;
            model_enable.hv = true;
        }
        if ((first as ArtboardView).autoLayout || (first_p as ArtboardView).autoLayout) {
            reset_model();
        }
        return;
    }
    const some = selected.some(s => (s as ArtboardView).autoLayout || (s.parent as ArtboardView).autoLayout);
    if (some) {
        return reset_model();
    }
    model_enable.o = true;

    if (selected.length > 2) {
        model_enable.hv = true;
    }
}

function reset_model() {
    model_enable.hv = false;
    model_enable.o = false;
}

const update = throttle(_modify_model_disable, 160, { leading: true });

const stop = watch(() => props.trigger, update); // 监听图层变化
const stop2 = watch(() => props.selectionChange, update); // 监听选区变化

let target: HTMLElement | null = null;

function relative() {
    if (!target) return;
    let allowed = false;
    const selected = props.context.selection.selectedShapes;
    for (const view of selected) {
        if (view.parent instanceof ArtboardView || view.parent instanceof SymbolView) {
            allowed = true;
            break;
        }
    }
    if (allowed) {
        target.style.border = '1px solid';
        target.style.boxSizing = 'border-box';
    }
}

function removeBorder() {
    if (target) {
        target.style.border = 'none';
        target = null;
    }
}

function keydown(event: KeyboardEvent) {
    if (event.shiftKey) {
        relative();
        document.addEventListener('keyup', keyup);
    }
}

function keyup(event: KeyboardEvent) {
    if (event.code === 'ShiftLeft') {
        removeBorder();
        document.removeEventListener('keyup', keyup);
    }
}

function mouseenter(event: MouseEvent) {
    target = (event.target as Element).closest('.item');
    if (target) {
        document.addEventListener('keydown', keydown);
    }
}

function mouseleave() {
    removeBorder();
}

onMounted(() => {
    _modify_model_disable();
    props.context.arrange.watch(arrange_watcher);
})
onUnmounted(() => {
    stop();
    stop2();
    props.context.arrange.unwatch(arrange_watcher);
})
</script>
<template>
    <div class="container">
        <Tooltip :content="`${t('home.align_left')} ${string_by_sys('Alt A')}`" :offset="15">
            <div :class="model_enable.o ? 'item' : 'disable'" @click="flex_start" @mouseenter="mouseenter"
                 @mouseleave="mouseleave">
                <SvgIcon :icon="flex_start_icon"/>
            </div>
        </Tooltip>
        <Tooltip :content="`${t('home.align_h_c')} ${string_by_sys('Alt H')}`" :offset="15">
            <div :class="model_enable.o ? 'item' : 'disable'" @click="justify_middle_h">
                <SvgIcon :icon="justify_middle_h_icon"/>
            </div>
        </Tooltip>
        <Tooltip :content="`${t('home.align_right')} ${string_by_sys('Alt D')}`" :offset="15">
            <div :class="model_enable.o ? 'item' : 'disable'" @click="flex_end">
                <SvgIcon :icon="flex_end_icon"/>
            </div>
        </Tooltip>
        <Tooltip :content="`${t('home.align_top')} ${string_by_sys('Alt W')}`" :offset="15">
            <div :class="model_enable.o ? 'item' : 'disable'" @click="flex_start_col">
                <SvgIcon :icon="flex_start_col_icon"/>
            </div>
        </Tooltip>
        <Tooltip :content="`${t('home.align_v_c')} ${string_by_sys('Alt V')}`" :offset="15">
            <div :class="model_enable.o ? 'item' : 'disable'" @click="justify_middle_v">
                <SvgIcon :icon="justify_middle_v_icon"/>
            </div>
        </Tooltip>
        <Tooltip :content="`${t('home.align_bottom')} ${string_by_sys('Alt S')}`" :offset="15">
            <div :class="model_enable.o ? 'item' : 'disable'" @click="flex_end_col">
                <SvgIcon :icon="flex_end_col_icon"/>
            </div>
        </Tooltip>
        <Tooltip :content="`${t('home.distribute_h')} ${string_by_sys('Shift Alt H')}`" :offset="15">
            <div :class="model_enable.hv ? 'item' : 'disable'" @click="space_around_h">
                <SvgIcon :icon="space_around_h_icon"/>
            </div>
        </Tooltip>
        <Tooltip :content="`${t('home.distribute_v')} ${string_by_sys('Shift Alt V')}`" :offset="15">
            <div :class="model_enable.hv ? 'item' : 'disable'" @click="space_around_v">
                <SvgIcon :icon="space_around_v_icon"/>
            </div>
        </Tooltip>
    </div>
</template>
<style scoped lang="scss">
.container {
    display: flex;
    justify-content: space-evenly;
    padding: 6px 8px 6px 8px;
    box-sizing: border-box;
    height: 40px;
    border-bottom: 1px solid #F0F0F0;
}

.item {
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1;
    border-radius: var(--default-radius);

    > svg {
        color: var(--theme-color);
        width: 28px;
        height: 28px;
    }
}

.item:hover {
    background-color: rgba(216, 216, 216, 0.4);
}

.disable {
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.3;

    > svg {
        width: 28px;
        height: 28px;
    }
}
</style>