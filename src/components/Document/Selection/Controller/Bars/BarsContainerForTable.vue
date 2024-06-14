<script setup lang='ts'>
import { Context } from '@/context';
import { adapt2Shape, AsyncBaseAction, CtrlElementType, Matrix, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, watch } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
import { Action } from '@/context/tool';
import { Point } from '../../SelectionView.vue';
import { forbidden_to_modify_frame } from '@/utils/common';
import { get_transform, modify_rotate_before_set } from '../Points/common';
import { CursorType } from "@/utils/cursor2";

interface Props {
    matrix: number[]
    context: Context
    shape: ShapeView
    cFrame: Point[]
}
interface Bar {
    path: string
    type: CtrlElementType
}
const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = new Matrix();
const data: { paths: Bar[] } = reactive({ paths: [] });
const { paths } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let asyncBaseAction: AsyncBaseAction | undefined = undefined;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;
let stickedX: boolean = false;
let stickedY: boolean = false;
let sticked_x_v: number = 0;
let sticked_y_v: number = 0;
const dragActiveDis = 3;
const types = [CtrlElementType.RectRight, CtrlElementType.RectBottom];
let need_reset_cursor_after_transform = true;

function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}
function update_dot_path() {
    paths.length = 0;
    const frame = props.shape.frame;
    let apex = [{ x: frame.width, y: 0 }, { x: frame.width, y: frame.height }, { x: 0, y: frame.height }];
    apex = apex.map(p => matrix.computeCoord2(p.x, p.y));
    for (let i = 0; i < apex.length - 1; i++) {
        const path = get_bar_path(apex[i], apex[i + 1]);
        paths.push({ path, type: types[i] });
    }
}
function get_bar_path(s: { x: number, y: number }, e: { x: number, y: number }): string {
    return `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
}

// mouse event flow: down -> move -> up
function bar_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0) {
        return;
    }

    event.stopPropagation();

    if (forbidden_to_modify_frame(props.shape)) {
        return;
    }

    const table_selection = props.context.tableSelection;
    table_selection.setEditingCell();
    table_selection.resetSelection();

    cur_ctrl_type = ele;

    set_status_on_down();

    startPosition = props.context.workspace.getContentXY(event);

    document.addEventListener('mousemove', bar_mousemove);
    document.addEventListener('mouseup', bar_mouseup);
}
function bar_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;

    const mouseOnPage: ClientXY = workspace.getContentXY(event);

    const s = props.shape;
    if (isDragging && asyncBaseAction) {
        const action = props.context.tool.action;
        const p1OnPage: PageXY = submatrix.computeCoord(startPosition.x, startPosition.y); // page
        const p2Onpage: PageXY = submatrix.computeCoord(mouseOnPage.x, mouseOnPage.y);
        if (event.shiftKey || s.constrainerProportions || action === Action.AutoK) {
            asyncBaseAction.executeErScale(cur_ctrl_type, getScale(cur_ctrl_type, s, p1OnPage, p2Onpage));
        } else {
            scale(asyncBaseAction, p2Onpage);
        }
        startPosition = { ...mouseOnPage };
    } else if (Math.hypot(mouseOnPage.x - startPosition.x, mouseOnPage.y - startPosition.y) > dragActiveDis) {
        const page = props.context.selection.selectedPage!;

        asyncBaseAction = props.context.editor
            .controller()
            .asyncRectEditor(adapt2Shape(s), page);

        submatrix.reset(workspace.matrix.inverse);

        set_status_before_action();

        isDragging = true;
    }
}
function bar_mouseup(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }

    clear_status();
}
let pre_target_x: number, pre_target_y: number;
function scale(asyncBaseAction: AsyncBaseAction, p2: PageXY) {
    if (props.shape.rotation) {
        asyncBaseAction.executeScale(cur_ctrl_type, p2);
    } else {
        const stickness = props.context.assist.stickness;
        const target = props.context.assist.point_match(p2);
        if (!target) return;
        if (stickedX) {
            if (Math.abs(p2.x - sticked_x_v) >= stickness) {
                stickedX = false;
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
                if (pre_target_y === target.y) {
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
        asyncBaseAction.executeScale(cur_ctrl_type, p2);
    }
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
function getScale(type: CtrlElementType, shape: ShapeView, start: ClientXY, end: ClientXY): number {
    const m = new Matrix(shape.matrix2Root().inverse);
    const f = shape.frame;
    const p1 = m.computeCoord(start.x, start.y);
    const p2 = m.computeCoord(end.x, end.y);
    if (type === CtrlElementType.RectRight) {
        const dx = p2.x - p1.x;
        return (f.width + dx) / f.width;
    } else if (type === CtrlElementType.RectBottom) {
        const dy = p2.y - p1.y;
        return (f.height + dy) / f.height;
    } else return 1
}

function setCursor(t: CtrlElementType) {
    const cursor = props.context.cursor;
    const { rotate, isFlippedHorizontal, isFlippedVertical } = get_transform(props.shape);
    let deg = rotate;

    if (t === CtrlElementType.RectRight) {
        deg = modify_rotate_before_set(deg, isFlippedHorizontal, isFlippedVertical);

    } else if (t === CtrlElementType.RectBottom) {
        deg = modify_rotate_before_set(deg + 90, isFlippedHorizontal, isFlippedVertical);
    }

    cursor.setType(CursorType.Scale, deg);
}

function set_status_on_down() {
    props.context.menu.menuMount();

    props.context.workspace.setCtrl('controller');
    
    props.context.cursor.cursor_freeze(true);
}

function set_status_before_action() {   
    props.context.workspace.scaling(true);

    const page = props.context.selection.selectedPage!;
    const sv = page.getShape(props.shape.id);
    sv && props.context.assist.set_trans_target([sv]);
}

function clear_status() {
    if (isDragging) {
        isDragging = false;
        props.context.assist.reset();
    }
    if (asyncBaseAction) {
        asyncBaseAction = asyncBaseAction.close();
    }

    const workspace = props.context.workspace;
    workspace.scaling(false);
    workspace.setCtrl('page');

    props.context.cursor.cursor_freeze(false);
    if (need_reset_cursor_after_transform) {
        props.context.cursor.reset();
    }

    document.removeEventListener('mousemove', bar_mousemove);
    document.removeEventListener('mouseup', bar_mouseup);
}
function bar_mouseenter(t: CtrlElementType) {
    need_reset_cursor_after_transform = false;
    setCursor(t);
}
function bar_mouseleave() {
    props.context.cursor.reset();
    need_reset_cursor_after_transform = true;
}
function window_blur() {
    clear_status();
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
    <path v-for="(b, i) in paths" :key="i" :d="b.path" class="main-path" @mousedown.stop="(e) => bar_mousedown(e, b.type)"
        @mouseenter="() => bar_mouseenter(b.type)" @mouseleave="bar_mouseleave">
    </path>
</template>
<style lang='scss' scoped>
.main-path {
    fill: none;
    stroke: transparent;
    stroke-width: 10px;
}
</style>