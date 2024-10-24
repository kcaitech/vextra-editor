<script setup lang="ts">
import { Matrix, ShapeView } from "@kcdesign/data";
import { XYsBounding } from "@/utils/common";
import { WorkSpace } from '@/context/workspace'
import { Selection } from '@/context/selection';
import { Context } from "@/context";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { genRectPath } from "../Selection/common";
import {
    CenterPoint,
    LintPoint,
    get_dotted_line_point,
    get_graph_relative_posi,
    get_solid_line_center_point,
    get_solid_line_point
} from "@/utils/label";

interface Props {
    context: Context
    matrix: Matrix
    updateTrigger: number
}

const props = defineProps<Props>();
const tracingPath = ref<string[]>([]);
const matrix = new Matrix();

const hover_shape_posi = ref<{ x: number, y: number }[]>([]);
const select_shape_posi = ref<{ x: number, y: number }[]>([]);

const solid_point = ref<LintPoint[]>([]);
const dotted_point = ref<LintPoint[]>([]);
const size_posi = ref<CenterPoint[]>([]);

// hover后给选中和hover的图形描边
const contour = () => {
    clearPoint();
    const selection = props.context.selection;
    const living = (selection.hoveredShape ? [selection.hoveredShape] : selection.labelLivingGroup || []);
    const fixed = selection.labelFixedGroup || selection.selectedShapes;
    if (!living.length || !fixed.length || (fixed.length === 1 && living.length === 1 && fixed[0].id === living[0].id)) return;

    matrix.reset(props.matrix);
    fixedContour(fixed);
    livingContour(living);
    solid_line_point(select_shape_posi.value, hover_shape_posi.value);
    dotted_line_point(select_shape_posi.value, hover_shape_posi.value);
}

const clearPoint = () => {
    tracingPath.value = [];
    solid_point.value = [];
    dotted_point.value = [];
    size_posi.value = [];
}

const fixedContour = (shapes: ShapeView[]) => {
    const points: { x: number, y: number }[] = [];
    for (let index = 0; index < shapes.length; index++) {
        const s = shapes[index];
        const m = s.matrix2Root();
        m.multiAtLeft(matrix);
        const f = s.frame;
        const x = f.x;
        const y = f.y;
        const r = x + f.width;
        const b = y + f.height;
        const ps: { x: number, y: number }[] = [{ x, y }, { x: r, y }, { x: r, y: b }, { x, y: b }].map(p => m.computeCoord3(p));
        points.push(...ps);
    }
    const b = XYsBounding(points);
    const framePoint = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
    select_shape_posi.value = framePoint.map(item => {
        item.x = +item.x.toFixed(4);
        item.y = +item.y.toFixed(4);
        return item;
    })
    const borPath = genRectPath(framePoint);
    tracingPath.value.push(borPath);
}

const livingContour = (shapes: ShapeView[]) => {
    const points: { x: number, y: number }[] = [];
    for (let index = 0; index < shapes.length; index++) {
        const s = shapes[index];
        const m = s.matrix2Root();
        m.multiAtLeft(matrix);
        const f = s.frame;
        const x = f.x;
        const y = f.y;
        const r = x + f.width;
        const b = y + f.height;
        const ps: { x: number, y: number }[] = [{ x, y }, { x: r, y }, { x: r, y: b }, { x, y: b }].map(p => m.computeCoord3(p));
        points.push(...ps);
    }
    const b = XYsBounding(points);
    const framePoint = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
    hover_shape_posi.value = framePoint.map(item => {
        item.x = +item.x.toFixed(4);
        item.y = +item.y.toFixed(4);
        return item;
    })
    const borPath = genRectPath(framePoint);
    tracingPath.value.push(borPath);
}

// 获取实线的点
const solid_line_point = (s: { x: number, y: number }[], h: { x: number, y: number }[]) => {
    const direction = get_graph_relative_posi(s, h);
    if (!direction) return;
    const point = get_solid_line_point(s, h, direction);
    if (point && point.length > 0) {
        solid_point.value = point;
        solid_line_center_point(point);
    }
}

// 获取虚线的点
const dotted_line_point = (s: { x: number, y: number }[], h: { x: number, y: number }[]) => {
    const direction = get_graph_relative_posi(s, h);
    if (!direction) return;
    const point = get_dotted_line_point(s, h, direction);
    if (point && point.length > 0) {
        dotted_point.value = point;
    }
}

// 获取实线的长度和位置
const solid_line_center_point = (point: LintPoint[]) => {
  size_posi.value = get_solid_line_center_point(point, props.context);
}


const workspaceUpdate = (t: number | string) => {
  if (t === WorkSpace.MATRIX_TRANSFORMATION || t === WorkSpace.SELECTION_VIEW_UPDATE) contour();
}

const selectionWatcher = (t: string | number) => {
  if (t === Selection.CHANGE_SHAPE || t === Selection.CHANGE_SHAPE_HOVER || t === Selection.PASSIVE_CONTOUR) contour();
}

const filterAlpha = (a: number) => {
    let alpha = Math.round(a * 100) / 100;
    if (Number.isInteger(alpha)) {
        return alpha.toFixed(0); // 返回整数形式
    } else if (Math.abs(alpha * 10 - Math.round(alpha * 10)) < Number.EPSILON) {
        return alpha.toFixed(1); // 保留一位小数
    } else {
        return alpha.toFixed(2); // 保留两位小数
    }
}

const stop = watch(() => props.updateTrigger, contour);

onMounted(() => {
    contour();
    props.context.workspace.watch(workspaceUpdate);
    props.context.selection.watch(selectionWatcher);
})
onUnmounted(() => {
    clearPoint();
    props.context.workspace.unwatch(workspaceUpdate);
    props.context.selection.unwatch(selectionWatcher);
    stop();
})
</script>

<template>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
     :height="100" viewBox="0 0 100 100" style="position: absolute;  pointer-events: none;">
    <path v-for="(p, i) in tracingPath" :key="i" :d="p" fill="transparent" stroke="#ff2200"></path>
    <line v-for="(p, i) in solid_point" :key="i" :x1="p.x1" :y1="p.y1" :x2="p.x2" :y2="p.y2"
          style="stroke:#ff2200;">
    </line>
    <line v-for="(p, i) in dotted_point" :key="i" :x1="p.x1" :y1="p.y1" :x2="p.x2" :y2="p.y2" stroke-dasharray="3 2"
          style="stroke:#ff2200;"></line>
</svg>
<template v-for="(item, index) in size_posi" :key="index">
        <span class="size" v-if="+item.length.toFixed(0) !== 0"
              :style="{ top: item.y + 'px', left: item.x + 'px', transform: `translate(-${item.tran.x}%,-${item.tran.y}%)` }">{{
                filterAlpha(item.length)
            }}</span>
</template>
</template>

<style scoped lang="scss">
.size {
    position: absolute;
    font-size: 12px;
    height: 25px;
    background-color: #ff2200;
    border-radius: 4px;
    color: #fff;
    padding: 0 5px;
    line-height: 2;
    z-index: 1;
}
</style>