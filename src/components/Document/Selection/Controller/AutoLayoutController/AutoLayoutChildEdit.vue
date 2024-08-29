<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { Context } from "@/context";
import { Selection, XY } from "@/context/selection";
import { adapt2Shape, ArtboradView, ColVector3D, layoutShapesOrder, makeShapeTransform2By1, Matrix, Path, ShapeView, XYsBounding } from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { genRectPath } from "../../common";
import { is_shape_in_selected } from "@/utils/scout";
import { AutoLayoutHandler } from "@/transform/autoLayout";
import { get_actions_frame_x } from "@/utils/attri_setting";


export interface Point {
    x: number
    y: number
}
interface Props {
    context: Context
}


const props = defineProps<Props>();
const dottedPaths = ref<{ path: string, shape: ShapeView | undefined }[]>([]);
const movePath = ref<string[]>([]);
const moveTrans = ref<Point>({ x: 0, y: 0 })
const movePathStroke = ref(false);
let autoLayoutModifyHandler: AutoLayoutHandler | undefined = undefined;
const multiplePath = ref<string>();

function workspace_watcher(t?: any) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        getDottedPaths();
    } else if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        getDottedPaths();
    }
}

function selectionWatcher(t: string | number) {
    if (t === Selection.CHANGE_SHAPE_HOVER) {
        getDottedPaths();
    } else if (t === Selection.CHANGE_SHAPE) {
        getDottedPaths();
    }
}

function hoverDottedPaths() {
    const hoveredShape: ShapeView | undefined = props.context.selection.hoveredShape;
    if (!hoveredShape) {
        return;
    }
    if (!(hoveredShape as ArtboradView).autoLayout) return;
    if (is_shape_in_selected(props.context.selection.selectedShapes, hoveredShape)) {
        return;
    }
    const childs = hoveredShape.childs;
    for (let i = 0; i < childs.length; i++) {
        const child = childs[i];
        const points: { x: number, y: number }[] = [];
        const matrix2 = new Matrix(props.context.workspace.matrix);
        const shape_root_m = child.matrix2Root();
        shape_root_m.multiAtLeft(matrix2);
        const f = child.frame;
        const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => shape_root_m.computeCoord(p.x, p.y));
        points.push(...ps);
        const b = XYsBounding(points);
        const framePoint = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
        const borPath = genRectPath(framePoint);
        dottedPaths.value.push({ path: borPath, shape: child });
    }
}

function selectDottedPaths() {
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) return;
    const parent = shapes[0].parent;
    if (!parent || !(parent as ArtboradView).autoLayout) return;
    const every = shapes.every(item => item.parent?.id === parent.id);
    if (!every) return;
    const points: { x: number, y: number }[] = [];
    const matrix2 = new Matrix(props.context.workspace.matrix);
    const shape_root_m = parent.matrix2Root();
    shape_root_m.multiAtLeft(matrix2);
    const f = parent.frame;
    const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => shape_root_m.computeCoord(p.x, p.y));
    points.push(...ps);
    const b = XYsBounding(points);
    const framePoint = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
    const borPath = genRectPath(framePoint);
    dottedPaths.value.push({ path: borPath, shape: undefined });
    getMovePath(shapes);
}

const getMovePath = (shapes: ShapeView[]) => {
    const matrix2 = new Matrix(props.context.workspace.matrix);
    const points: { x: number, y: number }[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const shape_root_m = shape.matrix2Root();
        const m = makeShapeTransform2By1(shape_root_m.clone()).clone();
        const clientTransform = makeShapeTransform2By1(matrix2);
        m.addTransform(clientTransform); //root到视图
        const { x, y, width, height } = shape.frame;
        const { col0, col1, col2, col3 } = m.transform([
            ColVector3D.FromXY(x, y),
            ColVector3D.FromXY(x + width, y),
            ColVector3D.FromXY(x + width, y + height),
            ColVector3D.FromXY(x, y + height),
        ]);
        const borPath = genRectPath([{ x: col0.x + 2, y: col0.y + 2 }, { x: col1.x - 2, y: col1.y + 2 }, { x: col2.x - 2, y: col2.y - 2 }, { x: col3.x + 2, y: col3.y - 2 }]);
        movePath.value.push(borPath);
        shape_root_m.multiAtLeft(matrix2);
        const f = shape.frame;
        const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => shape_root_m.computeCoord(p.x, p.y));
        points.push(...ps);
    }
    const b = XYsBounding(points);
    const framePoint = [{ x: b.left + 2, y: b.top + 2 }, { x: b.right - 2, y: b.top + 2 }, { x: b.right - 2, y: b.bottom - 2 }, { x: b.left + 2, y: b.bottom - 2 }];
    multiplePath.value = genRectPath(framePoint);
}

let downClientXY: XY = { x: 0, y: 0 };
let isDragging: boolean = false;

const getDottedPaths = () => {
    dottedPaths.value = [];
    movePath.value = [];
    multiplePath.value = undefined;
    selectDottedPaths();
    hoverDottedPaths();
}
const mousedown = (e: MouseEvent) => {
    e.stopPropagation();
    downClientXY.x = e.clientX;
    downClientXY.y = e.clientY;
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}
function mousemove(e: MouseEvent) {
    e.stopPropagation();

    if (isDragging && movePathStroke.value) {
        const shapes = props.context.selection.selectedShapes;
        if (!shapes.length) return;
        const parent = shapes[0].parent;
        if (!parent) return;
        const p = props.context.workspace.getContentXY(e);
        const matrix = props.context.workspace.matrix;
        const m = new Matrix(matrix.inverse);
        const xy = m.computeCoord(p);
        const target = props.context.selection.getShapesByXY(xy, true, [parent, ...parent.childs]);
        if (target && target.id !== parent.id) {
            const isTarget = shapes.find(item => item.id === target.id);
            if (!autoLayoutModifyHandler || isTarget) {
                return
            }
            if (!autoLayoutModifyHandler.asyncApiCaller) {
                autoLayoutModifyHandler.createApiCaller();
            }
            const shape_row: ShapeView[] = [];
            const shape_rows = layoutShapesOrder(parent.childs);
            shape_rows.forEach(item => shape_row.push(...item));
            const cur_index = shape_row.findIndex(item => item.id === shapes[0].id);
            const tar_index = shape_row.findIndex(item => item.id === target.id);
            const targetXY = target.data;
            const transx = cur_index > tar_index ? targetXY.x - 1 : targetXY.x + 1;
            const transy = cur_index > tar_index ? targetXY.y - 1 : targetXY.y + 1;
            autoLayoutModifyHandler.executeSwap(parent, shapes, transx, transy);
        }

        const transx = e.clientX - downClientXY.x;
        const transy = e.clientY - downClientXY.y;
        moveTrans.value = { x: transx, y: transy }
    } else {
        const diff = Math.hypot(e.clientX - downClientXY.x, e.clientY - downClientXY.y);
        if (diff > 4) {
            isDragging = true;
            autoLayoutModifyHandler = new AutoLayoutHandler(props.context, e);
            movePathStroke.value = true;
        }
    }
}

function mouseup(e: MouseEvent) {
    e.stopPropagation();
    isDragging = false;
    movePathStroke.value = false;
    moveTrans.value = { x: 0, y: 0 }
    autoLayoutModifyHandler?.fulfil();
    autoLayoutModifyHandler = undefined;
    movePath.value = [];
    multiplePath.value = undefined;
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

// hooks

onMounted(() => {
    props.context.selection.watch(selectionWatcher);
    props.context.workspace.watch(workspace_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selectionWatcher);
    props.context.workspace.unwatch(workspace_watcher);
})
</script>

<template>
    <!-- 描边 -->
    <svg v-if="dottedPaths.length" version="1.1" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xhtml="http://www.w3.org/1999/xhtml"
        preserveAspectRatio="xMinYMin meet" overflow="visible" width="100" height="100" viewBox="0 0 100 100"
        style="transform: translate(0px, 0px); position: absolute;">
        <path v-for="(path, index) in dottedPaths" :key="index" class="dotted-rect" :d="path.path" />
        <path v-if="multiplePath && movePath.length > 1" class="dotted-move" :d="multiplePath"
            :style="{ transform: `translate(${moveTrans.x}px, ${moveTrans.y}px)` }" @mousedown="(e) => mousedown(e)" />
        <path v-if="movePath.length" v-for="(path, index) in movePath" :key="index" class="dotted-move" :d="path"
            :class="{ 'move-path-fill': movePathStroke }"
            :style="{ transform: `translate(${moveTrans.x}px, ${moveTrans.y}px)` }" ref="movePathEl"
            @mousedown="(e) => mousedown(e)" />
    </svg>
</template>

<style scoped lang="scss">
.dotted-rect {
    fill: none;
    stroke-width: 1px;
    stroke: #1878F5;
    stroke-dasharray: 2, 2;
}

.dotted-move {
    fill: transparent;
    stroke-width: 1px;
    stroke: transparent;
    stroke-dasharray: 2, 2;
}

.move-path-fill {
    stroke: #1878F5;
}
</style>