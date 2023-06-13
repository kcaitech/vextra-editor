<script lang="ts" setup>
import { Context } from '@/context';
import { Shape } from '@kcdesign/data';
import { PositonAdjust } from "@kcdesign/data";
import { computed } from 'vue';
import { align_left, align_cneter_x, align_right, align_top, align_cneter_y, align_bottom, distribute_horizontally, vertical_uniform_distribution } from '@/utils/arrange';
interface Props {
    context: Context
    shapes: Shape[]
}
const props = defineProps<Props>();
const len = computed<number>(() => props.shapes.length);
// 靠左对齐
function flex_start() {
    const actions: PositonAdjust[] = align_left(props.shapes);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        if (actions.find(i => i.transX !== 0)) {
            editor.arrange(actions);
        }
    }
}
// 水平线对齐
function justify_midle_h() {
    const actions: PositonAdjust[] = align_cneter_x(props.shapes);
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
    const actions: PositonAdjust[] = align_right(props.shapes);
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
    const actions: PositonAdjust[] = align_top(props.shapes);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        if (actions.find(i => i.transY !== 0)) {
            editor.arrange(actions);
        }
    }
}
// 中线对齐
function justify_midle_v() {
    const actions: PositonAdjust[] = align_cneter_y(props.shapes);
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
    const actions: PositonAdjust[] = align_bottom(props.shapes);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        if (actions.find(i => i.transY !== 0)) {
            editor.arrange(actions);
        }
    }
}
function space_around_h() {
    if (len.value < 3) return;
    distribute_horizontally(props.shapes);
}
function space_around_v() {
    if (len.value < 3) return;
    vertical_uniform_distribution(props.shapes);
}
</script>
<template>
    <div class="container">
        <div class="item" @click="flex_start">
            <svg-icon icon-class="flex-start"></svg-icon>
        </div>
        <div class="item" @click="justify_midle_h">
            <svg-icon icon-class="justify-midle-h"></svg-icon>
        </div>
        <div class="item" @click="flex_end">
            <svg-icon icon-class="flex-end"></svg-icon>
        </div>
        <div class="item" @click="flex_start_col">
            <svg-icon icon-class="flex-start-col"></svg-icon>
        </div>
        <div class="item" @click="justify_midle_v">
            <svg-icon icon-class="justify-midle-v"></svg-icon>
        </div>
        <div class="item" @click="flex_end_col">
            <svg-icon icon-class="flex-end-col"></svg-icon>
        </div>
        <div :class="len > 2 ? 'item' : 'disable'" @click="space_around_h">
            <svg-icon icon-class="space-around-h"></svg-icon>
        </div>
        <div :class="len > 2 ? 'item' : 'disable'" @click="space_around_v">
            <svg-icon icon-class="space-around-v"></svg-icon>
        </div>
    </div>
</template>
<style scoped lang="scss">
.container {
    display: flex;
    justify-content: space-evenly;
    padding: 4px 10px 0 10px;
    box-sizing: border-box;
}

.item {
    width: 40px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;

    >svg {
        color: var(--theme-color);
        width: 70%;
        height: 70%;
    }
}

.item:hover {
    background-color: rgba(216, 216, 216, 0.4);
}

.disable {
    width: 40px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;

    >svg {
        color: var(--grey-dark);
        width: 70%;
        height: 70%;
    }
}
</style>