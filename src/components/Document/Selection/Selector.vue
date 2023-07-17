<script setup lang="ts">
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { Shape, ShapeType } from '@kcdesign/data';
import { watchEffect, onMounted, onUnmounted } from 'vue';
import { XY } from '@/context/selection';
import { isTarget } from '@/utils/common';
export interface SelectorFrame {
    top: number,
    left: number,
    width: number,
    height: number,
    includes: boolean
}
interface Props {
    selectorFrame: SelectorFrame,
    context: Context
}
const props = defineProps<Props>();
const selectedShapes: Map<string, Shape> = new Map();

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
        if (selectedShapes.size) remove(selectedShapes, ps); // 先剔除已经不再框选区的图形
        finder(page.childs, ps); // 再寻找框选区外的图形
        if (selectedShapes.size !== selection.selectedShapes.length) {
            selection.rangeSelectShape(Array.from(selectedShapes.values()));
        }
    }

}
// 加入
function finder(childs: Shape[], Points: [XY, XY, XY, XY, XY]) {
    let ids = 0;
    while (ids < childs.length) {
        const shape = childs[ids];
        if (selectedShapes.get(shape.id)) {
            ids++;
            continue;
        }
        if (shape.isLocked || !shape.isVisible) {
            ids++;
            continue;
        }
        const m = childs[ids].matrix2Root();
        const { width: w, height: h } = shape.frame;
        const ps: XY[] = [
            { x: 0, y: 0 },
            { x: w, y: 0 },
            { x: w, y: h },
            { x: 0, y: h },
            { x: 0, y: 0 },
        ].map(p => m.computeCoord(p.x, p.y));
        if (shape.type === ShapeType.Artboard) { // 容器的判定为真条件是完全被选区覆盖
            if (isTarget(Points, ps, true)) {
                selectedShapes.set(shape.id, shape);
                for (let i = 0; i < shape.childs.length; i++) {
                    selectedShapes.delete(shape.childs[i].id);
                }
            } else {
                finder(shape.childs, Points);
            }
            ids++;
            continue;
        }
        if (isTarget(Points, ps, props.selectorFrame.includes)) {
            selectedShapes.set(shape.id, shape);
        }
        ids++;
    }
}
// 剔除
function remove(childs: Map<string, Shape>, Points: [XY, XY, XY, XY, XY]) {
    childs.forEach((value, key) => {
        const m = value.matrix2Root();
        const { width: w, height: h } = value.frame;
        const ps: XY[] = [
            { x: 0, y: 0 },
            { x: w, y: 0 },
            { x: w, y: h },
            { x: 0, y: h },
            { x: 0, y: 0 },
        ].map(p => m.computeCoord(p.x, p.y));
        if (value.type === ShapeType.Artboard) {
            if (!isTarget(Points, ps, true)) {
                selectedShapes.delete(key);
            }
        } else {
            if (!isTarget(Points, ps, props.selectorFrame.includes)) {
                selectedShapes.delete(key);
            }
        }
    })
}

function reset(t?: number) {
    if (t === WorkSpace.SELECTING) {
        selectedShapes.clear();
    }
}
// hooks
onMounted(() => {
    props.context.workspace.watch(reset);
    selectedShapes.clear();
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
    border: 1px solid var(--active-color);
    background-color: rgba($color: #865dff, $alpha: 0.05);
}
</style>