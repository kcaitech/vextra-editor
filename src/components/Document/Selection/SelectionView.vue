<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch } from "vue";
import { Context } from "@/context";
import { Selection } from "@/context/selection";
import { Shape, ShapeType, Matrix } from "@kcdesign/data";
import { ControllerType, ctrlMap } from "./Controller/map";
import { CtrlElementType } from "@/context/workspace";
import { Action } from "@/context/tool";
import { getHorizontalAngle, createHorizontalBox } from "@/utils/common";
import { WorkSpace } from "@/context/workspace";
import { permIsEdit } from "@/utils/content";
import Assist from "@/components/Document/Assist/index.vue"
export interface Point {
    x: number,
    y: number,
}
export interface Bar {
    width: number,
    height: number,
    type: CtrlElementType
}
interface Props {
    context: Context
    matrix: Matrix
}
const props = defineProps<Props>();
const controllerType = ref<ControllerType>(ControllerType.Rect);
const matrix = new Matrix();
const controllerFrame = ref<Point[]>([]);
const controller = ref<boolean>(false);
const rotate = ref<number>(0);
const tracing = ref<boolean>(false);
const traceEle = ref<Element>();
const tracingPath = ref<string>('');
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
function workspaceWatcher(t?: any) {
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
        const selected = props.context.selection.selectedShapes;
        if (selected.includes(hoveredShape)) {
            tracing.value = false;
        } else {
            const path = hoveredShape.getPath(true);
            const m = hoveredShape.matrix2Root();
            m.multiAtLeft(matrix);
            path.transform(m);
            tracingPath.value = path.toString();
            tracing.value = true;
            if (altKey.value) {
                nextTick(() => {
                    if (traceEle.value) {
                        traceEle.value.classList.add('cursor-copy');
                    }
                })
            }
        }
        console.log('描边');
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
            const f = shape.frame;
            const points = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }];
            m.multiAtLeft(matrix);
            controllerFrame.value = points.map(p => m.computeCoord(p.x, p.y));
            if (!permIsEdit(props.context)) {
                controllerType.value = ControllerType.Readonly;
            } else if (shape.type === ShapeType.Line) { // 控件类型判定
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
                        { x: bounding.left, y: bounding.top },
                        { x: bounding.right, y: bounding.top },
                        { x: bounding.right, y: bounding.bottom },
                        { x: bounding.left, y: bounding.bottom }
                    ]
                }
            });
            rotate.value = 0; // 多选时，rect只为水平状态
            if (!permIsEdit(props.context)) {
                controllerType.value = ControllerType.Readonly;
            } else {
                controllerType.value = ControllerType.RectMulti; // 且控件类型都为矩形控件
            }
        }
        tracing.value = false;
        controller.value = true;
        console.log('绘制控件');
    }
}

function pathMousedown(e: MouseEvent) { // 点击图形描边以及描边内部区域，将选中图形
    if (props.context.tool.action === Action.AutoV) {
        if (e.button === 0) {
            e.stopPropagation();
            if (props.context.menu.isMenuMount) {
                props.context.menu.menuMount();
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
watch(() => props.matrix, update_by_matrix, { deep: true });

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
</script>
<template>
    <!-- <Assist :context="props.context" :controller-frame="controllerFrame"></Assist> -->
    <!-- 描边 -->
    <svg ref="traceEle" v-if="tracing" version="1.1" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xhtml="http://www.w3.org/1999/xhtml"
        preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100" :height="100" viewBox="0 0 100 100"
        style="position: absolute">
        <path :d="tracingPath" fill="transparent" stroke="#865dff" stroke-width="1.5px"
            @mousedown="(e: MouseEvent) => pathMousedown(e)">
        </path>
    </svg>
    <!-- 控制 -->
    <component v-if="controller" :is="ctrlMap.get(controllerType) ?? ctrlMap.get(ControllerType.Rect)"
        :context="props.context" :controller-frame="controllerFrame" :rotate="rotate" :matrix="props.matrix"
        :shape="context.selection.selectedShapes[0]">
    </component>
</template>
<style lang="scss"></style>