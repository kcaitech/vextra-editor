/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from '@/context';
import { ColorCtx } from '@/context/color';
import { ClientXY, Selection, XY } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { getTextIndexAndLen, get_add_gradient_color, get_gradient, get_temporary_stop, to_rgba } from './gradient_utils';
import {
    AsyncGradientEditor,
    BasicArray,
    Color,
    Fill,
    FillMask,
    GradientEditor,
    GradientType,
    Matrix,
    ShapeFrame,
    Stop,
    TextShapeView,
    Transform,
    IO,
    ShapeView,
    SymbolRefView,
} from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import trans_bgc from '@/assets/trans_bgc3.png';
import { getHorizontalAngle } from '@/utils/common';
import { v4 } from 'uuid';
import TemporaryStop from './TemporaryStop.vue';
import Percent from './Percent.vue';
import { computed } from 'vue';
import { SelectedShapesWatcher } from "@/components/common/selectionwatcher";
import { Opt } from "@kcdesign/data";
type Operator = Opt.Operator;

type DotType = 'from' | 'to' | 'ellipse';
type Dot = { x: number; y: number; type: DotType; };
type Stops = { x: number; y: number; color: Color; id?: string; };

const props = defineProps<{
    context: Context
    matrix: Matrix
}>();
const matrix = new Matrix();
const dot1 = ref<Dot>({ x: 0, y: 0, type: 'from' });
const dot2 = ref<Dot>({ x: 0, y: 0, type: 'to' });
const dot3 = ref<Dot>({ x: 0, y: 0, type: 'ellipse' });
const dot = ref(false);
const stops = ref<Stops[]>([]);
let startPosition: ClientXY = { x: 0, y: 0 };
let dot_type: DotType = 'to';
let isDragging = false;
let gradientEditor: GradientEditor | undefined;
let gradientTextEditor: AsyncGradientEditor | undefined;
const dragActiveDis = 3;
const active = ref();
const rotate = ref(0);
const rotate_r = computed<number>(() => {
    return rotate.value * Math.PI / 180;
})
const line_length = ref<number>(1);
const temporary_stop = ref<Stops>();
const temporary = ref(false);
const enter_stop = ref(false);
const percent_position = ref({ x: 0, y: 0 });
const percent = ref(0);
const percent_show = ref(false);
const ellipse_length = ref<number>(1);
const ellipseL = ref(1);
const ellipse_show = ref(false);
const is_dot_down = ref(false);
const get_linear_points = () => {
    dot.value = false;
    stops.value = [];
    const shape = props.context.selection.flat[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient || gradient.gradientType !== GradientType.Radial) return;
    let id = props.context.color.selected_stop ?? gradient.stops[0].id;
    const index = (gradient.stops as any[]).findIndex(i => i.id === id);
    if (index === -1) id = gradient.stops[0].id;
    active.value = id;
    let frame = shape.frame;
    let d1 = { x: 0, y: 0 }
    let d2 = { x: 0, y: 0 }
    const m = shape.matrix2Root();
    m.preScale(frame.width, frame.height);
    m.multiAtLeft(matrix);
    d1 = m.computeCoord3({ x: gradient.from.x, y: gradient.from.y });
    d2 = m.computeCoord3({ x: gradient.to.x, y: gradient.to.y });
    dot1.value = { x: d1.x, y: d1.y, type: 'from' }
    dot2.value = { x: d2.x, y: d2.y, type: 'to' }
    line_length.value = Math.sqrt(Math.pow(d2.x - d1.x, 2) + Math.pow(d2.y - d1.y, 2));
    rotate.value = getHorizontalAngle({ x: d1.x, y: d1.y }, { x: d2.x, y: d2.y });
    dot3.value = { type: 'ellipse', ...get_ellipse_point2(Math.abs(gradient.elipseLength || 0), line_length.value, d1, frame) };

    ellipseL.value = Math.abs(gradient.elipseLength || 0);
    ellipse_length.value = Math.sqrt(Math.pow(dot3.value.x - dot1.value.x, 2) + Math.pow(dot3.value.y - dot1.value.y, 2));
    for (let i = 0; i < gradient.stops.length; i++) {
        const stop = gradient.stops[i];
        const x1 = d1.x + ((d2.x - d1.x) * stop.position);
        const y1 = d1.y + ((d2.y - d1.y) * stop.position);
        stops.value.push({ x: x1, y: y1, color: stop.color as Color, id: stop.id });
    }

    dot.value = true;
}

function get_ellipse_point2(ellipseLength: number, main_apex_length: number, from: {
    x: number,
    y: number
}, frame: ShapeFrame) {
    const ellipse = { x: main_apex_length * ellipseLength * (frame.width / frame.height), y: 0 };

    const m = new Matrix();
    m.rotate(Math.PI * 0.5 + rotate_r.value);
    m.trans(from.x, from.y);

    return m.computeCoord3(ellipse);
}
const down_ellipse = ref(false);
const dot_mousedown = (e: MouseEvent, type: DotType) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const workspace = props.context.workspace;
    startPosition = workspace.getContentXY(e);
    is_dot_down.value = true;
    document.addEventListener('mousemove', dot_mousemove);
    document.addEventListener('mouseup', dot_mouseup);
    dot_type = type;
    if (type === 'ellipse') {
        down_ellipse.value = true;
    }
}
const dot_mousemove = (e: MouseEvent) => {
    if (!is_dot_down.value) return;
    const locate = props.context.color.locate;
    if (!locate) return;
    const { x, y } = props.context.workspace.getContentXY(e);
    const { x: sx, y: sy } = startPosition;
    const dx = x - sx;
    const dy = y - sy;
    const shape = props.context.selection.flat[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    if (isDragging) {
        startPosition.x = x;
        startPosition.y = y;
        const matrix = new Transform();
        let frame = shape.frame;
        matrix.preScale(frame.width, frame.height);
        matrix.multiAtLeft(shape.matrix2Root());
        matrix.multiAtLeft(props.context.workspace.matrix);
        const m = matrix.inverse;
        const position = m.computeCoord(x, y);
        if (locate.type === 'text') {
            if (dot_type === 'from') {
                gradientTextEditor?.execute_from(position);
            } else if (dot_type === 'to') {
                gradientTextEditor?.execute_to(position);
            } else if (dot_type === 'ellipse') {
                const m_p = props.context.workspace.getContentXY(e);
                const m = new Matrix();
                m.trans(-dot1.value.x, -dot1.value.y);
                m.rotate(-rotate_r.value);
                const p = m.computeCoord3(m_p).y / line_length.value / (frame.width / frame.height);
                update_ellipse_dot(e, Math.abs(p));
                gradientTextEditor!.execute_elipselength(p);
            }
        } else {
            if (dot_type === 'from') {
                modifyApex(position, 'modifyFrom');
            } else if (dot_type === 'to') {
                modifyApex(position, 'modifyTo');
            } else if (dot_type === 'ellipse') {
                const m_p = props.context.workspace.getContentXY(e);
                const m = new Matrix();
                m.trans(-dot1.value.x, -dot1.value.y);
                m.rotate(-rotate_r.value);
                const p = m.computeCoord3(m_p).y / line_length.value / (frame.width / frame.height);
                update_ellipse_dot(e, Math.abs(p));
                modifyEllipseLength(p);
            }
        }
    } else {
        if (Math.hypot(dx, dy) > dragActiveDis) {
            isDragging = true;
            if (locate.type !== 'text') {
                gradientEditor = new GradientEditor(props.context.repo);
            } else {
                const { textIndex, selectLength } = getTextIndexAndLen(props.context);
                const editor = props.context.editor4TextShape(shape as TextShapeView);
                gradientTextEditor = editor.asyncSetTextGradient([shape] as TextShapeView[], gradient, textIndex, selectLength);
            }
        }
    }
}

function modifyApex(position: XY, apex: 'modifyFrom' | 'modifyTo') {
    const locate = props.context.color.locate!;
    const shape = props.context.selection.flat[0];
    const maskId = locate.type === 'fills' ? shape.fillsMask : shape.borderFillsMask;
    const editor = gradientEditor! as GradientEditor;
    const page = props.context.selection.selectedPage!;
    if (maskId) {
        const mask = props.context.data.stylesMgr.getSync(maskId) as FillMask;
        editor[apex]([(api: Operator) => modifyGradientPosition(api, mask.fills[locate.index])]);
    } else if (locate.type === 'fills') {
        const views: ShapeView[] = [];
        const fills: Fill[] = [];
        const index = locate.index;
        for (const view of props.context.selection.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getFills()[index]);
        }
        const modifyVariables = (api: Operator) => {
            for (const view of views) modifyGradientPosition(api, editor.getFillsVariable(api, page, view).value[index]);
        }
        const modifyLocal = (api: Operator) => {
            for (const fill of fills) modifyGradientPosition(api, fill);
        }
        editor[apex]([modifyVariables, modifyLocal]);
    } else if (locate.type === 'borders') {
        const views: ShapeView[] = [];
        const fills: Fill[] = [];
        const index = locate.index;
        for (const view of props.context.selection.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getBorder().strokePaints[index]);
        }
        const modifyVariables = (api: Operator) => {
            for (const view of views) modifyGradientPosition(api, editor.getBorderVariable(api, page, view).value.strokePaints[index]);
        }
        const modifyLocal = (api: Operator) => {
            for (const fill of fills) modifyGradientPosition(api, fill);
        }
        editor[apex]([modifyVariables, modifyLocal]);
    }

    function modifyGradientPosition(api: Operator, fill: Fill) {
        const key = apex === "modifyFrom" ? "from" : "to";
        const gradient = fill.gradient!;
        const gradientCopy = editor.importGradient(gradient);
        gradientCopy[key].x = position.x;
        gradientCopy[key].y = position.y;
        api.setFillGradient(fill, gradientCopy);
    }
}

function modifyEllipseLength(len: number) {
    const locate = props.context.color.locate!;
    const shape = props.context.selection.flat[0];
    const maskId = locate.type === 'fills' ? shape.fillsMask : shape.borderFillsMask;
    const editor = gradientEditor! as GradientEditor;
    const page = props.context.selection.selectedPage!;
    if (maskId) {
        const mask = props.context.data.stylesMgr.getSync(maskId) as FillMask;
        editor.modifyEllipseLength([(api: Operator) => {
            const fill = mask.fills[locate.index];
            modifyGradientEllipseLength(api, fill);
        }]);
    } else if (locate.type === 'fills') {
        const views: ShapeView[] = [];
        const fills: Fill[] = [];
        const index = locate.index;
        for (const view of props.context.selection.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getFills()[index]);
        }
        const modifyVariables = (api: Operator) => {
            for (const view of views) modifyGradientEllipseLength(api, editor.getFillsVariable(api, page, view).value[index]);
        }
        const modifyLocal = (api: Operator) => {
            for (const fill of fills) modifyGradientEllipseLength(api, fill);
        }
        editor.modifyEllipseLength([modifyVariables, modifyLocal]);
    } else if (locate.type === 'borders') {
        const views: ShapeView[] = [];
        const fills: Fill[] = [];
        const index = locate.index;
        for (const view of props.context.selection.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getBorder().strokePaints[index]);
        }
        const modifyVariables = (api: Operator) => {
            for (const view of views) modifyGradientEllipseLength(api, editor.getBorderVariable(api, page, view).value.strokePaints[index]);
        }
        const modifyLocal = (api: Operator) => {
            for (const fill of fills) modifyGradientEllipseLength(api, fill);
        }
        editor.modifyEllipseLength([modifyVariables, modifyLocal]);
    }

    function modifyGradientEllipseLength(api: Operator, fill: Fill) {
        const gradient = fill.gradient!;
        const gradientCopy = editor.importGradient(gradient);
        gradientCopy.elipseLength = len;
        api.setFillGradient(fill, gradientCopy);
    }
}

function createFillGradientStop(stop: Stop) {
    const locate = props.context.color.locate!;
    const idx = locate.index;
    const shape = props.context.selection.flat[0];
    const editor = gradientEditor = new GradientEditor(props.context.repo);
    const page = props.context.selection.selectedPage!;

    let maskId = locate.type === 'fills' ? shape.fillsMask : shape.borderFillsMask;
    if (maskId) {
        const mask = props.context.data.stylesMgr.getSync(maskId) as FillMask;
        const fill = mask.fills[idx];
        editor.createStop([(api: Operator) => insetStop(api, fill)]);
    } else if (locate.type === 'fills') {
        const views: ShapeView[] = [];
        const fills: Fill[] = [];
        const index = locate.index;
        for (const view of props.context.selection.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getFills()[index]);
        }
        const modifyVariables = (api: Operator) => {
            for (const view of views) insetStop(api, editor.getFillsVariable(api, page, view).value[index]);
        }
        const modifyLocal = (api: Operator) => {
            for (const fill of fills) insetStop(api, fill);
        }
        editor.createStop([modifyVariables, modifyLocal]);
    } else if (locate.type === 'borders') {
        const views: ShapeView[] = [];
        const fills: Fill[] = [];
        const index = locate.index;
        for (const view of props.context.selection.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getBorder().strokePaints[index]);
        }
        const modifyVariables = (api: Operator) => {
            for (const view of views) insetStop(api, editor.getBorderVariable(api, page, view).value.strokePaints[index]);
        }
        const modifyLocal = (api: Operator) => {
            for (const fill of fills) insetStop(api, fill);
        }
        editor.createStop([modifyVariables, modifyLocal]);
    }

    function insetStop(api: Operator, fill: Fill) {
        const gradient = fill.gradient!;
        const gradientCopy = editor.importGradient(gradient);
        gradientCopy.stops.push(stop);
        gradientCopy.stops = gradientCopy.stops.sort((a, b) => a.position > b.position ? 1 : -1);
        api.setFillGradient(fill, gradientCopy);
    }
}

function modifyStopPosition(position: number, id: string) {
    const locate = props.context.color.locate!;
    const shape = props.context.selection.flat[0];
    const maskId = locate.type === 'fills' ? shape.fillsMask : shape.borderFillsMask;
    const editor = gradientEditor! as GradientEditor;
    const page = props.context.selection.selectedPage!;
    if (maskId) {
        const mask = props.context.data.stylesMgr.getSync(maskId) as FillMask;
        editor.modifyStopPosition([(api: Operator) => modifyStopPosition(api, mask.fills[locate.index])]);
    } else if (locate.type === 'fills') {
        const views: ShapeView[] = [];
        const fills: Fill[] = [];
        const index = locate.index;
        for (const view of props.context.selection.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getFills()[index]);
        }
        const modifyVariables = (api: Operator) => {
            for (const view of views) modifyStopPosition(api, editor.getFillsVariable(api, page, view).value[index]);
        }
        const modifyLocal = (api: Operator) => {
            for (const fill of fills) modifyStopPosition(api, fill);
        }
        editor.modifyStopPosition([modifyVariables, modifyLocal]);
    } else if (locate.type === 'borders') {
        const views: ShapeView[] = [];
        const fills: Fill[] = [];
        const index = locate.index;
        for (const view of props.context.selection.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getBorder().strokePaints[index]);
        }
        const modifyVariables = (api: Operator) => {
            for (const view of views) modifyStopPosition(api, editor.getBorderVariable(api, page, view).value.strokePaints[index]);
        }
        const modifyLocal = (api: Operator) => {
            for (const fill of fills) modifyStopPosition(api, fill);
        }
        editor.modifyStopPosition([modifyVariables, modifyLocal]);
    }

    function modifyStopPosition(api: Operator, fill: Fill) {
        const gradient = fill.gradient!;
        const gradientCopy = editor.importGradient(gradient);
        const stop = gradientCopy.stops.find(i => i.id === id);
        if (stop) stop.position = position;
        gradientCopy.stops.sort((a, b) => a.position > b.position ? 1 : -1);
        api.setFillGradient(fill, gradientCopy);
    }
}
const dot_mouseup = (e: MouseEvent) => {
    is_dot_down.value = false;
    if (isDragging) isDragging = false;
    if (gradientEditor) {
        gradientEditor.commit();
        gradientEditor = undefined;
    }
    if (gradientTextEditor) {
        gradientTextEditor.close();
        gradientTextEditor = undefined;
    }
    down_ellipse.value = false;
    ellipse_show.value = false;
    document.removeEventListener('mousemove', dot_mousemove);
    document.removeEventListener('mouseup', dot_mouseup);
}
const rect_enter = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    e.stopPropagation();
    const position = get_stop_position(e);
    const shape = props.context.selection.flat[0];
    get_percent_position(e);
    temporary_stop.value = get_temporary_stop(position, dot1.value, dot2.value, shape, props.context);
    temporary.value = true;
    percent_show.value = true;
}
const rect_leave = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    e.stopPropagation();
    if (!enter_stop.value) {
        temporary.value = false;
    }
    percent_show.value = false;
}
const rect_mousemove = (e: MouseEvent) => {
    if (e.buttons === 0) {
        e.stopPropagation();
        const position = get_stop_position(e);
        const shape = props.context.selection.flat[0];
        const r_p = props.context.workspace.getContentXY(e);
        percent_position.value.x = r_p.x + 20;
        percent_position.value.y = r_p.y + 20;
        percent.value = +(position * 100).toFixed(0);
        temporary_stop.value = get_temporary_stop(position, dot1.value, dot2.value, shape, props.context);
    }
}
const stop_enter = (e: MouseEvent, index: number) => {
    if (e.buttons !== 0) return;
    e.stopPropagation();
    const shape = props.context.selection.flat[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    const position = gradient.stops[index].position;
    percent.value = +(position * 100).toFixed(0);
    enter_stop.value = true;
}
const update_percent = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    const r_p = props.context.workspace.getContentXY(e);
    percent_position.value.x = r_p.x + 20;
    percent_position.value.y = r_p.y + 20;
}
const down_stop_id = ref<string>('');
const add_stop = (e: MouseEvent) => {
    const position = get_stop_position(e);
    const locate = props.context.color.locate;
    const shape = props.context.selection.flat[0];
    startPosition = props.context.workspace.getContentXY(e);
    if (!locate) return;
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    const _stop = get_add_gradient_color(gradient.stops, position);
    if (!_stop) return;
    const stop = new Stop(new BasicArray(), v4(), position, _stop.color);
    if (locate.type == 'text') {
        const { textIndex, selectLength } = getTextIndexAndLen(props.context);
        const new_gradient = IO.Clipboard.cloneGradient(gradient);
        new_gradient.stops.push(stop);
        const s = new_gradient.stops as BasicArray<Stop>;
        s.sort((a, b) => a.position > b.position ? 1 : -1);
        const editor = props.context.editor4TextShape(shape as TextShapeView);
        editor.setTextGradient(new_gradient, textIndex, selectLength);
    } else {
        createFillGradientStop(stop);
    }
    nextTick(() => down_stop(e, stop.id));
}
const get_stop_position = (e: MouseEvent) => {
    const m_p = props.context.workspace.getContentXY(e);
    const m = new Matrix();
    m.trans(-dot1.value.x, -dot1.value.y);
    m.rotate(-rotate_r.value);
    const p = m.computeCoord3(m_p).x / line_length.value
    return Math.min(Math.max(p, 0), 1);
}
const stop_mousedown = (e: MouseEvent, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    down_stop(e, id);
}
const is_stop_down = ref(false);
const down_stop = (e: MouseEvent, id: string) => {
    const shape = props.context.selection.flat[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    temporary.value = false;
    const workspace = props.context.workspace;
    props.context.color.select_stop(id);
    down_stop_id.value = id;
    startPosition = workspace.getContentXY(e);
    is_stop_down.value = true;
    document.addEventListener('mousemove', stop_mousemove);
    document.addEventListener('mouseup', stop_mouseup);
}
const stop_mousemove = (e: MouseEvent) => {
    if (!is_stop_down.value) return;
    const locate = props.context.color.locate;
    if (!locate) return;
    const { x, y } = props.context.workspace.getContentXY(e);
    const { x: sx, y: sy } = startPosition;
    const dx = x - sx;
    const dy = y - sy;
    const shape = props.context.selection.flat[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    if (isDragging) {
        startPosition.x = x;
        startPosition.y = y;
        const position = get_stop_position(e);
        get_percent_position(e);
        percent.value = +(position * 100).toFixed(0);
        if (locate.type === 'text') {
            gradientTextEditor!.execute_stop_position(position, down_stop_id.value);
        } else {
            modifyStopPosition(position, down_stop_id.value);
        }
    } else {
        if (Math.hypot(dx, dy) > dragActiveDis) {
            isDragging = true;
            if (locate.type === 'text') {
                const { textIndex, selectLength } = getTextIndexAndLen(props.context);
                const editor = props.context.editor4TextShape(shape as TextShapeView);
                gradientTextEditor = editor.asyncSetTextGradient([shape] as TextShapeView[], gradient, textIndex, selectLength);
            } else {
                gradientEditor = gradientEditor ?? new GradientEditor(props.context.repo);
            }
        }
    }
}
const get_percent_position = (e: MouseEvent) => {
    const r_p = props.context.workspace.getContentXY(e);
    percent_position.value.x = r_p.x + 20;
    percent_position.value.y = r_p.y + 20;
}
const stop_mouseup = (e: MouseEvent) => {
    is_stop_down.value = false;
    if (isDragging) isDragging = false;
    if (gradientEditor) {
        gradientEditor.commit();
        gradientEditor = undefined;
    }
    if (gradientTextEditor) {
        gradientTextEditor.close();
        gradientTextEditor = undefined;
    }
    percent_show.value = false;
    document.removeEventListener('mousemove', stop_mousemove);
    document.removeEventListener('mouseup', stop_mouseup);
}
const stop_content_enter = (e: MouseEvent, index: number) => {
    if (e.buttons !== 0) return;
    get_percent_position(e);
    temporary.value = false;
    const shape = props.context.selection.flat[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    const position = gradient.stops[index].position;
    percent.value = +(position * 100).toFixed(0);
    percent_show.value = true;
}
const ellipse_dot = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    update_ellipse_dot(e);
    ellipse_show.value = true;
}
const update_ellipse_dot = (e: MouseEvent, l?: number) => {
    const r_p = props.context.workspace.getContentXY(e);
    percent_position.value.x = r_p.x + 20;
    percent_position.value.y = r_p.y + 20;
    const shape = props.context.selection.flat[0];
    const gradient = get_gradient(props.context, shape);
    if (!gradient) return;
    percent.value = +((l || Math.abs(gradient.elipseLength || 0)) * 100).toFixed(0);
}
const leave_ellipse_dot = (e: MouseEvent) => {
    if (down_ellipse.value || e.buttons !== 0) return;
    ellipse_show.value = false;
}
const stop_leave = (e: MouseEvent) => {
    enter_stop.value = false;
}
const stop_content_leave = (e: MouseEvent) => {
    percent_show.value = false;
}
const update = () => {
    matrix.reset(props.matrix);
    get_linear_points();
}
const watcher = new SelectedShapesWatcher(props.context.selection);
const workspaceWatcher = (t: number | string) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) update();
}
const colorWatcher = (t: number) => {
    if (t === ColorCtx.CHANGE_STOP) {
        active.value = props.context.color.selected_stop;
    } else if (t === ColorCtx.GRADIENT_UPDATE || t === ColorCtx.COLOR_EDITOR) {
        get_linear_points();
    }
}
const selectionWatcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) update();
}

onMounted(() => {
    update();
    watcher.watch(update);
    props.context.workspace.watch(workspaceWatcher);
    props.context.selection.watch(selectionWatcher);
    props.context.color.watch(colorWatcher);
})
onUnmounted(() => {
    watcher.unwatch(update);
    props.context.workspace.unwatch(workspaceWatcher);
    props.context.color.unwatch(colorWatcher);
    props.context.selection.unwatch(selectionWatcher);
})
</script>
<template>
    <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" overflow="visible" width="100"
         height="100" viewBox="0 0 100 100" style="transform: translate(0px, 0px); position: absolute;">
        <g v-if="dot">
            <TemporaryStop v-if="temporary" :stop="temporary_stop!" :rotate="rotate - 90" />
            <rect width="20" :height="line_length" ref="stop_container"
                :style="{ transform: `translate(${dot1.x}px, ${dot1.y}px) rotate(${rotate - 90}deg)` }"
                fill="transparent" @mousemove="(e) => rect_mousemove(e)" @mousedown.stop="(e) => add_stop(e)"
                @mouseenter="rect_enter" @mouseleave="rect_leave">
            </rect>
            <ellipse :cx="dot1.x" :cy="dot1.y" :rx="ellipse_length" :ry="line_length" fill="none" stroke="#000000"
                stroke-width="3"
                :style="{ transform: `translate(${dot1.x}px, ${dot1.y}px) rotate(${rotate - 90}deg) translate(${-dot1.x}px, ${-dot1.y}px)` }" />
            <ellipse :cx="dot1.x" :cy="dot1.y" :rx="ellipse_length" :ry="line_length" fill="none" stroke="#ffffff"
                stroke-width="2"
                :style="{ transform: `translate(${dot1.x}px, ${dot1.y}px) rotate(${rotate - 90}deg) translate(${-dot1.x}px, ${-dot1.y}px)` }" />
            <line :x1="dot1.x" :y1="dot1.y" :x2="dot2.x" :y2="dot2.y" stroke="black" stroke-width="3" />
            <line :x1="dot1.x" :y1="dot1.y" :x2="dot2.x" :y2="dot2.y" stroke="white" stroke-width="2" />
            <circle r="4" fill="white" stroke="#595959" stroke-width="1" :cx="dot1.x" :cy="dot1.y" />
            <circle r="6" fill="transparent" stroke="#595959" stroke-width="1" :cx="dot1.x" :cy="dot1.y"
                @mousedown.stop="(e) => dot_mousedown(e, dot1.type)" />
            <circle r="4" fill="white" stroke="#595959" stroke-width="1" :cx="dot2.x" :cy="dot2.y" />
            <circle r="6" fill="transparent" stroke="#595959" stroke-width="1" :cx="dot2.x" :cy="dot2.y"
                @mousedown.stop="(e) => dot_mousedown(e, dot2.type)" />
            <circle r="4" fill="white" stroke="#595959" stroke-width="1" :cx="dot3.x" :cy="dot3.y" />
            <circle r="6" fill="transparent" stroke="#595959" stroke-width="1" :cx="dot3.x" :cy="dot3.y"
                @mousedown.stop="(e) => dot_mousedown(e, dot3.type)" @mouseenter="ellipse_dot"
                @mouseleave="leave_ellipse_dot" />
            <g v-for="(stop, index) in stops" :key="index" @mouseenter="(e) => stop_content_enter(e, index)"
                @mouseleave="stop_content_leave"
                :style="{ transform: `translate(${stop.x + 3.5}px, ${stop.y}px) rotate(${rotate - 90}deg) translate(0px, -11px)` }">
                <g
                    transform="matrix(0.70710688829422,0.7071067094802856,-0.7071066498756409,0.70710688829422,3.2218211561925614,-7.778166386438556)">
                    <path
                        d="M10.99998950958252 7.77817440032959C10.99998950958252 3.48240729750328 14.4823968070858 0 18.77816390991211 0L18.77816390991211 0C23.07393101273842 0 26.5563383102417 3.482407297503281 26.5563383102417 7.77817440032959L26.5563383102417 7.77817440032959C26.5563383102417 12.073941503155899 23.07393101273842 15.55634880065918 18.77816390991211 15.55634880065918L10.99998950958252 15.55634880065918C10.99998950958252 15.55634880065918 10.99998950958252 15.55634880065918 10.99998950958252 15.55634880065918Z"
                        :fill="active === stop.id ? '#1878f5' : '#fff'" fill-opacity="1" />
                </g>
                <clipPath id="avatar">
                    <ellipse cx="16.58615016937256" cy="8.586184978485107" rx="5.656853675842285" ry="5.656853675842285"
                        transform="matrix(0.7071068286895752,0.7071068286895752,-0.7071068286895752,0.7071068286895752,5.272466477774856,-6.870199048298332)"
                        clip-rule="evenodd" />
                </clippath>
                <image :xlink:href="trans_bgc" width="22" height="22" x="0" y="0" clip-path="url(#avatar)"
                    preserveAspectRatio="none meet" />
                <g
                    transform="matrix(0.7071068286895752,0.7071068286895752,-0.7071068286895752,0.7071068286895752,5.272466477774856,-6.870199048298332)">
                    <ellipse cx="16.58615016937256" cy="8.586184978485107" rx="5.656853675842285" ry="5.656853675842285"
                        :fill="to_rgba(stop.color)" @mouseenter="(e) => stop_enter(e, index)" @mouseleave="stop_leave"
                        @mousedown.stop="(e) => stop_mousedown(e, stop.id!)" @mousemove="update_percent" />
                </g>
            </g>
        </g>
    </svg>
    <Percent v-if="percent_show" :x="percent_position.x" :y="percent_position.y" :size="percent"/>
    <Percent v-if="ellipse_show" :x="percent_position.x" :y="percent_position.y" :size="percent"/>
</template>