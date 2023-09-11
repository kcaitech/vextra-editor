<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncContactEditor, CurvePoint, Matrix, Shape, ShapeType } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive, ref } from 'vue';
import { ClientXY } from '@/context/selection';
import { Point } from "../../SelectionView.vue";
import { dir, get_length, get_locate } from './common';

interface Props {
    matrix: number[]
    context: Context
    shape: Shape
    cFrame: Point[]
}
interface Slice {
    type: 'hor' | 'ver'
    bar: { x: number, y: number }
    sliceIndex: number
}
const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = new Matrix();
const show = ref<boolean>(false);
const contact = ref<boolean>(false);
const slices: { ver: Slice[], hor: Slice[] } = reactive({ ver: [], hor: [] });
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let contactEditor: AsyncContactEditor | undefined;
let move: any;
let search: boolean = false;
let drag_type: 'ver' | 'hor' = 'ver';
const dragActiveDis = 3;
function update() {
    matrix.reset(props.matrix);
    update_slice_path();
}
function update_slice_path() {
    if (!props.context.workspace.shouldSelectionViewUpdate) return;
    show.value = false;
    const s = props.shape;
    if (s.type !== ShapeType.Contact) return;
    const points: CurvePoint[] = s.getPoints();
    const m = new Matrix(matrix), f = s.frame;
    m.preScale(f.width, f.height);
    const view_points: ClientXY[] = [];
    for (let i = 0, len = points.length; i < len; i++) {
        const p = points[i].point;
        view_points.push(m.computeCoord3(p));
    }
    slices.ver.length = 0;
    slices.hor.length = 0;
    let index = 0;
    for (let i = 1, len = view_points.length; i < len; i++) {
        const pre = view_points[i - 1];
        const cur = view_points[i];
        if (!pre || !cur) continue;
        if (get_length(pre, cur) <= 30) continue;
        const r_p1 = points[i - 1].point;
        const r_p2 = points[i].point;
        if (!r_p1 || !r_p2) continue;
        const d = dir(r_p1, r_p2);
        if (!d) continue;
        const bar_settle = get_locate(pre, cur);
        slices[d].push({ sliceIndex: index, type: d, bar: bar_settle });
        index++;
    }
    show.value = true;
}
function isPathEdited(shape: Shape): boolean {
    return shape.points.length > 2;
}
function point_mousedown(event: MouseEvent, slice: Slice) {
    if (event.button !== 0) return;
    event.stopPropagation();
    props.context.menu.menuMount();
    const workspace = props.context.workspace;
    workspace.setCtrl('controller');
    const root = workspace.root;
    startPosition = { x: event.clientX - root.x, y: event.clientY - root.y };
    drag_type = slice.type;
    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
    move = point_mousemove;
}
function point_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;
    const root = workspace.root;
    const mouseOnClient: ClientXY = { x: event.clientX - root.x, y: event.clientY - root.y };
    if (isDragging && contactEditor) {
        startPosition.x = mouseOnClient.x, startPosition.y = mouseOnClient.y;
        const p = submatrix.computeCoord3(mouseOnClient);
    } else {
        const { x: sx, y: sy } = startPosition;
        const { x: mx, y: my } = mouseOnClient;
        if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
            isDragging = true;
            submatrix.reset(workspace.matrix.inverse);
            const page = props.context.selection.selectedPage;
            contactEditor = props.context.editor.controller().asyncContactEditor(props.shape, page!);
            console.log('do sth');
        }
    }
}
function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) return;
    if (isDragging) {
        isDragging = false;
    }
    if (search) {
        search = false;
    }
    if (contactEditor) {
        contactEditor.close();
        contactEditor = undefined;
    }
    if (contact.value) {
        contact.value = false;
    }
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', point_mouseup);
    const workspace = props.context.workspace;
    workspace.scaling(false);
    workspace.rotating(false);
    workspace.setCtrl('page');
}


function window_blur() {
    const workspace = props.context.workspace;
    if (isDragging) {
        isDragging = false;
    }
    if (search) {
        search = false;
    }
    if (contactEditor) {
        contactEditor.close();
        contactEditor = undefined;
    }
    if (contact.value) {
        contact.value = false;
    }
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
    <!-- hor -->
    <g>
        <rect v-for="(item, idx) in slices.hor" :key="idx" :x="item.bar.x - 10" :y="item.bar.y - 4" class="bar-h" rx="4"
            ry="4" @mousedown="(e: MouseEvent) => point_mousedown(e, item)"></rect>
    </g>
    <!-- ver -->
    <g>
        <rect v-for="(item, idx) in slices.ver" :key="idx" :x="item.bar.x - 4" :y="item.bar.y - 10" class="bar-v" rx="4"
            ry="4" @mousedown="(e: MouseEvent) => point_mousedown(e, item)"></rect>
    </g>
</template>
<style lang='scss' scoped>
.bar-h {
    width: 20px;
    height: 8px;
    stroke: #fff;
    stroke-width: 1px;
    fill: var(--active-color);
}

.bar-v {
    width: 8px;
    height: 20px;
    stroke: #fff;
    stroke-width: 1px;
    fill: var(--active-color);
}
</style>