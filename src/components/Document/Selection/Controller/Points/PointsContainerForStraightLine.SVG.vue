<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncBaseAction, CtrlElementType, Matrix, PathShapeView, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive } from 'vue';
import { ClientXY, PageXY, SelectionTheme, XY } from '@/context/selection';
import { forbidden_to_modify_frame, getAngle, getHorizontalAngle } from '@/utils/common';
import { update_dot3 } from './common';
import { Point } from "../../SelectionView.vue";
import { Action } from '@/context/tool';
import { get_direction } from '@/utils/controllerFn';
import { get_rotate_for_straight } from '@/utils/attri_setting';
import { dbl_action } from "@/utils/mouse_interactive";
import { startEdit } from "@/transform/pathEdit";
import { LineHandler } from "@/transform/line";

interface Props {
    matrix: number[]
    context: Context
    shape: ShapeView
    axle: { x: number, y: number }
    cFrame: Point[]
    rotation: number
    theme: SelectionTheme
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
let { dots } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let asyncBaseAction: AsyncBaseAction | undefined = undefined;
let stickedX: boolean = false;
let stickedY: boolean = false;
let sticked_x_v: number = 0;
let sticked_y_v: number = 0;
const dragActiveDis = 3;
let cur_ctrl_type: CtrlElementType = CtrlElementType.LineStart;
let clear_stick = false
let index = -1;
let need_reset_cursor_after_transform = true;

let lineHandle: LineHandler | undefined;
let downXY: XY = { x: 0, y: 0 }

function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}

function update_dot_path() {
    dots.length = 0;

    const f = props.shape.frame;
    const m = new Matrix(matrix);
    m.preScale(f.width, f.height);

    const points = (props.shape as PathShapeView)?.segments[0]?.points;
    if (!points[0] || !points[1]) {
        return;
    }

    const p1 = m.computeCoord3(points[0]);
    const p2 = m.computeCoord3(points[1]);

    dots.push(...update_dot3([p1, p2]));
}

function point_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0) {
        return;
    }

    event.stopPropagation();

    if (dbl_action()) {
        return startEdit(props.context);
    }

    if (forbidden_to_modify_frame(props.shape)) {
        return;
    }

    lineHandle = new LineHandler(props.context, event, ele);
    downXY = event;

    cur_ctrl_type = ele;

    // set_status_on_down();
    //
    // startPosition = props.context.workspace.getContentXY(event);
    // index = idx;

    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
}

function point_mousemove(event: MouseEvent) {

    if (isDragging) {
        lineHandle?.execute(event);
    } else {
        if (Math.hypot(downXY.x - event.x, downXY.y - event.y) > dragActiveDis) {
            lineHandle?.createApiCaller();

            isDragging = true;
        }
    }

}

function get_t(index: number, p2: PageXY): PageXY {
    if (index === 0) {
        const m = props.shape.matrix2Root(), f = props.shape.frame
        m.preScale(f.width, f.height);
        const ap = (props.shape as PathShapeView).segments[0]?.points[1];
        const rb = m.computeCoord2(ap.x, ap.y);
        const type_d = get_direction(Math.floor(getHorizontalAngle(rb, p2)));
        if (type_d === 0) {
            p2.y = rb.y;
        } else if (type_d === 45) {
            const len = Math.hypot(p2.x - rb.x, p2.y - rb.y);
            p2.x = rb.x + len * Math.cos(0.25 * Math.PI), p2.y = rb.y + len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        } else if (type_d === 90) {
            p2.x = rb.x;
        } else if (type_d === 135) {
            const len = Math.hypot(p2.x - rb.x, p2.y - rb.y);
            p2.x = rb.x - len * Math.cos(0.25 * Math.PI), p2.y = rb.y + len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        } else if (type_d === 180) {
            p2.y = rb.y;
        } else if (type_d === 225) {
            const len = Math.hypot(p2.x - rb.x, p2.y - rb.y);
            p2.x = rb.x - len * Math.cos(0.25 * Math.PI), p2.y = rb.y - len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        } else if (type_d === 270) {
            p2.x = rb.x;
        } else if (type_d === 315) {
            const len = Math.hypot(p2.x - rb.x, p2.y - rb.y);
            p2.x = rb.x + len * Math.cos(0.25 * Math.PI), p2.y = rb.y - len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        }
        return p2;
    } else if (index === 1) {
        const m = props.shape.matrix2Root(), f = props.shape.frame
        m.preScale(f.width, f.height);
        const ap = (props.shape as PathShapeView).segments[0]?.points[0];
        const lt = m.computeCoord2(ap.x, ap.y);
        const type_d = get_direction(Math.floor(getHorizontalAngle(lt, p2)));
        if (type_d === 0) {
            p2.y = lt.y;
        } else if (type_d === 45) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x + len * Math.cos(0.25 * Math.PI), p2.y = lt.y + len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        } else if (type_d === 90) {
            p2.x = lt.x;
        } else if (type_d === 135) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x - len * Math.cos(0.25 * Math.PI), p2.y = lt.y + len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        } else if (type_d === 180) {
            p2.y = lt.y;
        } else if (type_d === 225) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x - len * Math.cos(0.25 * Math.PI), p2.y = lt.y - len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        } else if (type_d === 270) {
            p2.x = lt.x;
        } else if (type_d === 315) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x + len * Math.cos(0.25 * Math.PI), p2.y = lt.y - len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        }
        return p2;
    } else {
        return p2;
    }
}

function scale(asyncBaseAction: AsyncBaseAction, p2: PageXY) {
    const stickness = props.context.assist.stickness;
    const target = props.context.assist.point_match(p2);
    if (target) {
        if (stickedX) {
            if (Math.abs(p2.x - sticked_x_v) > stickness) stickedX = false;
            else p2.x = sticked_x_v;
        } else if (target.sticked_by_x) {
            p2.x = target.x;
            sticked_x_v = p2.x;
            stickedX = true;
        }
        if (stickedY) {
            if (Math.abs(p2.y - sticked_y_v) > stickness) stickedY = false;
            else p2.y = sticked_y_v;
        } else if (target.sticked_by_y) {
            p2.y = target.y;
            sticked_y_v = p2.y;
            stickedY = true;
        }
    }
    const align = props.context.user.isPixelAlignMent;
    if (align) {
        p2.x = Math.round(p2.x);
        p2.y = Math.round(p2.y);
    }
    asyncBaseAction.executeForLine(index, p2);
}

function scale2(asyncBaseAction: AsyncBaseAction, p2: PageXY) {
    props.context.assist.point_match(p2);
    asyncBaseAction.executeForLine(index, p2);
}

function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }
    clear_status();
}

function setCursor(t: CtrlElementType, active = false) {
    const cursor = props.context.cursor;

    let deg = get_rotate_for_straight(props.shape as PathShapeView);

    if (t === CtrlElementType.LineStart) {
        deg = 0;
    } else if (t === CtrlElementType.LineEnd) {
        deg = 0;
    } else if (t === CtrlElementType.LineStartR) {
        deg = deg - 180;
    }

    const type = t.endsWith('rotate') ? 'rotate' : 'extend';

    active
        ? cursor.setTypeForce(type, deg)
        : cursor.setType(type, deg);
}

function for_rotate(p1: XY, p2: XY) {
    if (dots.length !== 2) {
        console.log('!dots.length !== 2');
        return;
    }
    if (!asyncBaseAction) {
        console.log('!asyncBaseAction');
        return;
    }
    const __p1 = dots[0];
    const __p2 = dots[1];
    const ax = (__p1.point.x + __p2.point.x) / 2;
    const ay = (__p1.point.y + __p2.point.y) / 2;
    let deg = 0;
    deg = getAngle([ax, ay, p1.x, p1.y], [ax, ay, p2.x, p2.y]) || 0;
    if (props.shape.isFlippedHorizontal) {
        deg = -deg;
    }
    if (props.shape.isFlippedVertical) {
        deg = -deg;
    }
    asyncBaseAction.executeRotate(deg);
    setCursor(cur_ctrl_type, true);
}

function point_mouseenter(t: CtrlElementType) {
    need_reset_cursor_after_transform = false;
    setCursor(t);
}

function point_mouseleave() {
    props.context.cursor.reset();
    need_reset_cursor_after_transform = true;
}

function window_blur() {
    clear_status();
}

function set_status_on_down() {
    props.context.menu.menuMount();

    props.context.cursor.cursor_freeze(true);

    const workspace = props.context.workspace;
    workspace.setCtrl('controller');
    cur_ctrl_type
        .endsWith('rotate')
        ? workspace.rotating(true)
        : workspace.scaling(true);
}

function set_status_before_action() {
    props.context.assist.set_trans_target([props.shape]);
}

function clear_status() {
    // if (asyncBaseAction) {
    //     asyncBaseAction = asyncBaseAction.close();
    // }

    // if (isDragging) {
    //     props.context.assist.reset();
    //     isDragging = false;
    // }

    // const workspace = props.context.workspace;
    // workspace.scaling(false);
    // workspace.rotating(false);
    // workspace.setCtrl('page');

    // props.context.cursor.cursor_freeze(false);
    isDragging = false

    lineHandle?.fulfil();
    lineHandle = undefined;

    if (need_reset_cursor_after_transform) {
        props.context.cursor.reset();
    }

    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
}

watch(() => props.matrix, update);
watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})
onMounted(() => {
    props.shape.watch(update);
    window.addEventListener('blur', window_blur);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
    <g v-for="(p, i) in dots" :key="i" :style="`transform: ${p.r.transform};`">
        <path :d="p.r.p" class="r-path" @mousedown.stop="(e) => point_mousedown(e, p.type2)"
              @mouseenter="() => point_mouseenter(p.type2)" @mouseleave="point_mouseleave">
        </path>
        <g @mousedown.stop="(e) => point_mousedown(e, p.type)" @mouseenter="() => point_mouseenter(p.type)"
           @mouseleave="point_mouseleave">
            <rect :x="p.extra.x" :y="p.extra.y" class="assist-rect"></rect>
            <rect :x="p.point.x" :y="p.point.y" class="main-rect" rx="2px" :stroke="theme"></rect>
        </g>
    </g>
</template>
<style lang='scss' scoped>
.r-path {
    fill: transparent;
    stroke: transparent;
}

.main-rect {
    width: 8px;
    height: 8px;
    fill: #ffffff;
}

.assist-rect {
    width: 14px;
    height: 14px;
    fill: transparent;
    stroke: transparent;
}
</style>