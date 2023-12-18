<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncBaseAction, CtrlElementType, Matrix, PathShape, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive, ref } from 'vue';
import { ClientXY, PageXY, XY } from '@/context/selection';
import { getAngle, getHorizontalAngle } from '@/utils/common';
import { update_dot3 } from './common';
import { Point } from "../../SelectionView.vue";
import { Action } from '@/context/tool';
import { get_direction } from '@/utils/controllerFn';
import { get_rotate_for_straight } from '@/utils/attri_setting';

interface Props {
    matrix: number[]
    context: Context
    shape: Shape
    axle: { x: number, y: number }
    cFrame: Point[]
    rotation: number
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
const reflush = ref<number>(0);
let { dots } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let asyncBaseAction: AsyncBaseAction | undefined = undefined;
let stickedX: boolean = false;
let stickedY: boolean = false;
let sticked_x_v: number = 0;
let sticked_y_v: number = 0;
const dragActiveDis = 3;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;
let clear_stick = false
let index = -1;
function update() {
    matrix.reset(props.matrix);
    update_dot_path();
    reflush.value++;
}
function update_dot_path() {
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        return;
    }
    dots.length = 0;
    const f = props.shape.frame;
    const m = new Matrix(matrix);
    m.preScale(f.width, f.height);
    const points = (props.shape as PathShape).points;
    if (points.length < 2) {
        console.log('points.length < 2');
        return;
    }
    const p1 = m.computeCoord3(points[0]);
    const p2 = m.computeCoord3(points[1]);
    dots = dots.concat(update_dot3([p1, p2]));
}
function point_mousedown(event: MouseEvent, ele: CtrlElementType, idx: number) {
    if (event.button !== 0) return;
    props.context.menu.menuMount();
    const workspace = props.context.workspace;
    event.stopPropagation();
    workspace.setCtrl('controller');
    const { clientX, clientY } = event;
    matrix.reset(workspace.matrix);
    const root = workspace.root;
    startPosition = { x: clientX - root.x, y: clientY - root.y };
    cur_ctrl_type = ele;
    index = idx;
    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);

}
function point_mousemove(event: MouseEvent) {
    const { clientX, clientY } = event;
    const workspace = props.context.workspace;
    const root = workspace.root;
    const mouseOnClient: ClientXY = { x: clientX - root.x, y: clientY - root.y };
    const { x: sx, y: sy } = startPosition;
    const { x: mx, y: my } = mouseOnClient;
    if (isDragging && asyncBaseAction) {
        if (cur_ctrl_type.endsWith('rotate')) {
            for_rotate(startPosition, mouseOnClient);
        } else {
            const action = props.context.tool.action;
            let p2: PageXY = submatrix.computeCoord2(mouseOnClient.x, mouseOnClient.y);
            clear_stick = false;
            if (event.shiftKey || props.shape.constrainerProportions || action === Action.AutoK) {
                p2 = get_t(index, p2);
            }
            if (clear_stick) {
                scale2(asyncBaseAction, p2);
            } else {
                scale(asyncBaseAction, p2);
            }
        }
        startPosition = { ...mouseOnClient };
        setCursor(cur_ctrl_type, true);
    } else {
        if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
            isDragging = true;
            submatrix.reset(workspace.matrix.inverse);
            cur_ctrl_type.endsWith('rotate') ? workspace.rotating(true) : workspace.scaling(true);
            asyncBaseAction = props.context.editor.controller().asyncRectEditor(props.shape, props.context.selection.selectedPage!);
            props.context.assist.set_trans_target([props.shape]);
        }
    }
}
function get_t(index: number, p2: PageXY): PageXY {
    if (index === 0) {
        const m = props.shape.matrix2Root(), f = props.shape.frame
        m.preScale(f.width, f.height);
        const ap = (props.shape as PathShape).points[1];
        const rb = m.computeCoord2(ap.x, ap.y);
        const type_d = get_direction(Math.floor(getHorizontalAngle(rb, p2)));
        if (type_d === 0) {
            p2.y = rb.y;
        }
        else if (type_d === 45) {
            const len = Math.hypot(p2.x - rb.x, p2.y - rb.y);
            p2.x = rb.x + len * Math.cos(0.25 * Math.PI), p2.y = rb.y + len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        } else if (type_d === 90) {
            p2.x = rb.x;
        }
        else if (type_d === 135) {
            const len = Math.hypot(p2.x - rb.x, p2.y - rb.y);
            p2.x = rb.x - len * Math.cos(0.25 * Math.PI), p2.y = rb.y + len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        } else if (type_d === 180) {
            p2.y = rb.y;
        }
        else if (type_d === 225) {
            const len = Math.hypot(p2.x - rb.x, p2.y - rb.y);
            p2.x = rb.x - len * Math.cos(0.25 * Math.PI), p2.y = rb.y - len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        } else if (type_d === 270) {
            p2.x = rb.x;
        }
        else if (type_d === 315) {
            const len = Math.hypot(p2.x - rb.x, p2.y - rb.y);
            p2.x = rb.x + len * Math.cos(0.25 * Math.PI), p2.y = rb.y - len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        }
        return p2;
    } else if (index === 1) {
        const m = props.shape.matrix2Root(), f = props.shape.frame
        m.preScale(f.width, f.height);
        const ap = (props.shape as PathShape).points[0];
        const lt = m.computeCoord2(ap.x, ap.y);
        const type_d = get_direction(Math.floor(getHorizontalAngle(lt, p2)));
        if (type_d === 0) {
            p2.y = lt.y;
        }
        else if (type_d === 45) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x + len * Math.cos(0.25 * Math.PI), p2.y = lt.y + len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        } else if (type_d === 90) {
            p2.x = lt.x;
        }
        else if (type_d === 135) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x - len * Math.cos(0.25 * Math.PI), p2.y = lt.y + len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        } else if (type_d === 180) {
            p2.y = lt.y;
        }
        else if (type_d === 225) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x - len * Math.cos(0.25 * Math.PI), p2.y = lt.y - len * Math.sin(0.25 * Math.PI);
            clear_stick = true;
        } else if (type_d === 270) {
            p2.x = lt.x;
        }
        else if (type_d === 315) {
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
    asyncBaseAction.executeForLine(index, p2);
}
function scale2(asyncBaseAction: AsyncBaseAction, p2: PageXY) {
    props.context.assist.point_match(p2);
    asyncBaseAction.executeForLine(index, p2);
}
function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) return;
    if (isDragging) {
        props.context.assist.reset();
        isDragging = false;
    }
    if (asyncBaseAction) asyncBaseAction = asyncBaseAction.close();
    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
    const workspace = props.context.workspace;
    workspace.scaling(false);
    workspace.rotating(false);
    workspace.setCtrl('page');
    props.context.cursor.reset();
}
function setCursor(t: CtrlElementType, force?: boolean) {
    const cursor = props.context.cursor;
    let deg = get_rotate_for_straight(props.shape as PathShape);
    if (t === CtrlElementType.RectLT) {
        cursor.setType('extend-0', force);
    } else if (t === CtrlElementType.RectRB) {
        cursor.setType('extend-0', force);
    } else if (t === CtrlElementType.RectLTR) {
        deg = deg - 180;
        cursor.setType(`rotate-${deg}`, force);
    } else if (t === CtrlElementType.RectRBR) {
        cursor.setType(`rotate-${deg}`, force);
    }
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
}
function point_mouseleave() {
    props.context.cursor.reset();
}
function window_blur() {
    const workspace = props.context.workspace;
    if (isDragging) {
        props.context.assist.reset();
        isDragging = false;
    }
    if (asyncBaseAction) asyncBaseAction = asyncBaseAction.close();
    workspace.scaling(false);
    workspace.rotating(false);
    workspace.setCtrl('page');
    props.context.cursor.reset();
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
    <g :reflush="reflush">
        <g v-for="(p, i) in dots" :key="i" :style="`transform: ${p.r.transform};`">
            <path :d="p.r.p" fill="transparent" stroke="transparent" @mousedown.stop="(e) => point_mousedown(e, p.type2, i)"
                @mouseenter="() => setCursor(p.type2)" @mouseleave="point_mouseleave">
            </path>
            <rect :x="p.extra.x" :y="p.extra.y" width="14px" height="14px" fill="transparent" stroke='transparent'
                @mousedown.stop="(e) => point_mousedown(e, p.type, i)" @mouseenter="() => setCursor(p.type)"
                @mouseleave="point_mouseleave">
            </rect>
            <rect :x="p.point.x" :y="p.point.y" width="8px" height="8px" fill="#ffffff" stroke='#1878f5'
                stroke-width="1.5px" @mousedown.stop="(e) => point_mousedown(e, p.type, i)"
                @mouseenter="() => setCursor(p.type)" @mouseleave="point_mouseleave"></rect>
        </g>
    </g>
</template>
<style lang='scss' scoped></style>