<script setup lang="ts">
import { watchEffect, onMounted, onUnmounted, ref, nextTick } from "vue";
import { Context } from "@/context";
import { Shape, ShapeType, Matrix } from "@kcdesign/data";
import { ControllerType, ctrlMap } from "./Controller/map";
import { CtrlElementType, Action } from "@/context/workspace";
import { getHorizontalAngle, createHorizontalBox } from "@/utils/common";
import { WorkSpace } from "@/context/workspace";
export interface Point {
    x: number,
    y: number,
    type: CtrlElementType
}
export interface Bar {
    width: number,
    height: number,
    type: CtrlElementType
}
interface TracingFrame {
    path: string,
    viewBox: string,
    height: number,
    width: number
}
interface Props {
    context: Context
    matrix: number[]
}
const reflush = ref(0);
const props = defineProps<Props>();
const controllerType = ref<ControllerType>(ControllerType.Rect);
const matrix = new Matrix();
const controllerFrame = ref<Point[]>([]);
const controller = ref<boolean>(false);
const rotate = ref<number>(0);
const tracing = ref<boolean>(false);
const traceEle = ref<Element>();
let tracingFrame: TracingFrame = { path: '', viewBox: '', height: 0, width: 0, };
const altKey = ref<boolean>(false);
const watchedShapes = new Map();
function watchShapes() { // 监听选区相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.hoveredShape) {
        needWatchShapes.set(selection.hoveredShape.id, selection.hoveredShape);
    }
    if (selection.selectedShapes.length > 0) {
        selection.selectedShapes.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(shapesWatcher);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(shapesWatcher);
        watchedShapes.set(k, v);
    })
}
function updater() { // 针对描边与控件的可控更新
    matrix.reset(props.matrix); // 必须要有一定会执行的代码用来触发watchEffect执行
    // 更新前检查阀门是否开启(ps：在持续性动作中，因为只需要在终点更新即可，所以在动作执行过程中，阀门会关闭，并在持续性动作结束前再次开启)；
    // 阀门开启后可以根据所有监听的notify更新，关闭则只能通过WorkSpace.SELECTION_VIEW_UPDATE进行更新
    const shouldSelectionViewUpdate = props.context.workspace.shouldSelectionViewUpdate;
    if (shouldSelectionViewUpdate) {
        execute();
    }
}
function execute() { // 更新机执行器
    watchShapes();
    createShapeTracing();
    createController();
    reflush.value++; // 数据完毕，触发视图更新
}
function shapesWatcher() { // 选区图形有任何变化改变都要更新
    updater();
}
function workspaceWatcher(t?: any) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) { // 由workspace主动触发更新，可跳过是否可以更新的检查
        matrix.reset(props.matrix); // 先将坐标系确定在页面坐标系
        execute();
    }
}
function selectionWatcher() { // selection的部分动作可触发更新
    updater()
}
function createShapeTracing() { // 描边    
    const hoveredShape: Shape | undefined = props.context.selection.hoveredShape;
    if (hoveredShape) {
        const selected = props.context.selection.selectedShapes;
        if (selected.includes(hoveredShape)) {
            tracing.value = false;
        } else {
            const path = hoveredShape.getPath(true);
            const m2page = hoveredShape.matrix2Root();
            path.transform(m2page);
            path.transform(matrix);
            const { x, y, right, bottom } = props.context.workspace.root;
            const w = right - x;
            const h = bottom - y;
            tracingFrame = { height: h, width: w, viewBox: `${0} ${0} ${w} ${h}`, path: path.toString() };
            tracing.value = true;
            if (altKey.value) {
                nextTick(() => {
                    if (traceEle.value) {
                        traceEle.value.classList.add('cursor-copy');
                    }
                })
            }

        }
    } else {
        tracing.value = false;
    }
}
function createController() { // 计算控件点位以及类型判定
    const selection: Shape[] = props.context.selection.selectedShapes;
    if (selection.length === 0) {
        controller.value = false;
    } else {
        if (selection.length === 1) { // 单选
            const shape = selection[0];
            const m = shape.matrix2Root();
            const frame = shape.frame;
            // p1 p2
            // p4 p3
            const points = [
                { x: 0, y: 0, type: CtrlElementType.RectLT },
                { x: frame.width, y: 0, type: CtrlElementType.RectRT },
                { x: frame.width, y: frame.height, type: CtrlElementType.RectRB },
                { x: 0, y: frame.height, type: CtrlElementType.RectLB }
            ];
            controllerFrame.value = points.map(p => {
                let _s = m.computeCoord(p.x, p.y);
                let _p = matrix.computeCoord(_s.x, _s.y);
                p.x = _p.x; p.y = _p.y;
                return p;
            });
            if (shape.type === ShapeType.Line) { // 控件类型判定
                controllerType.value = ControllerType.Line;
                rotate.value = getHorizontalAngle(points[0], points[1]);
            } else if (shape.type === ShapeType.Text) {
                controllerType.value = ControllerType.Text;
                rotate.value = getHorizontalAngle(points[0], points[2]); // 线条的水平夹角与其他图形有区别
            } else {
                controllerType.value = ControllerType.Rect;
                rotate.value = getHorizontalAngle(points[0], points[1]);
            }
        } else { // 多选
            const __points: [number, number][] = [];
            selection.forEach(p => {
                const m = p.matrix2Root();
                const frame = p.frame;
                let _ps: [number, number][] = [
                    [0, 0],
                    [frame.width, 0],
                    [frame.width, frame.height],
                    [0, frame.height]
                ];
                _ps = _ps.map(p => {
                    let _s = m.computeCoord(p[0], p[1]);
                    let _p = matrix.computeCoord(_s.x, _s.y);
                    return [_p.x, _p.y];
                });
                __points.push(..._ps);
                const bounding = createHorizontalBox(__points);
                if (bounding) {
                    controllerFrame.value = [
                        { x: bounding.left, y: bounding.top, type: CtrlElementType.RectLT },
                        { x: bounding.right, y: bounding.top, type: CtrlElementType.RectRT },
                        { x: bounding.right, y: bounding.bottom, type: CtrlElementType.RectRB },
                        { x: bounding.left, y: bounding.bottom, type: CtrlElementType.RectLB }
                    ]
                }
            });
            rotate.value = 0; // 多选时，rect只为水平状态
            controllerType.value = ControllerType.Rect; // 且控件类型都为矩形控件
        }
        controller.value = true;
    }
}

function pathMousedown(e: MouseEvent) { // 点击图形描边以及描边内部区域，将选中图形
    if (props.context.workspace.action === Action.AutoV) {
        if (e.button === 0) {
            e.stopPropagation();
            if (props.context.menu.isMenuMount) {
                props.context.menu.menuMount(false);
            }
            props.context.workspace.preToTranslating(e);
            const hoveredShape = props.context.selection.hoveredShape;
            if (e.shiftKey) { // 多选
                if (hoveredShape) {
                    const selected = props.context.selection.selectedShapes;
                    props.context.selection.rangeSelectShape([...selected, hoveredShape]);
                }
            } else { // 单选并取消在此之前已选的shape
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
onMounted(() => {
    props.context.selection.watch(selectionWatcher);
    props.context.workspace.watch(workspaceWatcher);
    document.addEventListener('keydown', keyboard_down_watcher);
    document.addEventListener('keyup', keyboard_up_watcher);
    window.addEventListener('blur', window_blur)

})
onUnmounted(() => {
    props.context.selection.unwatch(selectionWatcher);
    props.context.workspace.unwatch(workspaceWatcher);
    document.removeEventListener('keydown', keyboard_down_watcher);
    document.removeEventListener('keyup', keyboard_up_watcher);
    window.removeEventListener('blur', window_blur);
})
watchEffect(updater);
</script>
<template>
    <!-- 描边 -->
    <svg ref="traceEle" v-if="tracing" version="1.1" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xhtml="http://www.w3.org/1999/xhtml"
        preserveAspectRatio="xMinYMin meet" overflow="visible" :width="tracingFrame.width" :height="tracingFrame.height"
        :viewBox="tracingFrame.viewBox" @mousedown="(e: MouseEvent) => pathMousedown(e)"
        style="transform: translate(0px, 0px)" :reflush="reflush !== 0 ? reflush : undefined">
        <path :d="tracingFrame.path" style="fill: transparent; stroke: #2561D9; stroke-width: 1.5;">
        </path>
    </svg>
    <!-- 控制 -->
    <component v-if="controller" :is="ctrlMap.get(controllerType) ?? ctrlMap.get(ControllerType.Rect)"
        :context="props.context" :controller-frame="controllerFrame" :rotate="rotate" :matrix="props.matrix"
        :shape="context.selection.selectedShapes[0]">
    </component>
</template>
<style lang="scss"></style>