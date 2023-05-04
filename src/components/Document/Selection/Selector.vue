<script setup lang="ts">
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { GroupShape, Shape } from '@kcdesign/data/data/shape';
import { defineProps, watchEffect, onMounted, onUnmounted } from 'vue';
import { XY } from '@/context/selection';
import { XYsBounding } from '@/utils/common';
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

// #region 判断线段p1q1与线段p2q2是否🍌
function isIntersect(p1: XY, q1: XY, p2: XY, q2: XY): boolean {
    const orientation1 = pointOrientation(p1, q1, p2);
    const orientation2 = pointOrientation(p1, q1, q2);
    const orientation3 = pointOrientation(p2, q2, p1);
    const orientation4 = pointOrientation(p2, q2, q1);

    if (orientation1 !== orientation2 && orientation3 !== orientation4) {
        return true;
    }
    if (orientation1 === 0 && isOnSegment(p1, p2, q1)) {
        return true;
    }
    if (orientation2 === 0 && isOnSegment(p1, q2, q1)) {
        return true;
    }
    if (orientation3 === 0 && isOnSegment(p2, p1, q2)) {
        return true;
    }
    if (orientation4 === 0 && isOnSegment(p2, q1, q2)) {
        return true;
    }
    return false;

    function pointOrientation(p1: XY, p2: XY, p3: XY) {
        const val = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);
        if (val == 0) {
            return 0;
        }
        return (val > 0) ? 1 : 2;

    }
    function isOnSegment(p: XY, q: XY, r: XY) {
        if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
            return true;
        }
        return false;
    }
}
// #endregion
// #region 判断形状是否被包涵
function isIncluded(selectorPoints: [XY, XY, XY, XY, XY], shapePoints: XY[]): boolean {
    const left = selectorPoints[0].x, top = selectorPoints[0].y, right = selectorPoints[2].x, bottom = selectorPoints[2].y;
    const { left: l, top: t, right: r, bottom: b } = XYsBounding(shapePoints);
    return l >= left && r <= right && t >= top && b <= bottom;
}
// 两个形状既不🍌也没有包含关系，返回false
function isTarget(selectorPoints: [XY, XY, XY, XY, XY], shapePoints: XY[]) {
    if (isIncluded(selectorPoints, shapePoints)) {
        return true
    }
    let s = 0;
    while (s < selectorPoints.length - 1) {
        const p1 = selectorPoints[s], q1 = selectorPoints[s + 1];

        if (shapePoints.length === 2) { // 线条
            if (isIntersect(p1, q1, shapePoints[0], selectorPoints[1])) {
                return true;
            }
        } else {
            for (let i = 0; i < shapePoints.length - 1; i++) {
                const p2 = shapePoints[i], q2 = shapePoints[i + 1];
                if (isIntersect(p1, q1, p2, q2)) {
                    return true;
                }
            }
        }
        s++;
    }
    return false;
}
// #endregion 
function select() {
    const pageMatirx = props.context.workspace.matrix;
    const page = props.context.selection.selectedPage;
    if (page) {
        const { top, left, width, height } = props.selectorFrame;
        const p1: XY = pageMatirx.inverseCoord(left, top); // lt
        const p2: XY = pageMatirx.inverseCoord(left + width, top); // rt
        const p3: XY = pageMatirx.inverseCoord(left + width, top + height); // rb
        const p4: XY = pageMatirx.inverseCoord(left, top + height); //lb
        const ps: [XY, XY, XY, XY, XY] = [p1, p2, p3, p4, p1]; // 5个点方便闭合循环
        deep(page.childs, ps);
        if (selectedShapes.length !== props.context.selection.selectedShapes.length) {
            props.context.selection.rangeSelectShape(selectedShapes);
        }
    }

    function deep(childs: Shape[], Points: [XY, XY, XY, XY, XY]) {
        let ids = 0;
        while (ids < childs.length) {
            if (selectedShapes.find(i => i.id === childs[ids].id)) {
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
}
function reset(t?: number) {
    if (t === WorkSpace.SELECTING) {
        selectedShapes.length = 0;
    }
}
watchEffect(select);
onMounted(() => {
    props.context.workspace.watch(reset);
    selectedShapes.length = 0;
})
onUnmounted(() => {
    props.context.workspace.unwatch(reset);
})
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