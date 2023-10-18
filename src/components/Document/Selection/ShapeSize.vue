<script setup lang="ts">
import { Context } from '@/context';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { ClientXY, Selection } from "@/context/selection";
import { Matrix } from '@kcdesign/data';
import { WorkSpace } from '@/context/workspace';
import { XYsBounding } from '@/utils/common';
import { tr } from 'element-plus/es/locale';
interface Point {
    x: number
    y: number
}
interface Props {
    context: Context,
    controllerFrame: Point[],
}
const props = defineProps<Props>();

const shapeSize = ref({ w: 0, h: 0 });
const origin: ClientXY = { x: 0, y: 0 };
const trans = ref({ x: 0, y: 0 });
const rotate = ref(0);
const getShapePositionSize = () => {
    const shapes = props.context.selection.selectedShapes;
    const matrix = props.context.workspace.matrix
    if (shapes.length === 1) {
        const b = shapes[0].frame;
        let framePoint = [{ x: 0, y: 0 }, { x: b.width, y: 0 }, { x: b.width, y: b.height }, { x: 0, y: b.height }];
        const m = shapes[0].matrix2Root();
        shapeSize.value.w = framePoint[2].x;
        shapeSize.value.h = framePoint[2].y;
        m.multiAtLeft(matrix);
        framePoint = framePoint.map(p => m.computeCoord(p.x, p.y));
        origin.x = framePoint[0].x;
        origin.y = framePoint[0].y;
        trans.value.x = (b.width / 2);
        trans.value.y = b.height + 5;
        rotate.value = shapes[0].rotation || 0;
    } else if (shapes.length > 1) {
        const points: { x: number, y: number }[] = [];
        for (let index = 0; index < shapes.length; index++) {
            const s = shapes[index];
            const m = s.matrix2Root();
            m.multiAtLeft(matrix);
            const f = s.frame;
            const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => m.computeCoord(p.x, p.y));
            points.push(...ps);
        }
        const b = XYsBounding(points);
        const framePoint = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
        const lt = matrix.inverseCoord(b.left, b.top);
        const rb = matrix.inverseCoord(b.right, b.bottom);
        shapeSize.value.w = Math.abs(rb.x - lt.x);
        shapeSize.value.h = Math.abs(rb.y - lt.y);
        origin.x = framePoint[0].x;
        origin.y = framePoint[0].y;
        trans.value.x = ((b.right - b.left) / 2);
        trans.value.y = (b.bottom - b.top) + 5;

    }
}

function selectionWatcher(t: number) {
    if (t == Selection.CHANGE_SHAPE) {
        watchShapes();
        getShapePositionSize();
    }
}
const workspaceUpdate = (t: number) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        getShapePositionSize();
    } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        getShapePositionSize();
    }
}
const watchedShapes = new Map();
function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    const shapes = props.context.selection.selectedShapes;
    if (shapes) {
        shapes.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
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
const watcher = () => {
    getShapePositionSize();
}

const filterDecimals = (a: number) => {
    let alpha = Math.round(a * 100) / 100;
    if (Number.isInteger(alpha)) {
        return alpha.toFixed(0); // 返回整数形式
    } else if (Math.abs(alpha * 10 - Math.round(alpha * 10)) < Number.EPSILON) {
        return alpha.toFixed(1); // 保留一位小数
    } else {
        return alpha.toFixed(2); // 保留两位小数
    }
}

onMounted(() => {
    watchShapes();
    getShapePositionSize();
    props.context.selection.watch(selectionWatcher);
    props.context.workspace.watch(workspaceUpdate);
})
onUnmounted(() => {
    props.context.selection.unwatch(selectionWatcher);
    props.context.workspace.unwatch(workspaceUpdate);
})
</script>

<template>
    <div class="container-size" :style="{ top: `${origin.y}px`, left: `${origin.x}px` }">
        <div :style="{ transform: `translate(${trans.x}px, ${trans.y}px)` }">{{ filterDecimals(shapeSize.w) }} × {{
            filterDecimals(shapeSize.h) }}</div>
    </div>
</template>

<style scoped lang="scss">
.container-size {
    position: absolute;
    font-size: var(--font-default-fontsize);
    transform: translateX(-50%);

    >div {
        height: 25px;
        background-color: var(--active-color);
        border-radius: 4px;
        color: #fff;
        display: flex;
        align-items: center;
        padding: 0 10px;
    }
}
</style>