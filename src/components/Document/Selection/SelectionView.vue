<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { Context } from "@/context";
import { Selection } from "@/context/selection";
import { Matrix, Path, PathShape, Shape, ShapeType } from "@kcdesign/data";
import { ControllerType, ctrlMap } from "./Controller/map";
import { CtrlElementType, WorkSpace } from "@/context/workspace";
import { Action, Tool } from "@/context/tool";
import { getHorizontalAngle, XYsBounding } from "@/utils/common";
import { permIsEdit } from "@/utils/content";
import Assist from "@/components/Document/Assist/index.vue";
import { is_shape_in_selected } from "@/utils/scout";
import ShapeSize from "./ShapeSize.vue";
import LableLine from "../Assist/LableLine.vue";
import { reactive } from "vue";

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

interface PathView {
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
const altKey = ref<boolean>(false);
const tracing = ref<boolean>(false);
const tracingStroke = ref<string>('#1878F5');
const traceEle = ref<Element>();
const tracingFrame = ref<PathView>({ path: '', viewBox: '', height: 0, width: 0 });
const watchedShapes = new Map();
const isCutout = ref(false);
const tracing_class = reactive({ thick_stroke: false, hollow_fill: false });

function watchShapes() { // 监听选区相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.hoveredShape) {
        needWatchShapes.set(selection.hoveredShape.id, selection.hoveredShape);
    }

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
    if (props.context.workspace.shouldSelectionViewUpdate) {
        update_by_shapes();
    }
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
        watchedShapes.forEach(v => {
            v.unwatch(shapesWatcher)
        });
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

function tool_watcher(t: number) {
    if (t === Tool.LABLE_CHANGE) {
        matrix.reset(props.matrix);
        createController();
        watchShapes();
        lableLineStatus();
    }
}

function modfiy_tracing_class(shape: Shape) {
    tracing_class.thick_stroke = false;
    tracing_class.hollow_fill = false;

    if (shape instanceof PathShape && !shape.isClosed) {
        tracing_class.hollow_fill = true;
        tracing_class.thick_stroke = true;
    }

    if (shape.style.fills.length) {
        tracing_class.hollow_fill = false;
    }
}

/**
 * @description 创建描边
 */
function createShapeTracing() {
    const hoveredShape: Shape | undefined = props.context.selection.hoveredShape;
    tracing.value = false;

    if (!hoveredShape) {
        return;
    }

    if (is_shape_in_selected(props.context.selection.selectedShapes, hoveredShape)) {
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

        if (is_symbol_class(hoveredShape.type)) {
            tracingStroke.value = '#7F58F9';
        } else {
            tracingStroke.value = '#1878F5';
        }

        modfiy_tracing_class(hoveredShape);
    }
}

function is_symbol_class(type: ShapeType) {
    return [ShapeType.Symbol, ShapeType.SymbolRef, ShapeType.SymbolUnion].includes(type);
}

/**
 * @description 创建控件
 */
function createController() {
    // const s = Date.now();
    const selection: Shape[] = props.context.selection.selectedShapes;
    if (!selection.length) {
        controller.value = false;
        return;
    }
    modify_controller_frame(selection);
    modify_controller_type(selection);
    modify_rotate(selection);
    tracing.value = false;
    controller.value = true;
    // console.log('控件绘制用时(ms):', Date.now() - s);
}
function modify_controller_frame(shapes: Shape[]) {
    if (shapes.length === 1) {
        const s = shapes[0], m = s.matrix2Root(), f = s.frame;
        const points = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }];
        m.multiAtLeft(matrix);
        for (let i = 0; i < 4; i++) {
            const p = points[i];
            points[i] = m.computeCoord3(p);
        }
        controllerFrame.value = points;
        return;
    }
    const points: { x: number, y: number }[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const s = shapes[i];
        if (s.type === ShapeType.Contact) continue;
        const m = s.matrix2Root(), f = s.frame;
        m.multiAtLeft(matrix);
        const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, {
            x: 0,
            y: f.height
        }];
        for (let j = 0; j < 4; j++) ps[j] = m.computeCoord3(ps[j]);
        points.push(...ps);
    }
    const b = XYsBounding(points);
    controllerFrame.value = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, {
        x: b.left,
        y: b.bottom
    }];
}
function for_virtual(shape: Shape) {
    if (shape.type === ShapeType.Text) {
        controllerType.value = ControllerType.TextVirtual;
    } else {
        controllerType.value = ControllerType.Virtual;
    }
}
function for_path_shape(shape: PathShape) {
    const points = shape.points;
    const is_straight_1 = !points[0]?.hasFrom;
    const is_straight_2 = !points[1]?.hasTo;
    if (points.length === 2 && is_straight_1 && is_straight_2) {
        controllerType.value = ControllerType.Line;
    } else {
        controllerType.value = ControllerType.Rect;
    }
}
function modify_controller_type(shapes: Shape[],) {
    if (shapes.length === 1) {
        if (!permIsEdit(props.context) || props.context.tool.isLable) {
            controllerType.value = ControllerType.Readonly;
            return;
        }
        const shape = shapes[0];
        if (shape.isVirtualShape) {
            for_virtual(shape);
            return;
        }
        if (shape.type === ShapeType.Contact) {
            controllerType.value = ControllerType.Contact;
            return;
        }
        if (shape instanceof PathShape) {
            for_path_shape(shape);
            return;
        }
        const __type = shape.type;
        if (__type === ShapeType.Text) {
            controllerType.value = ControllerType.Text;
        } else if (__type === ShapeType.Table) {
            controllerType.value = ControllerType.Table;
        } else if (is_symbol_class(__type)) {
            controllerType.value = ControllerType.Symbol;
        } else {
            controllerType.value = ControllerType.Rect;
        }
        return;
    }

    for (let i = 0, l = shapes.length; i < l; i++) {
        if (shapes[i].isVirtualShape) {
            controllerType.value = ControllerType.Virtual;
            return;
        }
    }
    controllerType.value = ControllerType.RectMulti;
}
function modify_rotate(shapes: Shape[]) {
    if (shapes.length === 1) {
        const shape = shapes[0];
        if (shape instanceof PathShape) {
            const points = shape.points;
            const is_straight_1 = !points[0]?.hasFrom;
            const is_straight_2 = !points[1]?.hasTo;
            if (points.length === 2 && is_straight_1 && is_straight_2) {
                rotate.value = getHorizontalAngle(controllerFrame.value[0], controllerFrame.value[2]);
                return;
            }
        }
        rotate.value = getHorizontalAngle(controllerFrame.value[0], controllerFrame.value[1]);
    }
    rotate.value = 0;
}
function pathMousedown(e: MouseEvent) { // 点击图形描边以及描边内部区域，将选中图形
    const action = props.context.tool.action;
    const selection = props.context.selection;

    if (!(action === Action.AutoV || action === Action.AutoK)) {
        return;
    }

    if (e.button !== 0) {
        return;
    }

    e.stopPropagation();

    if (props.context.menu.isMenuMount) {
        props.context.menu.menuMount();
    }

    const hoveredShape = selection.hoveredShape;
    if (!hoveredShape) {
        return;
    }

    if (e.shiftKey) {
        selection.rangeSelectShape(selection.selectedShapes.concat(hoveredShape));
    } else {
        const workspace = props.context.workspace;
        selection.selectShape(hoveredShape);
        workspace.preToTranslating(e);
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

//标注线
const isLableLine = ref(false);
const lableLineStatus = () => {
    const isLable = props.context.tool.isLable;
    if (isLable) {
        isLableLine.value = true;
    } else {
        isLableLine.value = false;
    }
}

// hooks
watch(() => props.matrix, update_by_matrix, { deep: true });

onMounted(() => {
    props.context.selection.watch(selectionWatcher);
    props.context.workspace.watch(workspace_watcher);
    props.context.tool.watch(tool_watcher);
    document.addEventListener('keydown', keyboard_down_watcher);
    document.addEventListener('keyup', keyboard_up_watcher);
    window.addEventListener('blur', window_blur)
})
onUnmounted(() => {
    props.context.selection.unwatch(selectionWatcher);
    props.context.workspace.unwatch(workspace_watcher);
    props.context.tool.unwatch(tool_watcher);
    document.removeEventListener('keydown', keyboard_down_watcher);
    document.removeEventListener('keyup', keyboard_up_watcher);
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
    <!-- 标注线 -->
    <LableLine v-if="isLableLine" :context="props.context" :matrix="props.matrix"></LableLine>
    <!-- 描边 -->
    <svg v-if="tracing" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible"
        :width="tracingFrame.width" :height="tracingFrame.height" :viewBox="tracingFrame.viewBox"
        style="transform: translate(0px, 0px); position: absolute;">
        <path v-if="tracing_class.thick_stroke" :d="tracingFrame.path" fill="none" stroke="transparent" :stroke-width="14"
            @mousedown="(e: MouseEvent) => pathMousedown(e)">
        </path>
        <path :d="tracingFrame.path" :fill="tracing_class.hollow_fill ? 'none' : 'transparent'" :stroke="tracingStroke"
            stroke-width="1.5" @mousedown="(e: MouseEvent) => pathMousedown(e)">
        </path>
    </svg>
    <!-- 控制 -->
    <component v-if="controller" :is="ctrlMap.get(controllerType) ?? ctrlMap.get(ControllerType.Rect)"
        :context="props.context" :controller-frame="controllerFrame" :rotate="rotate" :matrix="props.matrix"
        :shape="context.selection.selectedShapes[0]">
    </component>
    <!-- 辅助 -->
    <Assist :context="props.context" :controller-frame="controllerFrame"></Assist>
    <!-- 选中大小 -->
    <ShapeSize :context="props.context" :controller-frame="controllerFrame"></ShapeSize>
</template>