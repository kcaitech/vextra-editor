<script setup lang='ts'>
import { Context } from '@/context';
import { layoutText, locateRange, locateCursor } from '@/layout/text';
import { TextShape } from '@kcdesign/data';
import { Matrix } from '@kcdesign/data/basic/matrix';
import { ref, reactive, onMounted, onUnmounted, defineProps, watch } from 'vue';
import { Selection } from '@/context/selection';
import { genRectPath, throttle } from './common';
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

const update = throttle(_update, 5);
function _update() {
    const selection = props.context.selection;
    // const m2p = props.shape.matrix2Page();
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
        const layout = props.shape.getLayout(layoutText);
        selectPath.value = genRectPath(locateRange(layout, start, end).map((point) => matrix.computeCoord(point.x, point.y)));
    } else {
        isCursor.value = true;
        // cursor
        const cursorAtBefore = selection.cursorAtBefore;
        const index = selection.cursorStart;
        const layout = props.shape.getLayout(layoutText);
        const cursor = locateCursor(layout, index, cursorAtBefore).map((point) => matrix.computeCoord(point.x, point.y));
        cursorPath.value = genCursorPath(cursor);
    }
}

function selectionWatcher(...args: any[]) {
    if (args.indexOf(Selection.CHANGE_TEXT) >= 0) update();
}

watch(() => props.matrix, () => {
    update();
})

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

</script>
<template>
    <path v-if="isCursor" :d="cursorPath" fill="none" stroke='blue' stroke-width="2px" class="scan" data-area="controller">
    </path>
    <path v-if="!isCursor" :d="selectPath" fill="blue" fill-opacity="0.5" stroke='none' data-area="controller"></path>
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