<script setup lang='ts'>
import { Context } from '@/context';
import { adapt2Shape, AsyncBaseAction, CtrlElementType, Matrix, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
import { Point } from "../../SelectionView.vue";
import { Action } from '@/context/tool';
import { WorkSpace } from '@/context/workspace';
// import { Comment } from '@/context/comment';
import { permIsEdit } from '@/utils/content';
import { forbidden_to_modify_frame } from '@/utils/common';
import { get_transform, modify_rotate_before_set } from './common';
import { TranslateHandler } from '@/transform/translate';
import { CursorType } from "@/utils/cursor2";

interface Props {
    matrix: number[]
    context: Context
    shape: ShapeView
    cFrame: Point[]
}

const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = new Matrix();
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let asyncBaseAction: AsyncBaseAction | undefined = undefined;
let stickedX: boolean = false;
let stickedY: boolean = false;
let sticked_x_v: number = 0;
let sticked_y_v: number = 0;
let move: any, up: any;
let offest = -0.5;
const transform = ref<string>('');
const transform2 = ref<string>('');
const hidden = ref<boolean>(false);
const dragActiveDis = 3;

function update() {
    matrix.reset(props.matrix);
    offest = matrix.m00 * -0.5;
    update_transform();
}

function update_transform() {
    const shape = props.shape, frame = shape.frame;
    let lt = matrix.computeCoord2(0, 0);
    let rt = matrix.computeCoord2(frame.width, 0);
    let rb = matrix.computeCoord2(frame.width, frame.height);
    let lb = matrix.computeCoord2(0, frame.height);
    const { rotate, isFlippedHorizontal, isFlippedVertical } = get_transform(props.shape);
    let mt = ''
    if (isFlippedHorizontal) {
        mt += 'rotateY(180deg) ';
    }
    if (isFlippedVertical) {
        mt += 'rotateX(180deg) ';
    }
    if (rotate) {
        mt += `rotate(${rotate}deg)`;
    }

    let t1 = `translate(${lt.x}px, ${lt.y}px) `;
    t1 += mt;
    t1 += `translate(${offest - 18}px, ${offest - 18}px) `;

    let t2 = `translate(${rb.x}px, ${rb.y}px) `;
    t2 += mt;
    t2 += `translate(${offest - 4}px, ${offest - 4}px) `;

    transform.value = t1;
    transform2.value = t2;

    const root = props.context.workspace.root;

    props.context.selection.setArea([
        { id: 'body', area: `M${lt.x} ${lt.y} L${rt.x} ${rt.y} L${rb.x} ${rb.y} L${lb.x} ${lb.y} z` },
        { id: 'content', area: `M0 0 h${root.width} v${root.height} h${-root.width} z` }
    ]);

    if (!props.context.workspace.shouldSelectionViewUpdate) {
        hidden.value = true;
    }
}

function point_mousedown(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }

    props.context.menu.menuMount();

    if (forbidden_to_modify_frame(props.shape)) {
        return;
    }

    props.context.cursor.cursor_freeze(true);

    const workspace = props.context.workspace;
    event.stopPropagation();
    workspace.setCtrl('controller');
    const root = workspace.root;
    const table_selection = props.context.tableSelection;
    table_selection.setEditingCell();
    table_selection.resetSelection();
    startPosition = { x: event.clientX - root.x, y: event.clientY - root.y };

    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
    move = point_mousemove, up = point_mouseup;
}

function point_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace, root = workspace.root;
    const mouseOnClient: ClientXY = { x: event.clientX - root.x, y: event.clientY - root.y };
    const { x: sx, y: sy } = startPosition, { x: mx, y: my } = mouseOnClient;
    if (isDragging && asyncBaseAction) {
        const action = props.context.tool.action;
        const p1: PageXY = submatrix.computeCoord(startPosition.x, startPosition.y);
        let p2: PageXY = submatrix.computeCoord(mouseOnClient.x, mouseOnClient.y);
        if (event.shiftKey || props.shape.constrainerProportions || action === Action.AutoK) {
            p2 = get_t(p1, p2);
            asyncBaseAction.executeScale(CtrlElementType.RectRB, p2);
        } else {
            scale(asyncBaseAction, p2);
        }
        startPosition = { ...mouseOnClient };
    } else {
        if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
            submatrix.reset(workspace.matrix.inverse);
            asyncBaseAction = props.context.editor.controller().asyncRectEditor(adapt2Shape(props.shape), props.context.selection.selectedPage!);
            props.context.assist.set_trans_target([props.shape]);
            isDragging = true;
        }
    }
}

function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) return;
    if (isDragging) {
        props.context.assist.reset();
        isDragging = false;
    }
    if (asyncBaseAction) asyncBaseAction = asyncBaseAction.close();
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
    const workspace = props.context.workspace;
    workspace.scaling(false);
    workspace.setCtrl('page');
    props.context.cursor.cursor_freeze(false);
    props.context.cursor.reset();
}

let transporter: TranslateHandler | undefined = undefined;

// #region trans
function down(e: MouseEvent) {
    const context = props.context;
    const action = context.tool.action;
    if (!permIsEdit(context) || context.tool.isLable) {
        return;
    }
    if (e.button !== 0) { // 当前组件只处理左键事件，右键事件冒泡出去由父节点处理
        return;
    }
    if (!(action == Action.AutoV)) {
        return;
    }
    if (forbidden_to_modify_frame(props.shape)) {
        return;
    }

    const table_selection = props.context.tableSelection;
    table_selection.setEditingCell();
    table_selection.resetSelection();

    startPosition = { x: e.x, y: e.y };

    transporter = new TranslateHandler(props.context, e, [props.shape]);

    document.addEventListener('mousemove', mousemove4trans);
    document.addEventListener('mouseup', mouseup4trans);

    move = mousemove4trans;
    up = mouseup4trans;
}

function mousemove4trans(e: MouseEvent) {
    if (e.buttons !== 1) {
        return;
    }

    if (isDragging) {
        transporter?.execute(e);
    } else if (Math.hypot(e.x - startPosition.x, e.y - startPosition.y) > dragActiveDis) {
        transporter?.createApiCaller();
        isDragging = true;
    }
}

function mouseup4trans(e: MouseEvent) {
    if (e.button === 0) {
        isDragging = false;
        transporter?.fulfil();
        transporter = undefined;
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
    }
}

function get_t(p1: PageXY, p2: PageXY): PageXY {
    const m = props.shape.matrix2Root();
    const inverse = new Matrix(m.inverse);

    p1 = inverse.inverseCoord(p1.x, p1.y);
    p2 = inverse.inverseCoord(p2.x, p2.y);

    const pre_delta = { x: p2.x - p1.x, y: p2.y - p1.y };
    const f = props.shape.frame;
    const r = f.width / f.height;
    return m.computeCoord(f.width + pre_delta.x, f.height + pre_delta.x * (1 / r));
}

let pre_target_x: number, pre_target_y: number;

function scale(asyncBaseAction: AsyncBaseAction, p2: PageXY) {
    const stickness = props.context.assist.stickness;
    const target = props.context.assist.point_match(p2);
    if (!target) return asyncBaseAction.executeScale(CtrlElementType.RectRB, p2);
    if (stickedX) {
        if (Math.abs(p2.x - sticked_x_v) > stickness) {
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
        if (Math.abs(p2.y - sticked_y_v) > stickness) {
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
    const align = props.context.user.isPixelAlignMent;
    if (align) {
        p2.x = Math.round(p2.x);
        p2.y = Math.round(p2.y);
    }
    asyncBaseAction.executeScale(CtrlElementType.RectRB, p2);
}

function modify_fix_x(p2: PageXY, fix: number) {
    p2.x = fix;
    sticked_x_v = p2.x;
    stickedX = true;
    pre_target_x = fix;
}

function modify_fix_y(p2: PageXY, fix: number) {
    p2.y = fix;
    sticked_y_v = p2.y;
    stickedY = true;
    pre_target_y = fix;
}

function cornerMove(event: MouseEvent) {
    if (event.buttons === 0) {
        event.stopPropagation();
    }
}
// #endregion

function window_blur() {
    const workspace = props.context.workspace;
    if (isDragging) {
        props.context.assist.reset();
        isDragging = false;
    }
    if (asyncBaseAction) {
        asyncBaseAction = asyncBaseAction.close();
    }

    transporter?.fulfil();

    workspace.scaling(false);
    workspace.setCtrl('page');

    props.context.cursor.cursor_freeze(false);
    props.context.cursor.reset();

    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}

function workspace_watcher(t: number, param1: MouseEvent) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        hidden.value = false;
        update();
    }
}

let need_reset_cursor_after_transform = true;

function point_mouseenter() {
    setCursor();
    need_reset_cursor_after_transform = false;
}

function point_mouseleave() {
    need_reset_cursor_after_transform = true;
    props.context.cursor.reset();
}

function setCursor() {
    const cursor = props.context.cursor;
    const { rotate, isFlippedHorizontal, isFlippedVertical } = get_transform(props.shape);
    let deg = rotate;
    deg = modify_rotate_before_set(deg + 45, isFlippedHorizontal, isFlippedVertical);

    cursor.setType(CursorType.Scale, deg);
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
    props.context.workspace.watch(workspace_watcher);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
    window.removeEventListener('blur', window_blur);
    props.context.workspace.unwatch(workspace_watcher);
})
</script>
<template>
    <g :style="{ transform }" @mousedown.stop="(e: MouseEvent) => down(e)">
        <rect x="0" y="0" width="18px" height="18px" rx="2" ry="2" fill="#1878f5" fill-opacity="0.45" stroke="none">
        </rect>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M2 0H16C17.1046 0 18 0.89543 18 2V16C18 17.1046 17.1046 18 16 18H2C0.89543 18 0 17.1046 0 16V2C0 0.89543 0.89543 0 2 0Z"
                  fill="#99BDF6"/>
            <path
                d="M9 16C8.91684 15.999 8.83469 15.9817 8.75818 15.9491C8.68007 15.9188 8.6087 15.8734 8.54818 15.8155L6.63909 13.9064C6.38956 13.6568 6.38956 13.2523 6.63909 13.0027C6.88862 12.7532 7.2932 12.7532 7.54273 13.0027L8.36364 13.83V9.63636H4.17L4.99727 10.4573C5.2468 10.7068 5.2468 11.1114 4.99727 11.3609C4.74774 11.6104 4.34317 11.6104 4.09364 11.3609L2.18455 9.45182C2.12661 9.3913 2.0812 9.31993 2.05091 9.24182C2.0183 9.16531 2.00101 9.08316 2 9C2.00101 8.91684 2.0183 8.83469 2.05091 8.75818C2.0812 8.68007 2.12661 8.6087 2.18455 8.54818L4.09364 6.63909C4.34317 6.38956 4.74774 6.38956 4.99727 6.63909C5.2468 6.88862 5.2468 7.2932 4.99727 7.54273L4.17 8.36364H8.36364V4.17L7.54273 4.99727C7.2932 5.2468 6.88862 5.2468 6.63909 4.99727C6.38956 4.74774 6.38956 4.34317 6.63909 4.09364L8.54818 2.18455C8.6087 2.12661 8.68007 2.0812 8.75818 2.05091C8.83469 2.0183 8.91684 2.00101 9 2C9.08316 2.00101 9.16531 2.0183 9.24182 2.05091C9.31993 2.0812 9.3913 2.12661 9.45182 2.18455L11.3609 4.09364C11.6104 4.34317 11.6104 4.74774 11.3609 4.99727C11.1114 5.2468 10.7068 5.2468 10.4573 4.99727L9.63636 4.17V8.36364H13.83L13.0027 7.54273C12.7532 7.2932 12.7532 6.88862 13.0027 6.63909C13.2523 6.38956 13.6568 6.38956 13.9064 6.63909L15.8155 8.54818C15.8734 8.6087 15.9188 8.68007 15.9491 8.75818C15.9817 8.83469 15.999 8.91684 16 9C15.999 9.08316 15.9817 9.16531 15.9491 9.24182C15.9188 9.31993 15.8734 9.3913 15.8155 9.45182L13.9064 11.3609C13.6568 11.6104 13.2523 11.6104 13.0027 11.3609C12.7532 11.1114 12.7532 10.7068 13.0027 10.4573L13.83 9.63636H9.63636V13.83L10.4573 13.0027C10.7068 12.7532 11.1114 12.7532 11.3609 13.0027C11.6104 13.2523 11.6104 13.6568 11.3609 13.9064L9.45182 15.8155C9.3913 15.8734 9.31993 15.9188 9.24182 15.9491C9.16531 15.9817 9.08316 15.999 9 16Z"
                fill="#1778F6"/>
        </svg>
    </g>
    <g :style="{ transform: transform2 }" :class="{ hidden }" @mousedown.stop="(e: MouseEvent) => point_mousedown(e)"
       @mousemove="cornerMove" @mouseenter="point_mouseenter" @mouseleave="point_mouseleave">
        <rect x="0" y="0" width="12" height="12" rx="2" ry="2" fill="transparent" stroke="none">
        </rect>
    </g>
</template>
<style lang='scss' scoped>
.hidden {
    opacity: 0;
}
</style>