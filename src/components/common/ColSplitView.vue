<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watchEffect } from "vue";
import Sash from "@/components/common/Sash.vue";
import { Context } from "@/context";
import { WorkSpace } from "@/context/workspace";

export interface SizeBound {
    width: number,
    minWidth: number,
    maxWidth: number
}
interface Divide {
    left: SizeBoundEx
    middle: SizeBoundEx
    right: SizeBoundEx
}
interface SizeBoundEx extends SizeBound {
    userWidth: number // 用户调整的大小
}
interface Emits {
    (e: 'changeLeftWidth', width: number): void
}
interface Props {
    left: SizeBound
    middle: SizeBound
    right: SizeBound
    rightMinWidthInPx: number
    leftMinWidthInPx: number
    context: Context
}
interface Ctx {
    col: string,
    saveWidth: () => number,
    onDragStart: () => void,
    onDragOffset: (offset: number) => void
}
const emit = defineEmits<Emits>();
const props = defineProps<Props>();

const sizeBounds = reactive<Divide>(
    {
        left: {
            width: 0, // 当前宽度
            minWidth: 0, // 根据props，root宽度计算的当前最小宽度
            maxWidth: 0, // 根据props，root宽度计算的当前最大宽度
            userWidth: 0
        },
        middle: {
            width: 0,
            minWidth: 0,
            maxWidth: 0,
            userWidth: 0
        },
        right: {
            width: 0,
            minWidth: 0,
            maxWidth: 0,
            userWidth: 0
        },
    }
);

// let preOffset = 0;
function rightAdjust(saveWidth: number, offset: number) {
    const totalWidth = getRootWidth();

    let leftWidth = sizeBounds.left.width;
    let rightWidth = saveWidth - offset;
    let middleWidth = Math.max(totalWidth - leftWidth - rightWidth, 0);
    if (rightWidth === sizeBounds.right.width) {
        return;
    }
    if (rightWidth < sizeBounds.right.width) { // 往右
        if (rightWidth <= sizeBounds.right.minWidth) {
            rightWidth = sizeBounds.right.minWidth;
            middleWidth = Math.max(totalWidth - leftWidth - rightWidth, 0);
        }
        const delta = middleWidth - sizeBounds.middle.width;
        if (sizeBounds.left.userWidth > sizeBounds.left.width) {
            leftWidth = Math.min(sizeBounds.left.maxWidth, Math.max(sizeBounds.left.minWidth, leftWidth + delta));
            middleWidth = Math.max(totalWidth - leftWidth - rightWidth, 0);
        }
    }
    else { // 往左
        if (rightWidth >= sizeBounds.right.maxWidth) {
            rightWidth = sizeBounds.right.maxWidth;
            middleWidth = Math.max(totalWidth - leftWidth - rightWidth, 0);
        }
        if (middleWidth <= sizeBounds.middle.minWidth) {
            middleWidth = sizeBounds.middle.minWidth;
            leftWidth = Math.max(totalWidth - middleWidth - rightWidth, 0);
        }
    }
    sizeBounds.left.width = leftWidth;
    sizeBounds.right.width = rightWidth;
    sizeBounds.middle.width = middleWidth;
}

function leftAdjust(saveWidth: number, offset: number) {
    const totalWidth = getRootWidth();

    let leftWidth = saveWidth + offset;
    let rightWidth = sizeBounds.right.width;
    let middleWidth = Math.max(totalWidth - leftWidth - rightWidth, 0);

    if (leftWidth === sizeBounds.left.width) {
        return;
    }
    if (leftWidth < sizeBounds.left.width) { // 往左拖动
        if (leftWidth <= sizeBounds.left.minWidth) {
            leftWidth = sizeBounds.left.minWidth;
            middleWidth = Math.max(totalWidth - leftWidth - rightWidth, 0);
        }
        const delta = middleWidth - sizeBounds.middle.width;
        if (sizeBounds.right.userWidth > sizeBounds.right.width) {
            rightWidth = Math.min(sizeBounds.right.maxWidth, Math.max(sizeBounds.right.minWidth, rightWidth + delta));
            middleWidth = Math.max(totalWidth - leftWidth - rightWidth, 0);
        }
    }
    else { // 往右拖动
        // 如果左侧超出最大值，不可再拖动
        if (leftWidth >= sizeBounds.left.maxWidth) {
            leftWidth = sizeBounds.left.maxWidth;
            middleWidth = Math.max(totalWidth - leftWidth - rightWidth, 0);
        }
        if (middleWidth <= sizeBounds.middle.minWidth) {
            middleWidth = sizeBounds.middle.minWidth;
            rightWidth = Math.max(totalWidth - middleWidth - leftWidth, 0);
        }
    }
    sizeBounds.left.width = leftWidth;
    sizeBounds.right.width = rightWidth;
    sizeBounds.middle.width = middleWidth;
}

type AdjustsFun = { [key: string]: (saveWidth: number, offset: number) => void }
const adjustsFun: AdjustsFun = {
    "left": leftAdjust,
    "right": rightAdjust
}

function createColumnCtx(bound: SizeBoundEx, col: string): Ctx {
    let _saveWidth = 0;
    function saveWidth() {
        return _saveWidth;
    }
    function onDragStart() {
        _saveWidth = bound.width;
    }
    function onDragOffset(offset: number) {
        if (adjustsFun[col]) adjustsFun[col](_saveWidth, offset);
    }
    return {
        col,
        saveWidth,
        onDragStart,
        onDragOffset
    }
}

const leftCtx = createColumnCtx(sizeBounds.left, 'left');
const rightCtx = createColumnCtx(sizeBounds.right, 'right');

const observer = new ResizeObserver(onSizeChange);
const refRoot = ref<HTMLDivElement>();
function getRootWidth(): number {
    return refRoot.value?.clientWidth || 600;
}

let savedRootWidth = 0;

function onSizeChange() {
    const rootWidth = getRootWidth();
    if (savedRootWidth === rootWidth) return;
    const delta = rootWidth - savedRootWidth;

    const rigthMinWidthImportant = Number((props.rightMinWidthInPx / rootWidth));
    const leftMinWidthImportant = Number((props.leftMinWidthInPx / rootWidth));

    // sizeBounds.left.width = props.left.width * rootWidth;
    sizeBounds.left.minWidth = Math.max(leftMinWidthImportant, props.left.minWidth) * rootWidth;
    sizeBounds.left.maxWidth = props.left.maxWidth * rootWidth;
    // sizeBounds.middle.width = props.middle.width * rootWidth;
    sizeBounds.middle.minWidth = props.middle.minWidth * rootWidth;
    sizeBounds.middle.maxWidth = props.middle.maxWidth * rootWidth;
    // sizeBounds.right.width = props.right.width * rootWidth;
    sizeBounds.right.minWidth = Math.max(rigthMinWidthImportant, props.right.minWidth) * rootWidth;
    sizeBounds.right.maxWidth = props.right.maxWidth * rootWidth;

    let leftWidth = sizeBounds.left.width + (savedRootWidth ? sizeBounds.left.width / savedRootWidth * delta : 0);
    let rightWidth = sizeBounds.right.width + (savedRootWidth ? sizeBounds.right.width / savedRootWidth * delta : 0);

    leftWidth = Math.max(sizeBounds.left.minWidth, Math.min(sizeBounds.left.maxWidth, leftWidth));
    rightWidth = Math.max(sizeBounds.right.minWidth, Math.min(sizeBounds.right.maxWidth, rightWidth));
    // const middleWidth = Math.max(rootWidth - leftWidth - rightWidth, 0);
    savedRootWidth = rootWidth;

    // sizeBounds.left.width = leftWidth;
    // sizeBounds.right.width = rightWidth;
    const middleWidth = Math.max(rootWidth - sizeBounds.left.minWidth - sizeBounds.right.minWidth, 0);
    sizeBounds.left.width = sizeBounds.left.minWidth;
    sizeBounds.right.width = sizeBounds.right.minWidth;
    sizeBounds.middle.width = middleWidth;
}

function initSizeBounds() {
    const rootWidth = getRootWidth();
    savedRootWidth = rootWidth;

    const rigthMinWidthImportant = Number((props.rightMinWidthInPx / rootWidth));
    const leftMinWidthImportant = Number((props.leftMinWidthInPx / rootWidth));
    const middleMaxWidthImportant = 1 - (leftMinWidthImportant + rigthMinWidthImportant);

    sizeBounds.left.width = Math.max(props.left.width, leftMinWidthImportant) * rootWidth;
    sizeBounds.left.minWidth = Math.max(props.left.width, leftMinWidthImportant) * rootWidth;
    sizeBounds.left.maxWidth = props.left.maxWidth * rootWidth;

    sizeBounds.middle.width = Math.min(middleMaxWidthImportant, props.middle.width) * rootWidth;
    sizeBounds.middle.minWidth = props.middle.minWidth * rootWidth;
    sizeBounds.middle.maxWidth = Math.min(middleMaxWidthImportant, props.middle.width) * rootWidth;

    sizeBounds.right.width = Math.max(props.right.width, rigthMinWidthImportant) * rootWidth;
    sizeBounds.right.minWidth = Math.max(props.right.minWidth, rigthMinWidthImportant) * rootWidth;
    sizeBounds.right.maxWidth = props.right.maxWidth * rootWidth;
}

const handle_left = (t: number) => {
    if (t === WorkSpace.CHANGE_NAVI) {
        const rootWidth = getRootWidth();
        if (sizeBounds.left.width !== 0) {
            props.context.workspace.matrix.trans(sizeBounds.left.width, 0)
        } else {
            props.context.workspace.matrix.trans(-(0.1 * rootWidth), 0)
        }
        props.context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    }
}

onMounted(() => {
    if (refRoot.value) observer.observe(refRoot.value);
    props.context.workspace.watch(handle_left);
})
onUnmounted(() => {
    observer.disconnect();
    props.context.workspace.unwatch(handle_left);

})
watchEffect(initSizeBounds);
</script>

<template>
    <div class="columnsplit" ref="refRoot">
        <div class="column1" :style="`width:${sizeBounds.left.width}px; minWidth:${sizeBounds.left.width}px`">
            <slot name="slot1" />
            <Sash side="right" @dragStart="leftCtx.onDragStart" @offset="leftCtx.onDragOffset" />
        </div>
        <div class="column2" :style="`width:${sizeBounds.middle.width}px; minWidth:${sizeBounds.middle.width}px`">
            <slot name="slot2" />
        </div>
        <div class="column3" :style="`width:${sizeBounds.right.width}px; minWidth:${sizeBounds.right.width}px`">
            <slot name="slot3" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.columnsplit {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    position: relative;

    .column1 {
        position: relative;
        margin-top: 50px;
    }

    .column2 {
        position: relative;
        overflow: hidden;
    }

    .column3 {
        position: relative;
    }
}
</style>