<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { Context } from "@/context";
import { Selection, XY } from "@/context/selection";
import {
    ArtboardView,
    BorderPosition,
    ColVector3D,
    makeShapeTransform2By1,
    Matrix,
    Path,
    ShapeView,
    XYsBounding
} from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { genRectPath } from "../../common";
import { is_shape_in_selected } from "@/utils/scout";
import { flattenShapes } from "@/utils/content";

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
const multiplePath = ref<string>();

function workspace_watcher(t?: any) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        getDottedPaths();
    } else if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        getDottedPaths();
    }
}

let downClientXY: XY = { x: 0, y: 0 };

const insertPath = ref<string>();

function selectionWatcher(t: any, params?: any) {
    if (t === Selection.CHANGE_SHAPE_HOVER) {
        getDottedPaths();
    } else if (t === Selection.CHANGE_SHAPE) {
        getDottedPaths();
        watch_shapes();
    } else if (t === Selection.LAYOUT_DOTTED_LINE) {
        if (params) {
            movePathStroke.value = true;
            downClientXY = params;
        } else {
            movePathStroke.value = false;
            moveTrans.value = { x: 0, y: 0 }
            multiplePath.value = undefined;
            getDottedPaths();
        }
    } else if (t === Selection.LAYOUT_DOTTED_LINE_MOVE) {
        if (params) {
            const transx = params.x - downClientXY.x;
            const transy = params.y - downClientXY.y;
            moveTrans.value = { x: transx, y: transy }
        }
    } else if (t === Selection.UPDATE_LAYOUT_DOTTED_LINE) {
        if (params) updateDottedPath(params);
    }
}

const updateDottedPath = (downXY: XY) => {
    getDottedPaths();
    movePathStroke.value = true;
    downClientXY = downXY;
}

function hoverDottedPaths() {
    const hoveredShape: ShapeView | undefined = props.context.selection.hoveredShape;
    if (!hoveredShape) return;
    if (!(hoveredShape as ArtboardView).autoLayout) return;
    if (is_shape_in_selected(props.context.selection.selectedShapes, hoveredShape)) return;
    const bordersTakeSpace = (hoveredShape as ArtboardView).autoLayout?.bordersTakeSpace;
    const childs = hoveredShape.childs;
    for (let i = 0; i < childs.length; i++) {
        const child = childs[i];
        const points: { x: number, y: number }[] = [];
        const ps: { x: number, y: number }[] = getPoint(child, bordersTakeSpace);
        points.push(...ps);
        const b = XYsBounding(points);
        const framePoint = [
            { x: b.left, y: b.top },
            { x: b.right, y: b.top },
            { x: b.right, y: b.bottom },
            { x: b.left, y: b.bottom }
        ];
        const borPath = genRectPath(framePoint);
        dottedPaths.value.push({ path: borPath, shape: child });
    }
}

const getPoint = (shape: ShapeView, includedBorder?: boolean) => {
    const matrix2 = new Matrix(props.context.workspace.matrix);
    const shape_root_m = shape.matrix2Root();
    const f = { ...shape.frame };
    if (includedBorder) {
        const borders = shape.getBorders();
        let maxtopborder = 0, maxleftborder = 0, maxrightborder = 0, maxbottomborder = 0;
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
        f.x -= maxleftborder;
        f.y -= maxtopborder;
        f.width += maxleftborder + maxrightborder;
        f.height += maxtopborder + maxbottomborder;
    }
    const m = makeShapeTransform2By1(shape_root_m.clone()).clone();
    const clientTransform = makeShapeTransform2By1(matrix2);
    m.addTransform(clientTransform); //root到视图
    const { col0, col1, col2, col3 } = m.transform([
        ColVector3D.FromXY(f.x, f.y),
        ColVector3D.FromXY(f.x + f.width, f.y),
        ColVector3D.FromXY(f.x + f.width, f.y + f.height),
        ColVector3D.FromXY(f.x, f.y + f.height),
    ]);
    const ps: { x: number, y: number }[] = [
        { x: col0.x, y: col0.y },
        { x: col1.x, y: col1.y },
        { x: col2.x, y: col2.y },
        { x: col3.x, y: col3.y }
    ];
    return ps;
}

function selectDottedPaths() {
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) return;
    const parent = shapes[0].parent;
    if (!parent || !(parent as ArtboardView).autoLayout) return;
    const every = shapes.every(item => item.parent?.id === parent.id);
    if (!every) return;
    const points: { x: number, y: number }[] = [];
    const shape_root_m = parent.matrix2Root();
    shape_root_m.multiAtLeft(props.context.workspace.matrix);
    const f = parent.frame;
    const ps: { x: number, y: number }[] = [
        { x: 0, y: 0 },
        { x: f.width, y: 0 },
        { x: f.width, y: f.height },
        { x: 0, y: f.height }
    ].map(p => shape_root_m.computeCoord(p.x, p.y));
    points.push(...ps);
    const b = XYsBounding(points);
    const framePoint = [
        { x: b.left, y: b.top },
        { x: b.right, y: b.top },
        { x: b.right, y: b.bottom },
        { x: b.left, y: b.bottom }
    ];
    const borPath = genRectPath(framePoint);
    dottedPaths.value.push({ path: borPath, shape: undefined });
    const bordersTakeSpace = (parent as ArtboardView).autoLayout?.bordersTakeSpace;
    getMovePath(shapes, bordersTakeSpace);
}

const getMovePath = (shapes: ShapeView[], includedBorder?: boolean) => {
    const points: { x: number, y: number }[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const shape_root_m = shape.matrix2Root();
        const m = makeShapeTransform2By1(shape_root_m);
        const clientTransform = makeShapeTransform2By1(props.context.workspace.matrix);
        m.addTransform(clientTransform);
        let { x, y, width, height } = shape.frame;
        if (includedBorder) {
            const borders = shape.getBorders();
            let maxtopborder = 0, maxleftborder = 0, maxrightborder = 0, maxbottomborder = 0;
            borders.forEach(b => {
                if (!b.isEnabled) return;
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
            })
            x -= maxleftborder;
            y -= maxtopborder;
            width += maxleftborder + maxrightborder;
            height += maxtopborder + maxbottomborder;
        }
        const { col0, col1, col2, col3 } = m.transform([
            ColVector3D.FromXY(x, y),
            ColVector3D.FromXY(x + width, y),
            ColVector3D.FromXY(x + width, y + height),
            ColVector3D.FromXY(x, y + height),
        ]);
        const borPath = genRectPath([
            { x: col0.x + 2, y: col0.y + 2 },
            { x: col1.x - 2, y: col1.y + 2 },
            { x: col2.x - 2, y: col2.y - 2 },
            { x: col3.x + 2, y: col3.y - 2 }
        ]);
        movePath.value.push(borPath);
        const ps: { x: number, y: number }[] = getPoint(shape, includedBorder);
        points.push(...ps);
    }
    const b = XYsBounding(points);
    const framePoint = [
        { x: b.left + 2, y: b.top + 2 },
        { x: b.right - 2, y: b.top + 2 },
        { x: b.right - 2, y: b.bottom - 2 },
        { x: b.left + 2, y: b.bottom - 2 }
    ];
    multiplePath.value = genRectPath(framePoint);
}

const getDottedPaths = () => {
    if (props.context.workspace.isTranslating) return;
    dottedPaths.value = [];
    movePath.value = [];
    multiplePath.value = undefined;
    selectDottedPaths();
    hoverDottedPaths();
}

const watchedShapes = new Map<string, ShapeView>(); // 图层监听
function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(update);
        watchedShapes.delete(k);
    })

    const selectedShapes = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selectedShapes);
    shapes.forEach((v) => {
        v.watch(update);
        watchedShapes.set(v.id, v)
    });
}
const update = (...args: any[]) => {
    if (dottedPaths.value.length && args.includes('layout')) getDottedPaths();
}

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
    <svg v-if="dottedPaths.length" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet"
        overflow="visible" width="100" height="100" viewBox="0 0 100 100"
        style="transform: translate(0px, 0px); position: absolute;">
        <path v-for="(path, index) in dottedPaths" :key="index" class="dotted-rect" :d="path.path" />
        <path v-if="multiplePath && movePath.length > 1" class="dotted-move" :d="multiplePath"
            :style="{ transform: `translate(${moveTrans.x}px, ${moveTrans.y}px)` }" />
        <path v-if="movePath.length" v-for="(path, index) in movePath" :key="index" class="dotted-move" :d="path"
            :class="{ 'move-path-fill': movePathStroke }"
            :style="{ transform: `translate(${moveTrans.x}px, ${moveTrans.y}px)` }" ref="movePathEl" />
        <path v-if="insertPath" stroke="black" stroke-width="4" :d="insertPath" />
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
    fill: none;
    stroke-width: 1px;
    stroke: transparent;
    stroke-dasharray: 2, 2;
}

.move-path-fill {
    stroke: #1878F5;
}
</style>