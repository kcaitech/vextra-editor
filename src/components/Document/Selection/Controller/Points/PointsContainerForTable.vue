<script setup lang='ts'>
import { Context } from '@/context';
import {
    AsyncBaseAction,
    CtrlElementType,
    Matrix,
    ShapeView,
    adapt2Shape
} from '@kcdesign/data';
import { onMounted, onUnmounted, watch, ref } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
import { Point } from "../../SelectionView.vue";
import { Action } from '@/context/tool';
import { WorkSpace } from '@/context/workspace';
import { Comment } from '@/context/comment';
import { permIsEdit } from '@/utils/content';
import { forbidden_to_modify_frame } from '@/utils/common';
import { get_transform } from './common';
import { TranslateHandler } from '@/transform/translate';

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
    t1 += mt, t1 += `translate(${offest - 18}px, ${offest - 18}px) `;
    let t2 = `translate(${rb.x}px, ${rb.y}px) `;
    t2 += mt, t2 += `translate(${offest + 2}px, ${offest + 2}px) `;

    transform.value = t1, transform2.value = t2;
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
    workspace.rotating(false);
    workspace.setCtrl('page');
    props.context.cursor.reset();
}

let need_update_comment = false;
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

    transporter = new TranslateHandler(props.context, [props.shape], e);

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
    if (need_update_comment) {
        props.context.comment.notify(Comment.UPDATE_COMMENT_POS);
        need_update_comment = false;
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
        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" x="3px"
             y="3px">
            <path
                d="M0 0h256v256H0V0z m384 0h256v256h-256V0zM768 0H1024v256h-256V0zM0 768h256V1024H0v-256z m384 0h256V1024h-256v-256z m384 0H1024V1024h-256v-256zM0 384h256v256H0v-256z m384 0h256v256h-256v-256z m384 0H1024v256h-256v-256z"
                fill="#1878f5"></path>
        </svg>
    </g>
    <g :style="{ transform: transform2 }" :class="{ hidden }" @mousedown.stop="(e: MouseEvent) => point_mousedown(e)">
        <rect x="0" y="0" width="18px" height="18px" rx="2" ry="2" fill="#1878f5" fill-opacity="0.45" stroke="none">
        </rect>
        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" x="3"
             y="3">
            <path fill="#1878f5"
                  d="M927.232 689.664a25.6 25.6 0 0 0-29.184 5.888l-64.512 64.256-244.736-245.76 246.016-245.504L898.304 332.8c5.888 5.888 11.776 5.888 23.296 5.888h5.888c11.776 0 17.664-11.776 17.664-23.296l64.512-269.056a52.736 52.736 0 0 0-5.888-29.184C998.4 5.376 986.368 5.376 974.592 11.264l-269.056 64c-11.776 0-17.664 11.776-23.296 17.408a43.776 43.776 0 0 0 5.888 29.184l64.256 64.512-246.016 245.504-222.208-222.464 58.624-46.848a37.888 37.888 0 0 0 11.776-29.184c0-11.776-11.776-17.664-17.408-23.296L73.728 22.272c-11.776-5.888-17.664 0-29.184 5.888a44.8 44.8 0 0 0-11.776 29.184L73.472 332.8c0 11.776 5.888 17.664 17.408 23.296H102.4a21.504 21.504 0 0 0 17.664-5.888l76.8-64.256 227.84 228.352-222.976 221.696-46.592-58.624A44.8 44.8 0 0 0 125.696 665.6c-11.776 0-17.664 11.776-23.296 17.408L14.336 947.2c-5.888 11.776 0 17.664 5.888 29.184a30.464 30.464 0 0 0 23.296 11.776h5.888L324.352 947.2c11.776 0 17.664-5.888 23.296-17.408a25.6 25.6 0 0 0-5.888-29.184l-64.256-76.8 228.352-227.84 245.504 246.016-64.512 64.256a25.6 25.6 0 0 0-5.888 29.184c5.888 11.776 11.776 17.664 23.296 17.664L972.8 1017.344h5.888c5.888 0 17.664-5.888 23.296-5.888a25.6 25.6 0 0 0 5.888-29.184L944.64 713.216c0-11.776-11.776-17.664-17.408-23.296z">
            </path>
        </svg>
    </g>
</template>
<style lang='scss' scoped>
.hidden {
    opacity: 0;
}
</style>