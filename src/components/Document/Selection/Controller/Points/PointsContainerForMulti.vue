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
import { ScaleHandler } from '@/transform/scale';

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
let need_reset_cursor_after_transform = true;

let scaler: ScaleHandler | undefined = undefined;

// #region view
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
// #endregion

// #region main flow
function point_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0) {
        return;
    }
    event.stopPropagation();

    cur_ctrl_type = ele;

    // set_status_on_down();

    startPosition = props.context.workspace.getContentXY(event);

    scaler = new ScaleHandler(props.context, props.context.selection.selectedShapes, event, cur_ctrl_type);

    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
}
function point_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;
    const { x: sx, y: sy } = startPosition;
    const { x: mx, y: my } = workspace.getContentXY(event)
    const { x: ax, y: ay } = props.axle;
    // if (isDragging && asyncMultiAction) {
    if (isDragging) {
        if (cur_ctrl_type.endsWith('rotate')) {
            const deg = getAngle([ax, ay, sx, sy], [ax, ay, mx, my]) || 0;
            const root_axle = submatrix.computeCoord(ax, ay);

            const r = new Matrix();
            r.rotate(deg * (Math.PI / 180), root_axle.x, root_axle.y);

            // asyncMultiAction.executeRotate(deg, r);

            props.context.cursor.setTypeForce('rotate', getHorizontalAngle(props.axle, { x: mx, y: my }));
        } else {
            // const action = props.context.tool.action;
            // (event.shiftKey || action === Action.AutoK)
            //     ? er_scale(asyncMultiAction, sx, sy, mx, my)
            //     : irregular_scale(asyncMultiAction, sx, sy, mx, my);
            scaler?.excute(event);
        }

        startPosition = { x: mx, y: my };

        props.context.nextTick(props.context.selection.selectedPage!, () => {
            workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
        })
    } else if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
        // set_status_before_action();

        const shapes = shapes_organize(props.context.selection.selectedShapes);
        const page = props.context.selection.selectedPage!;

        // asyncMultiAction = props.context.editor
        //     .controller()
        //     .asyncMultiEditor(shapes.map((s) => adapt2Shape(s)), page);

        submatrix.reset(workspace.matrix.inverse);

        scaler?.createApiCaller();


        isDragging = true;
    }
}
function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }

    clear_status();
}
// #endregion

// #region utils
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
function setCursor(t: CtrlElementType) {
    const cursor = props.context.cursor;
    let deg = 0;
    if (t === CtrlElementType.RectLT) {
        deg = deg + 45;
    } else if (t === CtrlElementType.RectLTR) {
        deg = deg + 225;
    } else if (t === CtrlElementType.RectRT) {
        deg = deg + 135;
    } else if (t === CtrlElementType.RectRTR) {
        deg = deg + 315;
    } else if (t === CtrlElementType.RectRB) {
        deg = deg + 45;
    } else if (t === CtrlElementType.RectRBR) {
        deg = deg + 45;
    } else if (t === CtrlElementType.RectLB) {
        deg = deg + 135;
    } else if (t === CtrlElementType.RectLBR) {
        deg = deg + 135;
    }
    const type = t.endsWith('rotate') ? 'rotate' : 'scale';

    cursor.setType(type, deg);
}
function set_status_on_down() {
    props.context.menu.menuMount()

    const workspace = props.context.workspace;
    if (cur_ctrl_type.endsWith('rotate')) {
        workspace.rotating(true);
    } else {
        setCursor(cur_ctrl_type);
        workspace.scaling(true);
    }

    props.context.cursor.cursor_freeze(true);
}
function set_status_before_action() {
    props.context.workspace.setSelectionViewUpdater(false);
}
function clear_status() {
    const workspace = props.context.workspace;
    // workspace.scaling(false);
    // workspace.rotating(false);
    // workspace.setCtrl('page');

    if (isDragging) {
        isDragging = false;
        scaler?.fulfil();
    }

    // if (asyncMultiAction) {
    //     asyncMultiAction.close();
    //     asyncMultiAction = undefined;
    //     workspace.setSelectionViewUpdater(true);
    // }


    props.context.cursor.cursor_freeze(false);
    if (need_reset_cursor_after_transform) {
        props.context.cursor.reset();
    }

    scaler = undefined;

    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
}
function point_mouseenter(t: CtrlElementType) {
    need_reset_cursor_after_transform = false;
    setCursor(t);
}
function point_mouseleave() {
    need_reset_cursor_after_transform = true;
    props.context.cursor.reset();
}
function frame_watcher() {
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        passive_update();
    }
}
function keydown(event: KeyboardEvent) {
    if (event.repeat) {
        return;
    }
    if (event.shiftKey) {
        scaler?.modifyShiftStatus(true);
    }
    if (event.altKey) {
        scaler?.modifyAltStatus(true);
    }
}
function keyUp(event: KeyboardEvent) {
    if (event.code === 'ShiftLeft') {
        scaler?.modifyShiftStatus(false);
    }
    if (event.code === 'AltLeft') {
        scaler?.modifyAltStatus(false);
    }
}
function window_blur() {
    clear_status();
}
// #endregion

// #region lifecycle hooks
watch(() => props.frame, frame_watcher);
watch(() => props.matrix, update);
onMounted(() => {
    window.addEventListener('blur', window_blur);
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyUp);
    update();
})
onUnmounted(() => {
    window.removeEventListener('blur', window_blur);
    document.removeEventListener('keydown', keydown);
    document.removeEventListener('keyup', keyUp);
})
// #endregion
</script>
<template>
    <g v-for="(p, i) in dots" :key="i" :style="`transform: ${p.r.transform};`">
        <path :d="p.r.p" class="r-path" @mousedown.stop="(e) => point_mousedown(e, p.type2)"
            @mouseenter="() => point_mouseenter(p.type2)" @mouseleave="point_mouseleave">
        </path>
        <g @mousedown.stop="(e) => point_mousedown(e, p.type)" @mouseenter="() => point_mouseenter(p.type)"
            @mouseleave="point_mouseleave">
            <rect :x="p.extra.x" :y="p.extra.y" class="assist-rect"></rect>
            <rect :x="p.point.x" :y="p.point.y" class="main-rect" rx="2px"></rect>
        </g>
    </g>
</template>
<style lang="scss" scoped>
.r-path {
    stroke: none;
    fill: transparent;
}

.main-rect {
    width: 8px;
    height: 8px;
    fill: #ffffff;
    stroke: var(--active-color);
}

.assist-rect {
    width: 14px;
    height: 14px;
    fill: transparent;
    stroke: transparent;
}
</style>