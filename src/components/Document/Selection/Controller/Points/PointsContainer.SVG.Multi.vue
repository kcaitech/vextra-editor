<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncBaseAction, CtrlElementType, Matrix, Shape } from '@kcdesign/data';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
import { Point } from '../../SelectionView.vue';
interface Props {
    matrix: number[]
    context: Context
    shape: Shape
    frame: Point[]
}
const props = defineProps<Props>();
const matrix = new Matrix();
const paths = ref<string[]>([]);
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let asyncBaseAction: AsyncBaseAction | undefined = undefined;
const dragActiveDis = 3;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;
function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}
function update_dot_path() {
    paths.value.length = 0;
    const [lt, rt, rb, lb] = props.frame;
    const bit_v = 4;
    // lt
    let point1_dot = [{ x: lt.x - bit_v, y: lt.y - bit_v }, { x: lt.x + bit_v, y: lt.y - bit_v }, { x: lt.x + bit_v, y: lt.y + bit_v }, { x: lt.x - bit_v, y: lt.y + bit_v }];
    const path1 = get_path_by_dot(point1_dot);
    //rt
    let point2_dot = [{ x: rt.x - bit_v, y: rt.y - bit_v }, { x: rt.x + bit_v, y: rt.y - bit_v }, { x: rt.x + bit_v, y: rt.y + bit_v }, { x: rt.x - bit_v, y: rt.y + bit_v }];
    const path2 = get_path_by_dot(point2_dot);
    //rb
    let point3_dot = [{ x: rb.x - bit_v, y: rb.y - bit_v }, { x: rb.x + bit_v, y: rb.y - bit_v }, { x: rb.x + bit_v, y: rb.y + bit_v }, { x: rb.x - bit_v, y: rb.y + bit_v }];
    const path3 = get_path_by_dot(point3_dot);
    //lb
    let point4_dot = [{ x: lb.x - bit_v, y: lb.y - bit_v }, { x: lb.x + bit_v, y: lb.y - bit_v }, { x: lb.x + bit_v, y: lb.y + bit_v }, { x: lb.x - bit_v, y: lb.y + bit_v }];
    const path4 = get_path_by_dot(point4_dot);

    paths.value.push(path1, path2, path3, path4);
}
function get_path_by_dot(ps: { x: number, y: number }[]): string {
    const [p0, p1, p2, p3] = ps;
    return `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} z`;
}

function point_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button === 0) {
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
}
function point_mousemove(event: MouseEvent) {
    const { clientX, clientY } = event;
    const workspace = props.context.workspace;
    const root = workspace.root;
    const mouseOnClient: ClientXY = { x: clientX - root.x, y: clientY - root.y };
    if (isDragging) {
        if (asyncBaseAction) {
            const selection = props.context.selection;
            workspace.scaling(true);
            matrix.reset(workspace.matrix);
            const shapes = selection.selectedShapes;
            const len = shapes.length;
            if (len === 1) {
                const p1OnPage: PageXY = matrix.inverseCoord(startPosition.x, startPosition.y);
                const p2Onpage: PageXY = matrix.inverseCoord(mouseOnClient.x, mouseOnClient.y);
                asyncBaseAction.execute(cur_ctrl_type, p1OnPage, p2Onpage, 0, 'scale');
            } else if (len > 1) {
                props.context.workspace.setSelectionViewUpdater(false);
            }
        }
        props.context.workspace.setSelectionViewUpdater(true);
        props.context.workspace.selectionViewUpdate();
        startPosition = { ...mouseOnClient };
    } else {
        if (Math.hypot(mouseOnClient.x - startPosition.x, mouseOnClient.y - startPosition.y) > dragActiveDis) {
            isDragging = true;
            const shapes: Shape[] = props.context.selection.selectedShapes;
            asyncBaseAction = props.context.editor.controller().asyncRectEditor(shapes, props.context.selection.selectedPage!);
        }
    }
}
function point_mouseup(event: MouseEvent) {
    if (event.button === 0) {
        const workspace = props.context.workspace;
        if (isDragging) {
            if (asyncBaseAction) {
                asyncBaseAction = asyncBaseAction.close();
            }
            isDragging = false;
        }
        document.removeEventListener('mousemove', point_mousemove);
        document.removeEventListener('mouseup', point_mouseup);
        workspace.scaling(false);
        workspace.setCtrl('page');
    }
}

function selection_watcher(t?: number) { }
watch(() => props.matrix, () => {
    update();
})
watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})
onMounted(() => {
    props.shape.watch(update);
    props.context.selection.watch(selection_watcher);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
    props.context.selection.unwatch(selection_watcher);
})
</script>
<template>
    <g>
        <path :d="paths[0]" fill="#ffffff" stroke='#865dff' stroke-width="1.5px"
            @mousedown.stop="(e) => point_mousedown(e, CtrlElementType.RectLT)">
        </path>
        <path :d="paths[1]" fill="#ffffff" stroke='#865dff' stroke-width="1.5px"
            @mousedown.stop="(e) => point_mousedown(e, CtrlElementType.RectRT)">
        </path>
        <path :d="paths[2]" fill="#ffffff" stroke='#865dff' stroke-width="1.5px"
            @mousedown.stop="(e) => point_mousedown(e, CtrlElementType.RectRB)">
        </path>
        <path :d="paths[3]" fill="#ffffff" stroke='#865dff' stroke-width="1.5px"
            @mousedown.stop="(e) => point_mousedown(e, CtrlElementType.RectLB)">
        </path>
    </g>
</template>
<style lang='scss' scoped></style>