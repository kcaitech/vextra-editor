<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncBaseAction, CtrlElementType, Matrix, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
import { forbidden_to_modify_frame, getAngle } from '@/utils/common';
import { get_real_rotation, get_transform, update_dot } from './common';
import { Point } from "../../SelectionView.vue";
import { Action } from '@/context/tool';

interface Props {
    matrix: number[]
    context: Context
    shape: Shape
    axle: { x: number, y: number }
    cFrame: Point[]
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
let asyncBaseAction: AsyncBaseAction | undefined = undefined;
let stickedX: boolean = false;
let stickedY: boolean = false;
let sticked_x_v: number = 0;
let sticked_y_v: number = 0;

const dragActiveDis = 3;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;

function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}

function update_dot_path() {
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        return;
    }

    dots.length = 0;
    const frame = props.shape.frame;
    let lt = matrix.computeCoord(0, 0);
    let rt = matrix.computeCoord(frame.width, 0);
    let rb = matrix.computeCoord(frame.width, frame.height);
    let lb = matrix.computeCoord(0, frame.height);

    dots.push(...update_dot([lt, rt, rb, lb], props.shape));
}

function point_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0) {
        return;
    }

    props.context.menu.menuMount();

    if (forbidden_to_modify_frame(props.shape)) {
        return;
    }

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
    const mouseOnClient: ClientXY = { x: clientX - root.x, y: clientY - root.y };
    const { x: sx, y: sy } = startPosition;
    const { x: mx, y: my } = mouseOnClient;
    if (isDragging && asyncBaseAction) {
        if (cur_ctrl_type.endsWith('rotate')) {
            let deg = 0;
            const { x: ax, y: ay } = props.axle;
            deg = getAngle([ax, ay, sx, sy], [ax, ay, mx, my]) || 0;
            if (props.shape.isFlippedHorizontal) {
                deg = -deg;
            }
            if (props.shape.isFlippedVertical) {
                deg = -deg;
            }
            asyncBaseAction.executeRotate(deg);
        } else {
            const action = props.context.tool.action;
            const p1: PageXY = submatrix.computeCoord3(startPosition);
            let p2: PageXY = submatrix.computeCoord3(mouseOnClient);
            if (event.shiftKey || props.shape.constrainerProportions || action === Action.AutoK) {
                p2 = get_t(cur_ctrl_type, p1, p2);
                asyncBaseAction.executeScale(cur_ctrl_type, p2);
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

function get_t(cct: CtrlElementType, p1: PageXY, p2: PageXY): PageXY {
    if (cct === CtrlElementType.RectLT) {
        const m = props.shape.matrix2Root();
        p1 = m.inverseCoord(p1.x, p1.y);
        p2 = m.inverseCoord(p2.x, p2.y);
        const pre_delta = { x: p2.x - p1.x, y: p2.y - p1.y };
        const f = props.shape.frame;
        const r = f.width / f.height;
        return m.computeCoord(pre_delta.x, pre_delta.x * (1 / r));
    } else if (cct === CtrlElementType.RectRT) {
        const m = props.shape.matrix2Root();
        p1 = m.inverseCoord(p1.x, p1.y);
        p2 = m.inverseCoord(p2.x, p2.y);
        const pre_delta = { x: p2.x - p1.x, y: p2.y - p1.y };
        const f = props.shape.frame;
        const r = f.width / f.height;
        return m.computeCoord(f.width + pre_delta.x, -pre_delta.x * (1 / r));
    } else if (cct === CtrlElementType.RectRB) {
        const m = props.shape.matrix2Root();
        p1 = m.inverseCoord(p1.x, p1.y);
        p2 = m.inverseCoord(p2.x, p2.y);
        const pre_delta = { x: p2.x - p1.x, y: p2.y - p1.y };
        const f = props.shape.frame;
        const r = f.width / f.height;
        return m.computeCoord(f.width + pre_delta.x, f.height + pre_delta.x * (1 / r));
    } else if (cct === CtrlElementType.RectLB) {
        const m = props.shape.matrix2Root();
        p1 = m.inverseCoord(p1.x, p1.y);
        p2 = m.inverseCoord(p2.x, p2.y);
        const pre_delta = { x: p2.x - p1.x, y: p2.y - p1.y };
        const f = props.shape.frame;
        const r = f.width / f.height;
        return m.computeCoord(pre_delta.x, f.height - pre_delta.x * (1 / r));
    } else return p2
}

let pre_target_x: number, pre_target_y: number;

function scale(asyncBaseAction: AsyncBaseAction, p2: PageXY) {
    const stickness = props.context.assist.stickness;
    const target = props.context.assist.point_match(p2);
    if (!target) return asyncBaseAction.executeScale(cur_ctrl_type, p2);
    if (stickedX) {
        if (Math.abs(p2.x - sticked_x_v) >= stickness) {
            stickedX = false
        } else {
            if (pre_target_x === target.x) {
                p2.x = sticked_x_v;
            } else if (target.sticked_by_x) {
                modify_fix_x(p2, target.x);
            }
        }
    } else if (target.sticked_by_x) {
        modify_fix_x(p2, target.x);
    }
    if (stickedY) {
        if (Math.abs(p2.y - sticked_y_v) >= stickness) {
            stickedY = false;
        } else {
            if (pre_target_y === target.x) {
                p2.y = sticked_y_v;
            } else if (target.sticked_by_y) {
                modify_fix_y(p2, target.y);
            }
        }
    } else if (target.sticked_by_y) {
        modify_fix_y(p2, target.y);
    }
    asyncBaseAction.executeScale(cur_ctrl_type, p2);
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

function modify_fix_x(p2: PageXY, fix: number) {
    p2.x = fix;
    sticked_x_v = fix;
    stickedX = true;
    pre_target_x = fix;
}

function modify_fix_y(p2: PageXY, fix: number) {
    p2.y = fix;
    sticked_y_v = fix;
    stickedY = true;
    pre_target_y = fix;
}

// todo 后续优化
// function setCursor(t: CtrlElementType, force?: boolean) {
//     const cursor = props.context.cursor;

//     const deg = get_real_rotation(props.shape);

//     if (t === CtrlElementType.RectLT) {
//         cursor.setType(`scale-${deg - 45}`, force);
//     } else if (t === CtrlElementType.RectRT) {
//         cursor.setType(`scale-${deg - 135}`, force);
//     } else if (t === CtrlElementType.RectRB) {
//         cursor.setType(`scale-${deg - 45}`, force);
//     } else if (t === CtrlElementType.RectLB) {
//         cursor.setType(`scale-${deg - 135}`, force);
//     } else if (t === CtrlElementType.RectLTR) {
//         cursor.setType(`rotate-${deg - 225}`, force);
//     } else if (t === CtrlElementType.RectRTR) {
//         cursor.setType(`rotate-${deg - 315}`, force);
//     } else if (t === CtrlElementType.RectRBR) {
//         cursor.setType(`rotate-${deg - 45}`, force);
//     } else if (t === CtrlElementType.RectLBR) {
//         cursor.setType(`rotate-${deg - 135}`, force);
//     }
// }

function modify_rotate_before_set(deg: number, fh: boolean, fv: boolean) {
    if (fh) deg = 180 - deg;
    if (fv) deg = 360 - deg;

    return Math.floor(deg);
}

function setCursor(t: CtrlElementType, force?: boolean) {
    const cursor = props.context.cursor;
    const { rotate, isFlippedHorizontal, isFlippedVertical } = get_transform(props.shape);
    let deg = rotate;

    if (t === CtrlElementType.RectLT) {
        deg = modify_rotate_before_set(deg + 45, isFlippedHorizontal, isFlippedVertical);
        cursor.setType(`scale-${deg}`, force);
    } else if (t === CtrlElementType.RectRT) {
        deg = modify_rotate_before_set(deg + 135, isFlippedHorizontal, isFlippedVertical);
        cursor.setType(`scale-${deg}`, force);
    } else if (t === CtrlElementType.RectRB) {
        deg = modify_rotate_before_set(deg + 45, isFlippedHorizontal, isFlippedVertical);
        cursor.setType(`scale-${deg}`, force);
    } else if (t === CtrlElementType.RectLB) {
        deg = modify_rotate_before_set(deg + 135, isFlippedHorizontal, isFlippedVertical);
        cursor.setType(`scale-${deg}`, force);
    } else if (t === CtrlElementType.RectLTR) {
        deg = modify_rotate_before_set(deg + 225, isFlippedHorizontal, isFlippedVertical);
        cursor.setType(`rotate-${deg}`, force);
    } else if (t === CtrlElementType.RectRTR) {
        deg = modify_rotate_before_set(deg + 315, isFlippedHorizontal, isFlippedVertical);
        cursor.setType(`rotate-${deg}`, force);
    } else if (t === CtrlElementType.RectRBR) {
        deg = modify_rotate_before_set(deg + 45, isFlippedHorizontal, isFlippedVertical);
        cursor.setType(`rotate-${deg}`, force);
    } else if (t === CtrlElementType.RectLBR) {
        deg = modify_rotate_before_set(deg + 135, isFlippedHorizontal, isFlippedVertical);
        cursor.setType(`rotate-${deg}`, force);
    }
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
    <g>
        <g v-for="(p, i) in dots" :key="i" :style="`transform: ${p.r.transform};`">
            <path :d="p.r.p" fill="#ff0000" stroke="none" @mousedown.stop="(e) => point_mousedown(e, p.type2)"
                @mouseenter="() => setCursor(p.type2)" @mouseleave="point_mouseleave">
            </path>
            <rect :x="p.extra.x" :y="p.extra.y" width="14px" height="14px" fill="transparent" stroke='transparent'
                @mousedown.stop="(e) => point_mousedown(e, p.type)" @mouseenter="() => setCursor(p.type)"
                @mouseleave="point_mouseleave">
            </rect>
            <rect :x="p.point.x" :y="p.point.y" class="main-rect" rx="2px"
                @mousedown.stop="(e) => point_mousedown(e, p.type)" @mouseenter="() => setCursor(p.type)"
                @mouseleave="point_mouseleave"></rect>
        </g>
    </g>
</template>
<style lang='scss' scoped>
.main-rect {
    width: 8px;
    height: 8px;
    fill: #ffffff;
    stroke: var(--active-color);
    stroke-width: 1px;
}
</style>