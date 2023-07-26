<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncBaseAction, CtrlElementType, Matrix, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
interface Props {
    matrix: number[]
    context: Context
    shape: Shape
}
interface Bar {
    path: string
    type: CtrlElementType
}
const props = defineProps<Props>();
const matrix = new Matrix();
const data: { paths: Bar[] } = reactive({ paths: [] });
const { paths } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let asyncBaseAction: AsyncBaseAction | undefined = undefined;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;
const dragActiveDis = 3;
const types = [CtrlElementType.RectTop, CtrlElementType.RectRight, CtrlElementType.RectBottom, CtrlElementType.RectLeft];

function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}
function update_dot_path() {
    paths.length = 0;
    const frame = props.shape.frame;
    let apex = [{ x: 0, y: 0 }, { x: frame.width, y: 0 }, { x: frame.width, y: frame.height }, { x: 0, y: frame.height }];
    apex = apex.map(p => matrix.computeCoord(p.x, p.y));
    apex.push(apex[0]);
    for (let i = 0; i < apex.length - 1; i++) {
        const path = get_bar_path(apex[i], apex[i + 1]);
        paths.push({ path, type: types[i] });
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
        const { clientX, clientY } = event;
        matrix.reset(workspace.matrix);
        const root = workspace.root;
        startPosition = { x: clientX - root.x, y: clientY - root.y }
        document.addEventListener('mousemove', bar_mousemove);
        document.addEventListener('mouseup', bar_mouseup);
    }
}
function bar_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;
    const root = workspace.root;
    const { clientX, clientY } = event;
    const mouseOnPage: ClientXY = { x: clientX - root.x, y: clientY - root.y };
    if (isDragging) {
        if (asyncBaseAction) {
            matrix.reset(workspace.matrix);
            const p1OnPage: PageXY = matrix.inverseCoord(startPosition.x, startPosition.y); // page
            const p2Onpage: PageXY = matrix.inverseCoord(mouseOnPage.x, mouseOnPage.y);
            asyncBaseAction.execute(cur_ctrl_type, p1OnPage, p2Onpage);
        }
        startPosition = { ...mouseOnPage };
    } else {
        if (Math.hypot(mouseOnPage.x - startPosition.x, mouseOnPage.y - startPosition.y) > dragActiveDis) {
            isDragging = true;
            const shapes: Shape[] = props.context.selection.selectedShapes;
            asyncBaseAction = props.context.editor.controller().asyncRectEditor(shapes, props.context.selection.selectedPage!);
        }
    }
    setCursor(cur_ctrl_type, true);
}
function setCursor(t: CtrlElementType, force?: boolean) {
    const cursor = props.context.cursor;
    let deg = props.shape.rotation || 0;
    if (props.shape.isFlippedHorizontal) deg = 180 - deg;
    if (props.shape.isFlippedVertical) deg = 360 - deg;
    if (t === CtrlElementType.RectTop) {
        cursor.setType(`scale-${deg + 90}`, force);
    } else if (t === CtrlElementType.RectRight) {
        cursor.setType(`scale-${deg}`, force);
    } else if (t === CtrlElementType.RectBottom) {
        cursor.setType(`scale-${deg + 90}`, force);
    } else if (t === CtrlElementType.RectLeft) {
        cursor.setType(`scale-${deg}`, force);
    }
}
function bar_mouseup(event: MouseEvent) {
    if (event.button !== 0) return;
    const workspace = props.context.workspace;
    workspace.setCtrl('page');
    if (isDragging) isDragging = false;
    if (asyncBaseAction) asyncBaseAction = asyncBaseAction.close();
    document.removeEventListener('mousemove', bar_mousemove);
    document.removeEventListener('mouseup', bar_mouseup);
}
function bar_mouseenter(t: CtrlElementType) {
    setCursor(t);
}
function bar_mouseleave() {
    const cursor = props.context.cursor;
    cursor.setType('auto-0');
}
function window_blur() {
    if (isDragging) isDragging = false;
    if (asyncBaseAction) asyncBaseAction = asyncBaseAction.close();
    const workspace = props.context.workspace;
    workspace.scaling(false);
    workspace.setCtrl('page');
    props.context.cursor.reset();
    document.removeEventListener('mousemove', bar_mousemove);
    document.removeEventListener('mouseup', bar_mouseup);
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
        <g v-for="(b, i) in paths" :key="i">
            <path :d="b.path" fill="none" stroke='#865dff' stroke-width="1.5px"
                @mousedown.stop="(e) => bar_mousedown(e, b.type)" @mouseenter="() => bar_mouseenter(b.type)"
                @mouseleave="bar_mouseleave">
            </path>
            <path :d="b.path" fill="none" stroke='transparent' stroke-width="10px"
                @mousedown.stop="(e) => bar_mousedown(e, b.type)" @mouseenter="() => bar_mouseenter(b.type)"
                @mouseleave="bar_mouseleave">
            </path>
        </g>
    </g>
</template>
<style lang='scss' scoped></style>