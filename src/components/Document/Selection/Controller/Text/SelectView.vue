<script setup lang='ts'>
import { Context } from '@/context';
import { TextShape } from '@kcdesign/data';
import { Matrix } from '@kcdesign/data';
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { Selection } from '@/context/selection';
import { genRectPath } from '../../common';
import { WorkSpace } from '@/context/workspace';
const props = defineProps<{
    shape: TextShape,
    matrix: number[],
    context: Context
}>();

const matrix = new Matrix();
const isCursor = ref(true);
const cursorPath = ref("");
const selectPath = ref("");
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
let cursor_points: { x: number, y: number }[] = [];

function update() {
    const selection = props.context.selection;
    // const m2p = props.shape.matrix2Root();
    // matrix.reset(m2p);
    // matrix.multiAtLeft(props.matrix);
    matrix.reset(props.matrix);
    const frame = props.shape.frame;
    const points = [
        { x: 0, y: 0 }, // left top
        { x: frame.width, y: 0 }, //right top
        { x: frame.width, y: frame.height }, // right bottom
        { x: 0, y: frame.height }, // left bottom
    ];

    const boundrect = points.map((point) => matrix.computeCoord(point.x, point.y));
    boundrectPath.value = genRectPath(boundrect);

    const p0 = boundrect[0];
    bounds.left = p0.x;
    bounds.top = p0.y;
    bounds.right = p0.x;
    bounds.bottom = p0.y;
    boundrect.reduce((bounds, point) => {
        if (point.x < bounds.left) bounds.left = point.x;
        else if (point.x > bounds.right) bounds.right = point.x;
        if (point.y < bounds.top) bounds.top = point.y;
        else if (point.y > bounds.bottom) bounds.bottom = point.y;
        return bounds;
    }, bounds)

    if (selection.cursorStart !== selection.cursorEnd) {
        isCursor.value = false;
        // selected range
        const start = selection.cursorStart;
        const end = selection.cursorEnd;
        selectPath.value = genRectPath(props.shape.text.locateRange(start, end).map((point) => matrix.computeCoord2(point.x, point.y)));
    } else {
        isCursor.value = true;
        // cursor
        const cursorAtBefore = selection.cursorAtBefore;
        const index = selection.cursorStart;
        const cursor = props.shape.text.locateCursor(index, cursorAtBefore);
        if (!cursor) {
            cursor_points = [];
            cursorPath.value = "";
        } else {
            cursor_points = cursor.cursorPoints.map((point) => matrix.computeCoord2(point.x, point.y))
            cursorPath.value = genCursorPath(cursor_points);
        }
    }
}
function selectionWatcher(...args: any[]) {
    if (args.indexOf(Selection.CHANGE_TEXT) >= 0) {
        update();
        cursor_tracking(cursor_points);
    }
    if (args.indexOf(Selection.CHANGE_SHAPE) >= 0) update();
}
watch(() => props.matrix, update);
watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})

onMounted(() => {
    const selection = props.context.selection;
    props.shape.watch(update);
    selection.watch(selectionWatcher);
    update();
})

onUnmounted(() => {
    const selection = props.context.selection;
    props.shape.unwatch(update);
    selection.unwatch(selectionWatcher);
})

function genCursorPath(cursor: { x: number, y: number }[]): string {
    if (cursor.length !== 2) return "";
    const p0 = cursor[0];
    const p1 = cursor[1];
    return "M " + p0.x + " " + p0.y + " L " + p1.x + " " + p1.y;
}
/**
 * @description 光标跟踪，移动页面以使焦点处于视口
 * @param p 光标上的一点
 */
function cursor_tracking(ps: { x: number, y: number }[]) {
    if (ps.length !== 2) return;
    const p0 = ps[0], p1 = ps[1];
    const workspace = props.context.workspace, root = workspace.root;
    let dx = 0, dy = 0, w = root.right - root.x, h = root.bottom - root.y, V = 24;
    if (p0.x > w) {
        dx = w - p0.x - V;
    } else if (p0.x < 0) {
        dx = V - p0.x;
    }
    if (p1.y > h) {
        dy = h - p1.y - V;
    } else if (p0.y < 0) {
        dy = V - p0.y;
    }
    if (dx || dy) {
        workspace.matrix.trans(dx, dy);
        workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    }
}
</script>
<template>
    <path v-if="isCursor" :d="cursorPath" fill="none" stroke='#865dff' stroke-width="2.5px" class="scan">
    </path>
    <path v-if="!isCursor" :d="selectPath" fill="#865dff" fill-opacity="0.35" stroke='none'></path>
</template>
<style lang='scss' scoped>
.scan {
    animation: scan 0.8s none infinite;
}

@keyframes scan {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}
</style>