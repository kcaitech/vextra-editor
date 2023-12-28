<script lang="ts" setup>
import { Context } from '@/context';
import { Shape, ShapeView } from '@kcdesign/data';
import { PositonAdjust } from "@kcdesign/data";
import { computed, onMounted, onUnmounted } from 'vue';
import { align_left, align_cneter_x, align_right, align_top, align_cneter_y, align_bottom, distribute_horizontally, vertical_uniform_distribution } from '@/utils/arrange';
import { WorkSpace } from '@/context/workspace';
import { useI18n } from 'vue-i18n';
import Tooltip from '@/components/common/Tooltip.vue';
import { Arrange } from '@/context/arrange';
interface Props {
    context: Context
    shapes: ShapeView[]
}
const props = defineProps<Props>();
const len = computed<number>(() => props.shapes.length);
const { t } = useI18n()
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
    props.context.workspace.notify(WorkSpace.CLAC_ATTRI);
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
    props.context.workspace.notify(WorkSpace.CLAC_ATTRI);
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
    props.context.workspace.notify(WorkSpace.CLAC_ATTRI);
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
    props.context.workspace.notify(WorkSpace.CLAC_ATTRI);
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
    props.context.workspace.notify(WorkSpace.CLAC_ATTRI);
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
    props.context.workspace.notify(WorkSpace.CLAC_ATTRI);
}
function space_around_h() {
    if (len.value < 3) return;
    const page = props.context.selection.selectedPage;
    const actions = distribute_horizontally(props.shapes);
    if (actions && page) {
        const editor = props.context.editor4Page(page);
        if (actions.find(i => i.transX !== 0)) {
            editor.arrange(actions);
        }
    }
    props.context.workspace.notify(WorkSpace.CLAC_ATTRI);
}
function space_around_v() {
    if (len.value < 3) return;
    const page = props.context.selection.selectedPage;
    const actions = vertical_uniform_distribution(props.shapes);
    if (actions && page) {
        const editor = props.context.editor4Page(page);
        if (actions.find(i => i.transY !== 0)) {
            editor.arrange(actions);
        }
    }
    props.context.workspace.notify(WorkSpace.CLAC_ATTRI);
}
function keyboard_wather(e: KeyboardEvent) {
    const { altKey, shiftKey, code, target } = e;
    if (target instanceof HTMLInputElement) return;
    if (altKey) {
        if (code === 'KeyA') {
            e.preventDefault();

        } else if (code === 'KeyH') {
            if (shiftKey) {
                e.preventDefault();
                space_around_h();
            } else {
                e.preventDefault();
                justify_midle_h();
            }
        } else if (code === 'KeyD') {
            e.preventDefault();
            flex_end();
        } else if (code === 'KeyW') {
            e.preventDefault();
            flex_start_col();
        } else if (code === 'KeyV') {
            if (shiftKey) {
                e.preventDefault();
                space_around_v();
            } else {
                e.preventDefault();
                justify_midle_v();
            }
        } else if (code === 'KeyS') {
            e.preventDefault();
            flex_end_col();
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
            justify_midle_h();
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
            justify_midle_v();
            break;
        case Arrange.FLEX_END_COL:
            flex_end_col();
            break;
        default:
            break;
    }
}
onMounted(() => {
    props.context.arrange.watch(arrange_watcher);
})
onUnmounted(() => {
    props.context.arrange.unwatch(arrange_watcher);
})
</script>
<template>
    <div class="container">
        <Tooltip :content="t('home.align_left')" :offset="15">
            <div class="item" @click="flex_start">
                <svg-icon icon-class="flex-start"></svg-icon>
            </div>
        </Tooltip>
        <Tooltip :content="t('home.align_h_c')" :offset="15">
            <div class="item" @click="justify_midle_h">
                <svg-icon icon-class="justify-midle-h"></svg-icon>
            </div>
        </Tooltip>
        <Tooltip :content="t('home.align_right')" :offset="15">
            <div class="item" @click="flex_end">
                <svg-icon icon-class="flex-end"></svg-icon>
            </div>
        </Tooltip>
        <Tooltip :content="t('home.align_top')" :offset="15">
            <div class="item" @click="flex_start_col">
                <svg-icon icon-class="flex-start-col"></svg-icon>
            </div>
        </Tooltip>
        <Tooltip :content="t('home.align_v_c')" :offset="15">
            <div class="item" @click="justify_midle_v">
                <svg-icon icon-class="justify-midle-v"></svg-icon>
            </div>
        </Tooltip>
        <Tooltip :content="t('home.align_bottom')" :offset="15">
            <div class="item" @click="flex_end_col">
                <svg-icon icon-class="flex-end-col"></svg-icon>
            </div>
        </Tooltip>
        <Tooltip :content="t('home.distribute_h')" :offset="15">
            <div :class="len > 2 ? 'item' : 'disable'" @click="space_around_h">
                <svg-icon icon-class="space-around-h"></svg-icon>
            </div>
        </Tooltip>
        <Tooltip :content="t('home.distribute_v')" :offset="15">
            <div :class="len > 2 ? 'item' : 'disable'" @click="space_around_v">
                <svg-icon icon-class="space-around-v"></svg-icon>
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
    width: 40px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1;

    >svg {
        color: var(--theme-color);
        width: 28px;
        height: 28px;
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
    opacity: 0.3;

    >svg {
        width: 28px;
        height: 28px;
    }
}
</style>