<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncMultiAction, CtrlElementType, Matrix } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive } from 'vue';
import { ClientXY } from '@/context/selection';
import { Point } from '../../SelectionView.vue';
import { Action } from '@/context/tool';
interface Props {
    matrix: number[]
    context: Context
    frame: Point[]
}
interface Bar {
    path: string
    type: CtrlElementType
}
const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = new Matrix();
const data: { bars: Bar[] } = reactive({ bars: [] });
const { bars } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let asyncMultiAction: AsyncMultiAction | undefined = undefined;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;
const dragActiveDis = 3;
const types = [CtrlElementType.RectTop, CtrlElementType.RectRight, CtrlElementType.RectBottom, CtrlElementType.RectLeft];
function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}
function update_dot_path() {
    if (!props.context.workspace.shouldSelectionViewUpdate) return;
    bars.length = 0;
    let apex = props.frame.map(p => { return { x: p.x, y: p.y } });
    apex.push(apex[0]);
    for (let i = 0; i < apex.length - 1; i++) {
        const p = get_bar_path(apex[i], apex[i + 1]);
        bars.push({ path: p, type: types[i] });
    }
}
function passive_update() {
    matrix.reset(props.matrix);
    bars.length = 0;
    let apex = props.frame.map(p => { return { x: p.x, y: p.y } });
    apex.push(apex[0]);
    for (let i = 0; i < apex.length - 1; i++) {
        const p = get_bar_path(apex[i], apex[i + 1]);
        bars.push({ path: p, type: types[i] });
    }
}
function get_bar_path(s: { x: number, y: number }, e: { x: number, y: number }): string {
    return `M ${s.x} ${s.y} L ${e.x} ${e.y} z`;
}
// mouse event flow: down -> move -> up
function bar_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button === 0) {
        props.context.menu.menuMount()
        event.stopPropagation();
        cur_ctrl_type = ele;
        const workspace = props.context.workspace;
        workspace.setCtrl('controller');
        matrix.reset(workspace.matrix);
        const root = workspace.root;
        startPosition = { x: event.clientX - root.x, y: event.clientY - root.y }
        document.addEventListener('mousemove', bar_mousemove);
        document.addEventListener('mouseup', bar_mouseup);
    }
}
function bar_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;
    const root = workspace.root;
    const { x: sx, y: sy } = startPosition;
    const { x: mx, y: my } = { x: event.clientX - root.x, y: event.clientY - root.y };
    if (isDragging && asyncMultiAction) {
        const action = props.context.tool.action;
        if (event.shiftKey || action === Action.AutoK) {
            er_scale(asyncMultiAction, sx, sy, mx, my);
        } else {
            irregular_scale(asyncMultiAction, sx, sy, mx, my);
        }
        startPosition = { x: mx, y: my };
        workspace.selectionViewUpdate();

    } else {
        if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
            isDragging = true;
            asyncMultiAction = props.context.editor.controller().asyncMultiEditor(props.context.selection.selectedShapes, props.context.selection.selectedPage!);
            submatrix.reset(workspace.matrix.inverse);
            setCursor(cur_ctrl_type);
            workspace.scaling(true);
            workspace.setSelectionViewUpdater(false);
        }
    }
}
function er_scale(asyncMultiAction: AsyncMultiAction, sx: number, sy: number, mx: number, my: number) {
    if (cur_ctrl_type === CtrlElementType.RectTop) {
        const f_lt = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_rb = submatrix.computeCoord(props.frame[2].x, props.frame[2].y);
        const o_h = f_rb.y - f_lt.y;
        const o_w = f_rb.x - f_lt.x;
        const s = submatrix.computeCoord(sx, sy);
        const e = submatrix.computeCoord(mx, my);
        const transy = e.y - s.y;
        const _h = o_h - transy;
        if (_h < 0) cur_ctrl_type = CtrlElementType.RectBottom;
        const scale = _h / o_h;
        asyncMultiAction.executeScale(f_lt, { x: f_lt.x + ((1 - scale) * o_w) / 2, y: f_lt.y + transy }, scale, scale);
    } else if (cur_ctrl_type === CtrlElementType.RectRight) {
        const origin = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_lt = props.frame[0];
        const f_rb = props.frame[2];
        const o_w = f_rb.x - f_lt.x;
        const o_h = f_rb.y - f_lt.y;
        const transx = mx - sx;
        const _w = o_w + transx;
        if (_w < 0) cur_ctrl_type = CtrlElementType.RectLeft;
        const scale = _w / o_w;
        asyncMultiAction.executeScale(origin, { x: origin.x, y: origin.y + ((1 - scale) * o_h) / 2 }, scale, scale);
    } else if (cur_ctrl_type === CtrlElementType.RectBottom) {
        const origin = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_lt = props.frame[0];
        const f_rb = props.frame[2];
        const o_w = f_rb.x - f_lt.x;
        const o_h = f_rb.y - f_lt.y;
        const transy = my - sy;
        const _h = o_h + transy;
        if (_h < 0) cur_ctrl_type = CtrlElementType.RectTop;
        const scale = _h / o_h;
        asyncMultiAction.executeScale(origin, { x: origin.x + ((1 - scale) * o_w) / 2, y: origin.y }, scale, scale);
    } else if (cur_ctrl_type === CtrlElementType.RectLeft) {
        const f_lt = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_rb = submatrix.computeCoord(props.frame[2].x, props.frame[2].y);
        const o_w = f_rb.x - f_lt.x;
        const o_h = f_rb.y - f_lt.y;
        const s = submatrix.computeCoord(sx, sy);
        const e = submatrix.computeCoord(mx, my);
        const transx = e.x - s.x;
        const _w = o_w - transx;
        if (_w < 0) cur_ctrl_type = CtrlElementType.RectRight;
        const scale = _w / o_w;
        asyncMultiAction.executeScale(f_lt, { x: f_lt.x, y: f_lt.y + ((1 - scale) * o_h) / 2 }, scale, scale);
    }
}
function irregular_scale(asyncMultiAction: AsyncMultiAction, sx: number, sy: number, mx: number, my: number) {
    if (cur_ctrl_type === CtrlElementType.RectTop) {
        const f_lt = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_rb = submatrix.computeCoord(props.frame[2].x, props.frame[2].y);
        const o_h = f_rb.y - f_lt.y;
        const s = submatrix.computeCoord(sx, sy);
        const e = submatrix.computeCoord(mx, my);
        const transy = e.y - s.y;
        const _h = o_h - transy;
        if (_h < 0) cur_ctrl_type = CtrlElementType.RectBottom;
        asyncMultiAction.executeScale(f_lt, { x: f_lt.x, y: f_lt.y + transy }, 1, _h / o_h);
    } else if (cur_ctrl_type === CtrlElementType.RectRight) {
        const origin = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_lt = props.frame[0];
        const f_rb = props.frame[2];
        const o_w = f_rb.x - f_lt.x;
        const transx = mx - sx;
        const _w = o_w + transx;
        if (_w < 0) cur_ctrl_type = CtrlElementType.RectLeft;
        asyncMultiAction.executeScale(origin, origin, _w / o_w, 1);
    } else if (cur_ctrl_type === CtrlElementType.RectBottom) {
        const origin = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_lt = props.frame[0];
        const f_rb = props.frame[2];
        const o_h = f_rb.y - f_lt.y;
        const transy = my - sy;
        const _h = o_h + transy;
        if (_h < 0) cur_ctrl_type = CtrlElementType.RectTop;
        asyncMultiAction.executeScale(origin, origin, 1, _h / o_h);
    } else if (cur_ctrl_type === CtrlElementType.RectLeft) {
        const f_lt = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_rb = submatrix.computeCoord(props.frame[2].x, props.frame[2].y);
        const o_w = f_rb.x - f_lt.x;
        const s = submatrix.computeCoord(sx, sy);
        const e = submatrix.computeCoord(mx, my);
        const transx = e.x - s.x;
        const _w = o_w - transx;
        if (_w < 0) cur_ctrl_type = CtrlElementType.RectRight;
        asyncMultiAction.executeScale(f_lt, { x: f_lt.x + transx, y: f_lt.y }, _w / o_w, 1);
    }
}
function bar_mouseup(event: MouseEvent) {
    if (event.button === 0) {
        if (isDragging) {
            if (asyncMultiAction) {
                asyncMultiAction.close();
                asyncMultiAction = undefined;
            }
            isDragging = false;
            props.context.workspace.setSelectionViewUpdater(true);
        }
        document.removeEventListener('mousemove', bar_mousemove);
        document.removeEventListener('mouseup', bar_mouseup);
        const workspace = props.context.workspace;
        workspace.scaling(false);
        workspace.setCtrl('page');
        props.context.cursor.reset();
    }
}
function setCursor(t: CtrlElementType, force?: boolean) {
    if (t === CtrlElementType.RectTop) props.context.cursor.setType('scale-90', force);
    else if (t === CtrlElementType.RectRight) props.context.cursor.setType('scale-0', force);
    else if (t === CtrlElementType.RectBottom) props.context.cursor.setType('scale-90', force);
    else if (t === CtrlElementType.RectLeft) props.context.cursor.setType('scale-0', force);
}
function bar_mouseleave() {
    props.context.cursor.setType('auto-0');
}
function window_blur() {
    if (isDragging) isDragging = false;
    if (asyncMultiAction) asyncMultiAction = undefined;
    const workspace = props.context.workspace;
    workspace.scaling(false);
    workspace.setCtrl('page');
    props.context.cursor.reset();
    document.removeEventListener('mousemove', bar_mousemove);
    document.removeEventListener('mouseup', bar_mouseup);
}

function frame_watcher() { if (!props.context.workspace.shouldSelectionViewUpdate) passive_update() }
watch(() => props.frame, frame_watcher);
watch(() => props.matrix, update);
onMounted(() => {
    update();
    window.addEventListener('blur', window_blur);
})
onUnmounted(() => {
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
    <g>
        <g v-for="(b, i) in bars" :key="i">
            <path :d="b.path" fill="none" stroke='#865dff' stroke-width="1.5px"
                @mousedown.stop="(e) => bar_mousedown(e, b.type)" @mouseenter="() => setCursor(b.type)"
                @mouseleave="bar_mouseleave">
            </path>
            <path :d="b.path" fill="none" stroke='transparent' stroke-width="10px"
                @mousedown.stop="(e) => bar_mousedown(e, b.type)" @mouseenter="() => setCursor(b.type)"
                @mouseleave="bar_mouseleave">
            </path>
        </g>
    </g>
</template>
<style lang='scss' scoped></style>