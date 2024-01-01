<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncMultiAction, CtrlElementType, Matrix, adapt2Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, watch } from 'vue';
import { ClientXY } from '@/context/selection';
import { Point } from '../../SelectionView.vue';
import { update_dot2 } from './common';
import { getAngle, getHorizontalAngle, shapes_organize } from '@/utils/common';
import { Action } from '@/context/tool';
import { WorkSpace } from '@/context/workspace';
interface Props {
    matrix: number[]
    context: Context
    frame: Point[]
    axle: { x: number, y: number }
}
interface Dot {
    point: { x: number, y: number }
    extra: { x: number, y: number }
    r: { p: string, transform: string }
    type: CtrlElementType
    type2: CtrlElementType
}
const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = new Matrix();
const data: { dots: Dot[] } = reactive({ dots: [] });
const { dots } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let asyncMultiAction: AsyncMultiAction | undefined = undefined;
const dragActiveDis = 3;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;
function update() {
    // const s = Date.now();
    matrix.reset(props.matrix);
    update_dot_path();
    // console.log('绘制控点用时(ms):', Date.now() - s);
}
function update_dot_path() {
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        return;
    }

    dots.length = 0;
    dots.push(...update_dot2(props.frame));
}
function passive_update() {
    matrix.reset(props.matrix);
    dots.length = 0;
    dots.push(...update_dot2(props.frame));
}
function point_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0) {
        return;
    }
    props.context.menu.menuMount()
    const workspace = props.context.workspace;
    event.stopPropagation();
    workspace.setCtrl('controller');
    const { clientX, clientY } = event;
    matrix.reset(workspace.matrix);
    const root = workspace.root;
    startPosition = { x: clientX - root.x, y: clientY - root.y };
    cur_ctrl_type = ele;
    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
}
function point_mousemove(event: MouseEvent) {
    const { clientX, clientY } = event;
    const workspace = props.context.workspace;
    const root = workspace.root;
    const { x: sx, y: sy } = startPosition;
    const { x: mx, y: my } = { x: clientX - root.x, y: clientY - root.y };
    const { x: ax, y: ay } = props.axle;
    if (isDragging && asyncMultiAction) {
        if (cur_ctrl_type.endsWith('rotate')) {
            let deg = getAngle([ax, ay, sx, sy], [ax, ay, mx, my]) || 0;
            const root_axle = submatrix.computeCoord(ax, ay); // 中心点在root的位置
            const r = new Matrix();
            r.rotate(deg * (Math.PI / 180), root_axle.x, root_axle.y); // 控件旋转矩阵
            asyncMultiAction.executeRotate(deg, r);
            props.context.cursor.setType('rotate', getHorizontalAngle(props.axle, { x: mx, y: my }), true);
        } else {
            const action = props.context.tool.action;
            (event.shiftKey || action === Action.AutoK) ? er_scale(asyncMultiAction, sx, sy, mx, my) : irregular_scale(asyncMultiAction, sx, sy, mx, my);
        }
        startPosition = { x: mx, y: my };
        workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
    } else if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
        isDragging = true;

        const shapes = shapes_organize(props.context.selection.selectedShapes);
        const page = props.context.selection.selectedPage;

        asyncMultiAction = props.context.editor
            .controller()
            .asyncMultiEditor(shapes.map((s) => adapt2Shape(s)), page!.data);

        if (cur_ctrl_type.endsWith('rotate')) {
            workspace.rotating(true);
        } else {
            setCursor(cur_ctrl_type);
            workspace.scaling(true);
        }

        workspace.setSelectionViewUpdater(false);
        submatrix.reset(workspace.matrix.inverse);
    }
}
function er_scale(asyncMultiAction: AsyncMultiAction, sx: number, sy: number, mx: number, my: number) {
    if (cur_ctrl_type === CtrlElementType.RectLT) {
        const f_lt = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_rb = submatrix.computeCoord(props.frame[2].x, props.frame[2].y);
        const o_w = f_rb.x - f_lt.x;
        const o_h = f_rb.y - f_lt.y;
        const s = submatrix.computeCoord(sx, sy);
        const e = submatrix.computeCoord(mx, my);
        const trans = { x: e.x - s.x, y: e.y - s.y };
        const _w = o_w - trans.x;
        const _h = o_h - trans.y;
        if (_w < 0) cur_ctrl_type = o_h < 0 ? CtrlElementType.RectRB : CtrlElementType.RectRT;
        if (_h < 0) cur_ctrl_type = _w < 0 ? CtrlElementType.RectRB : CtrlElementType.RectLB;
        const scale = _w / o_w;
        asyncMultiAction.executeScale(f_lt, { x: f_lt.x + (1 - scale) * o_w, y: f_lt.y + ((1 - scale) * o_h) / 2 }, scale, scale);
    } else if (cur_ctrl_type === CtrlElementType.RectRT) {
        const f_lt = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_rb = submatrix.computeCoord(props.frame[2].x, props.frame[2].y);
        const o_w = f_rb.x - f_lt.x;
        const o_h = f_rb.y - f_lt.y;
        const s = submatrix.computeCoord(sx, sy);
        const e = submatrix.computeCoord(mx, my);
        const trans = { x: e.x - s.x, y: e.y - s.y };
        const _w = o_w + trans.x;
        const _h = o_h - trans.y;
        if (_w < 0) cur_ctrl_type = o_h < 0 ? CtrlElementType.RectLB : CtrlElementType.RectLT;
        if (_h < 0) cur_ctrl_type = _w < 0 ? CtrlElementType.RectLB : CtrlElementType.RectRB;
        const scale = _w / o_w;
        asyncMultiAction.executeScale(f_lt, { x: f_lt.x, y: f_lt.y + ((1 - scale) * o_h) / 2 }, scale, scale);
    } else if (cur_ctrl_type === CtrlElementType.RectRB) {
        const origin = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_lt = props.frame[0];
        const f_rb = props.frame[2];
        const o_w = f_rb.x - f_lt.x;
        const o_h = f_rb.y - f_lt.y;
        const trans = { x: mx - sx, y: my - sy };
        if (Math.abs(o_w + trans.x) < 1 || Math.abs(o_h + trans.y) < 1) return startPosition = { x: mx, y: my };
        const _w = o_w + trans.x;
        const _h = o_h + trans.y;
        if (_w < 0) cur_ctrl_type = o_h < 0 ? CtrlElementType.RectLT : CtrlElementType.RectLB;
        if (_h < 0) cur_ctrl_type = _w < 0 ? CtrlElementType.RectLT : CtrlElementType.RectRT;
        const scale = _w / o_w;
        asyncMultiAction.executeScale(origin, { x: origin.x, y: origin.y + ((1 - scale) * o_h) / 2 }, scale, scale);
    } else if (cur_ctrl_type === CtrlElementType.RectLB) {
        const f_lt = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_rb = submatrix.computeCoord(props.frame[2].x, props.frame[2].y);
        const o_w = f_rb.x - f_lt.x;
        const o_h = f_rb.y - f_lt.y;
        const s = submatrix.computeCoord(sx, sy);
        const e = submatrix.computeCoord(mx, my);
        const trans = { x: e.x - s.x, y: e.y - s.y };
        const _w = o_w - trans.x;
        const _h = o_h + trans.y;
        if (_w < 0) cur_ctrl_type = o_h < 0 ? CtrlElementType.RectRT : CtrlElementType.RectRB;
        if (_h < 0) cur_ctrl_type = _w < 0 ? CtrlElementType.RectRT : CtrlElementType.RectLT;
        const scale = _w / o_w;
        asyncMultiAction.executeScale(f_lt, { x: f_lt.x + (1 - scale) * o_w, y: f_lt.y + ((1 - scale) * o_h) / 2 }, scale, scale);
    }
}
function irregular_scale(asyncMultiAction: AsyncMultiAction, sx: number, sy: number, mx: number, my: number) {
    if (cur_ctrl_type === CtrlElementType.RectLT) {
        const f_lt = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_rb = submatrix.computeCoord(props.frame[2].x, props.frame[2].y);
        const o_w = f_rb.x - f_lt.x;
        const o_h = f_rb.y - f_lt.y;
        const s = submatrix.computeCoord(sx, sy);
        const e = submatrix.computeCoord(mx, my);
        const trans = { x: e.x - s.x, y: e.y - s.y };
        const _w = o_w - trans.x;
        const _h = o_h - trans.y;
        if (_w < 0) cur_ctrl_type = o_h < 0 ? CtrlElementType.RectRB : CtrlElementType.RectRT;
        if (_h < 0) cur_ctrl_type = _w < 0 ? CtrlElementType.RectRB : CtrlElementType.RectLB;
        asyncMultiAction.executeScale(f_lt, { x: f_lt.x + trans.x, y: f_lt.y + trans.y }, _w / o_w, _h / o_h);
    } else if (cur_ctrl_type === CtrlElementType.RectRT) {
        const f_lt = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_rb = submatrix.computeCoord(props.frame[2].x, props.frame[2].y);
        const o_w = f_rb.x - f_lt.x;
        const o_h = f_rb.y - f_lt.y;
        const s = submatrix.computeCoord(sx, sy);
        const e = submatrix.computeCoord(mx, my);
        const trans = { x: e.x - s.x, y: e.y - s.y };
        const _w = o_w + trans.x;
        const _h = o_h - trans.y;
        if (_w < 0) cur_ctrl_type = o_h < 0 ? CtrlElementType.RectLB : CtrlElementType.RectLT;
        if (_h < 0) cur_ctrl_type = _w < 0 ? CtrlElementType.RectLB : CtrlElementType.RectRB;
        asyncMultiAction.executeScale(f_lt, { x: f_lt.x, y: f_lt.y + trans.y }, _w / o_w, _h / o_h);
    } else if (cur_ctrl_type === CtrlElementType.RectRB) {
        const origin = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_lt = props.frame[0];
        const f_rb = props.frame[2];
        const o_w = f_rb.x - f_lt.x;
        const o_h = f_rb.y - f_lt.y;
        const trans = { x: mx - sx, y: my - sy };
        if (Math.abs(o_w + trans.x) < 1 || Math.abs(o_h + trans.y) < 1) return startPosition = { x: mx, y: my };
        const _w = o_w + trans.x;
        const _h = o_h + trans.y;
        if (_w < 0) cur_ctrl_type = o_h < 0 ? CtrlElementType.RectLT : CtrlElementType.RectLB;
        if (_h < 0) cur_ctrl_type = _w < 0 ? CtrlElementType.RectLT : CtrlElementType.RectRT;
        asyncMultiAction.executeScale(origin, origin, _w / o_w, _h / o_h);
    } else if (cur_ctrl_type === CtrlElementType.RectLB) {
        const f_lt = submatrix.computeCoord(props.frame[0].x, props.frame[0].y);
        const f_rb = submatrix.computeCoord(props.frame[2].x, props.frame[2].y);
        const o_w = f_rb.x - f_lt.x;
        const o_h = f_rb.y - f_lt.y;
        const s = submatrix.computeCoord(sx, sy);
        const e = submatrix.computeCoord(mx, my);
        const trans = { x: e.x - s.x, y: e.y - s.y };
        const _w = o_w - trans.x;
        const _h = o_h + trans.y;
        if (_w < 0) cur_ctrl_type = o_h < 0 ? CtrlElementType.RectRT : CtrlElementType.RectRB;
        if (_h < 0) cur_ctrl_type = _w < 0 ? CtrlElementType.RectRT : CtrlElementType.RectLT;
        asyncMultiAction.executeScale(f_lt, { x: f_lt.x + trans.x, y: f_lt.y }, _w / o_w, _h / o_h);
    }
}
function point_mouseup(event: MouseEvent) {
    if (event.button === 0) {
        if (isDragging) {
            if (asyncMultiAction) {
                asyncMultiAction.close();
                asyncMultiAction = undefined;
            }
            isDragging = false;
            props.context.workspace.setSelectionViewUpdater(true);
        }
        document.removeEventListener('mousemove', point_mousemove);
        document.removeEventListener('mouseup', point_mouseup);
        action_end();
    }
}
function window_blur() {
    if (isDragging) isDragging = false;
    if (asyncMultiAction) {
        asyncMultiAction.close();
        asyncMultiAction = undefined;
    }
    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
    action_end();
}
function setCursor(t: CtrlElementType, force?: boolean) {
    const cursor = props.context.cursor;
    let deg = 0;
    if (t === CtrlElementType.RectLT) {
        deg = deg + 45;
        cursor.setType('scale', deg, force);
    } else if (t === CtrlElementType.RectLTR) {
        deg = deg + 225;
        cursor.setType('rotate', deg, force);
    } else if (t === CtrlElementType.RectRT) {
        deg = deg + 135;
        cursor.setType('scale', deg, force);
    } else if (t === CtrlElementType.RectRTR) {
        deg = deg + 315;
        cursor.setType('rotate', deg, force);
    } else if (t === CtrlElementType.RectRB) {
        deg = deg + 45;
        cursor.setType('scale', deg, force);
    } else if (t === CtrlElementType.RectRBR) {
        deg = deg + 45;
        cursor.setType('rotate', deg, force);
    } else if (t === CtrlElementType.RectLB) {
        deg = deg + 135;
        cursor.setType('scale', deg, force);
    } else if (t === CtrlElementType.RectLBR) {
        deg = deg + 135;
        cursor.setType('rotate', deg, force);
    }
}
function action_end() {
    const workspace = props.context.workspace;
    workspace.scaling(false);
    workspace.rotating(false);
    workspace.setCtrl('page');
    props.context.cursor.reset();
}
function point_mouseleave() {
    props.context.cursor.reset();
}
function frame_watcher() { if (!props.context.workspace.shouldSelectionViewUpdate) passive_update() }
watch(() => props.frame, frame_watcher);
watch(() => props.matrix, update);
onMounted(() => {
    window.addEventListener('blur', window_blur);
    update();
})
onUnmounted(() => {
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
    <g>
        <g v-for="(p, i) in dots" :key="i" :style="`transform: ${p.r.transform};`">
            <path :d="p.r.p" fill="transparent" stroke="none" @mousedown.stop="(e) => point_mousedown(e, p.type2)"
                @mouseenter="() => setCursor(p.type2)" @mouseleave="point_mouseleave">
            </path>
            <rect :x="p.extra.x" :y="p.extra.y" width="14px" height="14px" fill="transparent" stroke='transparent'
                @mousedown.stop="(e) => point_mousedown(e, p.type)" @mouseenter="() => setCursor(p.type)"
                @mouseleave="point_mouseleave"></rect>
            <rect :x="p.point.x" :y="p.point.y" class="main-rect" rx="2px"
                @mousedown.stop="(e) => point_mousedown(e, p.type)" @mouseenter="() => setCursor(p.type)"
                @mouseleave="point_mouseleave"></rect>
        </g>
    </g>
</template>
<style lang="scss" scoped>
.main-rect {
    width: 8px;
    height: 8px;
    fill: #ffffff;
    stroke: var(--active-color);
}
</style>