<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { Context } from "@/context";
import { Selection, XY } from "@/context/selection";
import { AutoLayout, BorderPosition, Shape, ShapeFrame, ShapeView, StackMode } from "@kcdesign/data";

const props = defineProps<{
    context: Context
}>();

function boundingBox(shape: Shape, includedBorder?: boolean): ShapeFrame {
    let frame = { ...shape.frame };
    if (includedBorder) {
        const borders = shape.getBorders();
        let maxtopborder = 0;
        let maxleftborder = 0;
        let maxrightborder = 0;
        let maxbottomborder = 0;
        borders.forEach(b => {
            if (b.isEnabled) {
                if (b.position === BorderPosition.Outer) {
                    maxtopborder = Math.max(b.sideSetting.thicknessTop, maxtopborder);
                    maxleftborder = Math.max(b.sideSetting.thicknessLeft, maxleftborder);
                    maxrightborder = Math.max(b.sideSetting.thicknessRight, maxrightborder);
                    maxbottomborder = Math.max(b.sideSetting.thicknessBottom, maxbottomborder);
                } else if (b.position === BorderPosition.Center) {
                    maxtopborder = Math.max(b.sideSetting.thicknessTop / 2, maxtopborder);
                    maxleftborder = Math.max(b.sideSetting.thicknessLeft / 2, maxleftborder);
                    maxrightborder = Math.max(b.sideSetting.thicknessRight / 2, maxrightborder);
                    maxbottomborder = Math.max(b.sideSetting.thicknessBottom / 2, maxbottomborder);
                }
            }
        })
        frame.x -= maxleftborder;
        frame.y -= maxtopborder;
        frame.width += maxleftborder + maxrightborder;
        frame.height += maxtopborder + maxbottomborder;
    }
    const m = shape.transform;
    const corners = [
        { x: frame.x, y: frame.y },
        { x: frame.x + frame.width, y: frame.y },
        { x: frame.x + frame.width, y: frame.y + frame.height },
        { x: frame.x, y: frame.y + frame.height }]
        .map((p) => m.computeCoord(p));
    const minx = corners.reduce((pre, cur) => Math.min(pre, cur.x), corners[0].x);
    const maxx = corners.reduce((pre, cur) => Math.max(pre, cur.x), corners[0].x);
    const miny = corners.reduce((pre, cur) => Math.min(pre, cur.y), corners[0].y);
    const maxy = corners.reduce((pre, cur) => Math.max(pre, cur.y), corners[0].y);
    return new ShapeFrame(minx, miny, maxx - minx, maxy - miny);
}

const insertPath = ref<string>();

function selectionWatcher(t: any, params?: any) {
    if (t === Selection.PRE_INSERT) {
        if (params) {
            const shape = params.shape as Shape;
            const layout: AutoLayout = params.layout;
            const env = params.env as ShapeView;
            const box = boundingBox(shape);
            const isEnd = params.isEnd as boolean;
            let end: XY;
            let start: XY;
            if (layout.stackMode === StackMode.Vertical) {
                let y = box.y - layout.stackCounterSpacing / 2;
                if (isEnd) {
                    y = box.y + box.height + layout.stackCounterSpacing / 2
                }
                start = { x: box.x, y };
                end = { x: box.x + box.width, y };
            } else {
                let x = box.x - layout.stackSpacing / 2
                if (isEnd) {
                    x = box.x + box.width + layout.stackSpacing / 2
                }
                start = { x, y: box.y };
                end = { x, y: box.y + box.height };
            }
            const m = env.matrix2Root();
            m.multiAtLeft(props.context.workspace.matrix);
            start = m.computeCoord3(start);
            end = m.computeCoord3(end);
            insertPath.value = `M${start.x} ${start.y} L${end.x} ${end.y}`;
        } else {
            insertPath.value = '';
        }
    }
}

onMounted(() => {
    props.context.selection.watch(selectionWatcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selectionWatcher);
})
</script>
<template>
<svg v-if="insertPath" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet"
     overflow="visible" width="100" height="100" viewBox="0 0 100 100"
     style="transform: translate(0px, 0px); position: absolute;pointer-events: none">
    <path v-if="insertPath" stroke="#3387f5" stroke-width="4" :d="insertPath" stroke-linecap="round"/>
</svg>
</template>