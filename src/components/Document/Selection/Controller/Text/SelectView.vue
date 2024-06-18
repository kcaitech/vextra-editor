<script setup lang='ts'>
import { Context } from '@/context';
import { TableCellView, Text, TextShapeView } from '@kcdesign/data';
import { Matrix } from '@kcdesign/data';
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { Selection } from '@/context/selection';
import { genRectPath } from '../../common';
import { WorkSpace } from '@/context/workspace';
import { throttle } from '../../common';
import { TextSelectionLite } from "@/context/textselectionlite";
type SelectionLike = TextSelectionLite;
interface Props {
    shape: TextShapeView | TableCellView
    matrix: number[]
    context: Context
    mainNotify: string | number
    selection: SelectionLike
}
const props = defineProps<Props>();
// function getText(shape: TextShapeView | TableCellView): Text {
//     return shape.getText();
// }
const matrix = new Matrix();
const isCursor = ref(true);
const cursorPath = ref("");
const selectPath = ref("");
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
let cursor_points: { x: number, y: number }[] = [];
const update = throttle(_update, 5);
function _update() {
    if (!props.context.workspace.shouldSelectionViewUpdate) return;
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
    const text_selection = props.selection;
    if (text_selection.cursorStart !== text_selection.cursorEnd) {
        isCursor.value = false;
        // selected range
        const start = text_selection.cursorStart;
        const end = text_selection.cursorEnd;
        selectPath.value = genRectPath(props.shape.locateRange(start, end).map((point) => matrix.computeCoord3(point)));
    } else {
        isCursor.value = true;
        // cursor
        const cursorAtBefore = text_selection.cursorAtBefore;
        const index = text_selection.cursorStart;
        const cursor = props.shape.locateCursor(index, cursorAtBefore);
        if (!cursor) {
            cursor_points = [];
            cursorPath.value = "";
        } else {
            cursor_points = cursor.cursorPoints.map((point) => matrix.computeCoord2(point.x, point.y));
            cursorPath.value = genCursorPath(cursor_points);
        }
    }
}
function selectionWatcher(t: number | string) {
    if (t === props.mainNotify) {
        update();
        // cursor_tracking(cursor_points);  功能不完善，暂时关闭
    } else if (t === Selection.CHANGE_SHAPE || t === Selection.CHANGE_PAGE) {
        const text_selection = props.selection;
        text_selection.reset();
        cursorPath.value = "";
        selectPath.value = "";
    }
}
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
</script>

<template>
    <path v-if="isCursor" :d="cursorPath" fill="none" stroke='#1878f5' stroke-width="2.5px" class="scan">
    </path>
    <path v-if="!isCursor" :d="selectPath" fill="#1878f5" fill-opacity="0.35" stroke='none'></path>
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