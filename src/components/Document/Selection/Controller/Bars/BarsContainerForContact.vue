<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncContactEditor, CurvePoint, Matrix, PathShape, Shape, ShapeType } from '@kcdesign/data';
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
let drag_index: number = -1;
const dragActiveDis = 3;
function update() {
    matrix.reset(props.matrix);
    update_slice_path();
    console.log('slices:', slices);

}
function update_slice_path() {
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        return;
    }
    show.value = false;
    const s = props.shape;
    if (s.type !== ShapeType.Contact) {
        return;
    }
    const points: CurvePoint[] = (s as PathShape).getPoints();
    const m = new Matrix(matrix), f = s.frame;
    m.preScale(f.width, f.height);
    const view_points: ClientXY[] = [];
    for (let i = 0, len = points.length; i < len; i++) {
        const p = points[i];
        view_points.push(m.computeCoord2(p.x, p.y));
    }
    slices.ver.length = 0;
    slices.hor.length = 0;
    let index = 0;
    for (let i = 1, len = view_points.length; i < len; i++) {
        index++;
        const pre = view_points[i - 1];
        const cur = view_points[i];
        if (!pre || !cur) continue;
        if (get_length(pre, cur) <= 30) continue;
        const r_p1 = points[i - 1];
        const r_p2 = points[i];
        if (!r_p1 || !r_p2) continue;
        const d = dir(r_p1, r_p2);
        if (!d) continue;
        const bar_settle = get_locate(pre, cur);
        slices[d].push({ sliceIndex: index - 1, type: d, bar: bar_settle });
    }
    show.value = true;
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
    drag_index = slice.sliceIndex;
    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
    move = point_mousemove;
}
function point_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;
    const root = workspace.root;
    const mouseOnClient: ClientXY = { x: event.clientX - root.x, y: event.clientY - root.y };
    if (isDragging && contactEditor) {
        const p1 = submatrix.computeCoord3(startPosition);
        const p2 = submatrix.computeCoord3(mouseOnClient);
        let delta = 0;
        const _idx = drag_index === 0 ? drag_index + 2 : drag_index;
        if (drag_type === 'hor') {
            delta = p2.y - p1.y;
            contactEditor.modify_sides(_idx, 0, delta);
        } else if (drag_type === 'ver') {
            delta = p2.x - p1.x;
            contactEditor.modify_sides(_idx, delta, 0);
        }
        startPosition.x = mouseOnClient.x, startPosition.y = mouseOnClient.y;
    } else {
        const { x: sx, y: sy } = startPosition;
        const { x: mx, y: my } = mouseOnClient;
        if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
            isDragging = true;
            submatrix.reset(workspace.matrix.inverse);
            const page = props.context.selection.selectedPage;
            const editor = props.context.editor4Shape(props.shape);
            editor.pre_modify_side(drag_index);
            editor.modify_edit_state(true);
            editor.modify_frame_by_points();
            contactEditor = props.context.editor.controller().asyncContactEditor(props.shape, page!);
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
// 重置路径
function reset_path() {
    const editor = props.context.editor4Shape(props.shape);
    editor.reset_contact_path();
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
    <rect v-for="(item, idx) in slices.hor" :key="idx" :x="item.bar.x - 10" :y="item.bar.y - 4" class="bar-h" rx="4" ry="4"
        @mousedown="(e: MouseEvent) => point_mousedown(e, item)" @dblclick="reset_path"></rect>
    <rect v-for="(item, idx) in slices.ver" :key="idx" :x="item.bar.x - 4" :y="item.bar.y - 10" class="bar-v" rx="4" ry="4"
        @mousedown="(e: MouseEvent) => point_mousedown(e, item)" @dblclick="reset_path"></rect>
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