<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch } from "vue";
import { Context } from "@/context";
import { Selection } from "@/context/selection";
import { Shape, ShapeType, Matrix } from "@kcdesign/data";
import { ControllerType, ctrlMap } from "./Controller/map";
import { CtrlElementType } from "@/context/workspace";
import { Action } from "@/context/tool";
import { getHorizontalAngle, XYsBounding } from "@/utils/common";
import { WorkSpace } from "@/context/workspace";
import { permIsEdit } from "@/utils/content";
import Assist from "@/components/Document/Assist/index.vue"
export interface Point {
    x: number
    y: number
}
export interface Bar {
    width: number
    height: number
    type: CtrlElementType
}
interface Props {
    context: Context
    matrix: Matrix
}
interface TracingFrame {
    path: string,
    viewBox: string,
    height: number,
    width: number
}
const props = defineProps<Props>();
const controllerType = ref<ControllerType>(ControllerType.Rect);
const matrix = new Matrix();
const controllerFrame = ref<Point[]>([]);
const controller = ref<boolean>(false);
const rotate = ref<number>(0);
const tracing = ref<boolean>(false);
const traceEle = ref<Element>();
const altKey = ref<boolean>(false);
const watchedShapes = new Map();
const tracingFrame = ref<TracingFrame>({ path: '', viewBox: '', height: 0, width: 0 });
function watchShapes() { // 监听选区相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.hoveredShape) needWatchShapes.set(selection.hoveredShape.id, selection.hoveredShape);
    if (selection.selectedShapes.length) {
        for (let i = 0, len = selection.selectedShapes.length; i < len; i++) {
            const v = selection.selectedShapes[i];
            needWatchShapes.set(v.id, v)
        }
    }
    watchedShapes.forEach((v, k) => {
        if (!needWatchShapes.has(k)) {
            v.unwatch(shapesWatcher);
            watchedShapes.delete(k);
        }
    })
    needWatchShapes.forEach((v, k) => {
        if (!watchedShapes.has(k)) {
            v.watch(shapesWatcher);
            watchedShapes.set(k, v);
        }
    })
}
function shapesWatcher() {
    if (props.context.workspace.shouldSelectionViewUpdate) update_by_shapes();
}
function update_by_shapes() {
    matrix.reset(props.matrix);
    createShapeTracing();
    createController();
}
function update_by_matrix() {
    matrix.reset(props.matrix);
    createShapeTracing();
    createController();
}
function workspace_watcher(t?: any) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) { // 由workspace主动触发更新，可跳过是否可以更新的检查
        matrix.reset(props.matrix);
        createShapeTracing();
        createController();
    }
}
function selectionWatcher(t?: any) { // selection的部分动作可触发更新
    if (t === Selection.CHANGE_PAGE) {
        watchedShapes.forEach(v => { v.unwatch(shapesWatcher) });
        watchedShapes.clear();
        tracing.value = false;
        controller.value = false;
    } else if (t === Selection.CHANGE_SHAPE) {
        matrix.reset(props.matrix);
        createController();
        watchShapes();
    } else if (t === Selection.CHANGE_SHAPE_HOVER) {
        matrix.reset(props.matrix);
        createShapeTracing();
        watchShapes();
    }
}
function createShapeTracing() { // 描边  
    const hoveredShape: Shape | undefined = props.context.selection.hoveredShape;
    if (hoveredShape) {
        if (props.context.selection.selectedShapes.includes(hoveredShape)) {
            tracing.value = false;
        } else {
            const m = hoveredShape.matrix2Root();
            m.multiAtLeft(matrix);
            const path = hoveredShape.getPath();
            path.transform(m);
            const { x, y, right, bottom } = props.context.workspace.root;
            const w = right - x;
            const h = bottom - y;
            tracingFrame.value = { height: h, width: w, viewBox: `${0} ${0} ${w} ${h}`, path: path.toString() };
            tracing.value = true;
            if (altKey.value) nextTick(() => { if (traceEle.value) traceEle.value.classList.add('cursor-copy') });
        }
    } else {
        tracing.value = false;
    }
}
function createController() { // 计算控件点位以及类型判定
    // const s = Date.now();
    const selection: Shape[] = props.context.selection.selectedShapes;
    if (selection.length === 0) {
        controller.value = false;
    } else {
        if (selection.length === 1) {
            const s = selection[0], m = s.matrix2Root(), f = s.frame;
            const points = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }];
            m.multiAtLeft(matrix);
            for (let i = 0; i < 4; i++) {
                const p = points[i];
                points[i] = m.computeCoord(p.x, p.y);
            }
            controllerFrame.value = points;
            if (!permIsEdit(props.context) || props.context.tool.action === Action.AddComment) {
                controllerType.value = ControllerType.Readonly;
            } else if (s.type === ShapeType.Line) { // 控件类型判定
                controllerType.value = ControllerType.Line;
                rotate.value = getHorizontalAngle(points[0], points[1]);
            } else if (s.type === ShapeType.Text) {
                controllerType.value = ControllerType.Text;
                rotate.value = getHorizontalAngle(points[0], points[2]); // 线条的水平夹角与其他图形有区别
            } else if (s.type === ShapeType.Table) {
                controllerType.value = ControllerType.Table;
                rotate.value = getHorizontalAngle(points[0], points[1]);
            } else {
                controllerType.value = ControllerType.Rect;
                rotate.value = getHorizontalAngle(points[0], points[1]);
            }
        } else {
            let points: { x: number, y: number }[] = [];
            for (let i = 0; i < selection.length; i++) {
                const s = selection[i], m = s.matrix2Root(), f = s.frame;
                m.multiAtLeft(matrix);
                const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }];
                for (let j = 0; j < 4; j++) {
                    const p = ps[j];
                    ps[j] = m.computeCoord2(p.x, p.y);
                }
                points = points.concat(ps);
            }
            const b = XYsBounding(points);
            controllerFrame.value = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
            rotate.value = 0;
            if (!permIsEdit(props.context) || props.context.tool.action === Action.AddComment) {
                controllerType.value = ControllerType.Readonly;
            } else {
                controllerType.value = ControllerType.RectMulti;
            }
        }
        tracing.value = false;
        controller.value = true;
    }
    // console.log('控件绘制用时(ms):', Date.now() - s);
}

function pathMousedown(e: MouseEvent) { // 点击图形描边以及描边内部区域，将选中图形
    const action = props.context.tool.action;
    if (action === Action.AutoV || action === Action.AutoK) {
        if (e.button === 0) {
            e.stopPropagation();
            if (props.context.menu.isMenuMount) props.context.menu.menuMount();
            const hoveredShape = props.context.selection.hoveredShape;
            props.context.workspace.preToTranslating(e);
            if (e.shiftKey && hoveredShape) {
                const selected = props.context.selection.selectedShapes;
                props.context.selection.rangeSelectShape(selected.concat(hoveredShape));
            } else {
                props.context.selection.selectShape(hoveredShape);
            }
        }
    }
}
function keyboard_down_watcher(e: KeyboardEvent) {
    if (e.code === 'AltLeft') {
        if (traceEle.value) {
            traceEle.value.classList.add('cursor-copy');
            altKey.value = true;
        }
    }
}
function keyboard_up_watcher(e: KeyboardEvent) {
    if (e.code === 'AltLeft') {
        if (traceEle.value) {
            traceEle.value.classList.remove('cursor-copy');
            altKey.value = false;
        }
    }
}
function window_blur() {
    if (traceEle.value) {
        traceEle.value.classList.remove('cursor-copy');
        altKey.value = false;
    }
}
// hooks
watch(() => props.matrix, update_by_matrix, { deep: true });

onMounted(() => {
    props.context.selection.watch(selectionWatcher);
    props.context.workspace.watch(workspace_watcher);
    document.addEventListener('keydown', keyboard_down_watcher);
    document.addEventListener('keyup', keyboard_up_watcher);
    window.addEventListener('blur', window_blur)
})
onUnmounted(() => {
    props.context.selection.unwatch(selectionWatcher);
    props.context.workspace.unwatch(workspace_watcher);
    document.removeEventListener('keydown', keyboard_down_watcher);
    document.removeEventListener('keyup', keyboard_up_watcher);
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
    <!-- 描边 -->
    <svg v-if="tracing" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible"
        :width="tracingFrame.width" :height="tracingFrame.height" :viewBox="tracingFrame.viewBox"
        @mousedown="(e: MouseEvent) => pathMousedown(e)" style="transform: translate(0px, 0px); position: absolute;">
        <path :d="tracingFrame.path" style="fill: transparent; stroke: #865dff; stroke-width: 1.5;">
        </path>
    </svg>
    <!-- 控制 -->
    <component v-if="controller" :is="ctrlMap.get(controllerType) ?? ctrlMap.get(ControllerType.Rect)"
        :context="props.context" :controller-frame="controllerFrame" :rotate="rotate" :matrix="props.matrix"
        :shape="context.selection.selectedShapes[0]">
    </component>
    <!-- 辅助 -->
    <Assist :context="props.context" :controller-frame="controllerFrame"></Assist>
</template>
<style lang="scss"></style>