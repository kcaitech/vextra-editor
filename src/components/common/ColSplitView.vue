<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from "vue";
import Sash from "@/components/common/Sash.vue";
import { Context } from "@/context";
import { WorkSpace } from "@/context/workspace";

export interface SizeBound {
    width: number,
    minWidth: number,
    maxWidth: number,
}

interface SizeBoundEx extends SizeBound {
    userWidth: number // 用户调整的大小
}
interface Emits {
    (e: 'changeLeftWidth', width: number): void
}
interface Props {
    left: SizeBound
    right: number
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

const leftSize = ref<SizeBoundEx>(
    {
        width: 0, // 当前宽度
        minWidth: 0, // 根据props，root宽度计算的当前最小宽度
        maxWidth: 0, // 根据props，root宽度计算的当前最大宽度
        userWidth: 0
    }
);

function leftAdjust(saveWidth: number, offset: number) {
    let leftWidth = saveWidth + offset;
    if (leftWidth === leftSize.value.width) {
        return;
    }    
    if (leftWidth < leftSize.value.width) { // 往左拖动
        if (leftWidth <= leftSize.value.minWidth) {
            leftWidth = leftSize.value.minWidth;
        }
    }
    else { // 往右拖动
        // 如果左侧超出最大值，不可再拖动
        if (leftWidth >= leftSize.value.maxWidth) {
            leftWidth = leftSize.value.maxWidth;
        }
    }
    leftSize.value.width = leftWidth;
    emit('changeLeftWidth', leftWidth);
}

type AdjustsFun = { [key: string]: (saveWidth: number, offset: number) => void }
const adjustsFun: AdjustsFun = {
    "left": leftAdjust,
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

const leftCtx = createColumnCtx(leftSize.value, 'left');

const observer = new ResizeObserver(onSizeChange);
const refRoot = ref<HTMLDivElement>();
function getRootWidth(): number {
    return refRoot.value?.clientWidth || 500;
}

let savedRootWidth = 0;

function onSizeChange() {
    const rootWidth = getRootWidth();
    if (savedRootWidth === rootWidth) return;
    savedRootWidth = rootWidth;
    const leftMaxWidth = props.left.maxWidth * rootWidth;
    leftSize.value.minWidth = props.left.minWidth;
    leftSize.value.maxWidth = leftMaxWidth;
    leftSize.value.width = props.left.width;
}

function initSizeBounds() {
    const rootWidth = getRootWidth();
    savedRootWidth = rootWidth;
    leftSize.value.maxWidth = props.left.maxWidth * rootWidth;
    leftSize.value.minWidth = props.left.minWidth;
    leftSize.value.width = props.left.width;
}

const handle_left = (t: number | string) => {
    if (t === WorkSpace.CHANGE_NAVI) {
        const rootWidth = getRootWidth();
        if (leftSize.value.width !== 0) {
            props.context.workspace.matrix.trans(leftSize.value.width, 0)
        } else {
            const leftMinWidthImportant = Number((250 / rootWidth));
            const leftWidth = Math.min(leftMinWidthImportant, 0.1) * rootWidth
            props.context.workspace.matrix.trans(-leftWidth, 0)
        }
        props.context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    }
}

const transition = ref<string>('0.3s');

function init() {
    const root = refRoot.value as HTMLElement;
    if (!root) return;
    let timer: any = setTimeout(() => {
        transition.value = "none";
        clearTimeout(timer);
        timer = null;
    }, 500)
}

onMounted(() => {
    if (refRoot.value) observer.observe(refRoot.value);
    props.context.workspace.watch(handle_left);
    // init();
})
onUnmounted(() => {
    observer.disconnect();
    props.context.workspace.unwatch(handle_left);

})
watchEffect(initSizeBounds);
</script>

<template>
<div class="column-split" ref="refRoot">
    <div class="column1"
         :style="{width: leftSize.width+'px', 'min-width': leftSize.minWidth+'px','max-width':leftSize.maxWidth+'px'}">
        <slot name="slot1"/>
        <Sash side="right" @dragStart="leftCtx.onDragStart" @offset="leftCtx.onDragOffset"/>
    </div>
    <div class="column2">
        <slot name="slot2"/>
    </div>
    <div class="column3" :style="{ width:right+'px' }">
        <slot name="slot3"/>
    </div>
</div>
</template>

<style scoped lang="scss">
.column-split {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    position: relative;

    .column1 {
        position: relative;
        background-color: var(--theme-color-anti);
    }

    .column2 {
        position: relative;
        overflow: hidden;
        flex: 1;
    }

    .column3 {
        flex-shrink: 0;
        position: relative;
        background-color: var(--theme-color-anti);
    }
}
</style>