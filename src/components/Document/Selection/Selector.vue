<script setup lang="ts">
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { Shape } from '@kcdesign/data';
import { watchEffect, onMounted, onUnmounted } from 'vue';
import { XY } from '@/context/selection';
import { isTarget } from '@/utils/common';
export interface SelectorFrame {
    top: number,
    left: number,
    width: number,
    height: number
}
interface Props {
    selectorFrame: SelectorFrame,
    context: Context
}
const props = defineProps<Props>();
const selectedShapes: Shape[] = [];

function select() {
    const pageMatirx = props.context.workspace.matrix;
    const page = props.context.selection.selectedPage;
    const selection = props.context.selection;
    if (page) {
        const { top, left, width, height } = props.selectorFrame;
        const p1: XY = pageMatirx.inverseCoord(left, top); // lt
        const p2: XY = pageMatirx.inverseCoord(left + width, top); // rt
        const p3: XY = pageMatirx.inverseCoord(left + width, top + height); // rb
        const p4: XY = pageMatirx.inverseCoord(left, top + height); //lb
        const ps: [XY, XY, XY, XY, XY] = [p1, p2, p3, p4, p1]; // 5个点方便闭合循环
        remove(selectedShapes, ps);
        finder(page.childs, ps);
        if (selectedShapes.length !== selection.selectedShapes.length) {
            selection.rangeSelectShape(selectedShapes);
        }
    }

}
// 加入
function finder(childs: Shape[], Points: [XY, XY, XY, XY, XY]) {
    let ids = 0;
    while (ids < childs.length) {
        if (selectedShapes.find(i => i.id === childs[ids].id)) {
            ids++;
            continue;
        }
        if (childs[ids].isLocked || !childs[ids].isVisible) {
            ids++;
            continue;
        }
        const m = childs[ids].matrix2Page();
        const { width: w, height: h } = childs[ids].frame;
        const ps: XY[] = [
            { x: 0, y: 0 },
            { x: w, y: 0 },
            { x: w, y: h },
            { x: 0, y: h },
            { x: 0, y: 0 },
        ].map(p => m.computeCoord(p.x, p.y));
        if (isTarget(Points, ps)) {
            selectedShapes.push(childs[ids]);
        }
        ids++;
    }
}
// 剔除
function remove(childs: Shape[], Points: [XY, XY, XY, XY, XY]) {
    let ids = 0;
    while (ids < childs.length) {
        const m = childs[ids].matrix2Page();
        const { width: w, height: h } = childs[ids].frame;
        const ps: XY[] = [
            { x: 0, y: 0 },
            { x: w, y: 0 },
            { x: w, y: h },
            { x: 0, y: h },
            { x: 0, y: 0 },
        ].map(p => m.computeCoord(p.x, p.y));
        if (!isTarget(Points, ps)) {
            selectedShapes.splice(ids, 1);
        }
        ids++;
    }
}

function reset(t?: number) {
    if (t === WorkSpace.SELECTING) {
        selectedShapes.length = 0;
    }
}
// hooks
onMounted(() => {
    props.context.workspace.watch(reset);
    selectedShapes.length = 0;
})
onUnmounted(() => {
    props.context.workspace.unwatch(reset);
})
watchEffect(select);
</script>
<template>
    <div class="selector"
        :style="{ top: `${props.selectorFrame.top}px`, left: `${props.selectorFrame.left}px`, width: `${props.selectorFrame.width}px`, height: `${props.selectorFrame.height}px` }">
    </div>
</template>
<style scoped lang="scss">
.selector {
    position: absolute;
    border: 1px solid #2561D9;
    background-color: rgba($color: #2561D9, $alpha: 0.05);
}
</style>