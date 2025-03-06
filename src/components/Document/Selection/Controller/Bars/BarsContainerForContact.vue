<script setup lang='ts'>
import { Context } from '@/context';
import {
    ContactLineView,
    CurvePoint,
    Matrix,
    ContactLineModifier
} from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive, ref } from 'vue';
import { ClientXY } from '@/context/selection';
import { Point } from "../../SelectionView.vue";
import { dir, get_length, get_locate } from './common';
import { add_move_and_up_for_document, remove_move_and_up_from_document } from '@/utils/mouse_interactive';

interface Props {
    matrix: number[]
    context: Context
    shape: ContactLineView
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
let modifier: ContactLineModifier | undefined;
let move: any;
let search: boolean = false;
let drag_type: 'ver' | 'hor' = 'ver';
let drag_index: number = -1;
const dragActiveDis = 3;

function update() {
    matrix.reset(props.matrix);
    update_slice_path();
}

function update_slice_path() {
    if (!props.context.workspace.shouldSelectionViewUpdate) return;

    show.value = false;

    const s = props.shape;

    const points: CurvePoint[] = s.getPoints();

    const m = new Matrix(matrix);

    const view_points: ClientXY[] = [];

    for (let i = 0, len = points.length; i < len; i++) {
        const p = points[i];
        view_points.push(m.computeCoord2(p.x, p.y));
    }

    slices.ver.length = 0;
    slices.hor.length = 0;

    for (let i = 1, len = view_points.length; i < len; i++) {
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

        slices[d].push({ sliceIndex: i - 1, type: d, bar: bar_settle });
    }

    show.value = true;
}

function point_mousedown(event: MouseEvent, slice: Slice) {
    if (event.button !== 0) return;

    if (props.shape.isLocked) return;

    event.stopPropagation();
    props.context.menu.menuMount();

    const workspace = props.context.workspace;
    workspace.setCtrl('controller');

    const root = workspace.root;
    startPosition = { x: event.clientX - root.x, y: event.clientY - root.y };

    drag_type = slice.type;
    drag_index = slice.sliceIndex;

    add_move_and_up_for_document(point_mousemove, point_mouseup);
    move = point_mousemove;
}

function get_index() {
    const d = props.shape.data.from ? 2 : 1;
    return drag_index === 0 ? drag_index + d : drag_index;
}

function point_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;
    const root = workspace.root;

    const mouseOnClient: ClientXY = { x: event.clientX - root.x, y: event.clientY - root.y };

    if (isDragging && modifier) {
        const p1 = submatrix.computeCoord3(startPosition);
        const p2 = submatrix.computeCoord3(mouseOnClient);

        let delta = 0;
        const _idx = get_index();

        if (drag_type === 'hor') {
            delta = p2.y - p1.y;
            modifier.modifySide(_idx, 0, delta);
        } else if (drag_type === 'ver') {
            delta = p2.x - p1.x;
            modifier.modifySide(_idx, delta, 0);
        }

        startPosition.x = mouseOnClient.x;
        startPosition.y = mouseOnClient.y;
    } else {
        const { x: sx, y: sy } = startPosition;
        const { x: mx, y: my } = mouseOnClient;
        if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
            submatrix.reset(workspace.matrix.inverse);
            const page = props.context.selection.selectedPage!;
            modifier = new ContactLineModifier(props.context.coopRepo, page, props.shape);
            modifier.solidify(drag_index);
            isDragging = true;
        }
    }
}

function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) return;
    reset_status();
}

// 重置路径
function reset_path() {
    const editor = props.context.editor4Shape(props.shape);
    editor.reset_contact_path(props.shape.getPoints());
}

function reset_status() {
    if (isDragging) isDragging = false;

    if (search) search = false;

    if (modifier) {
        modifier.commit();
        modifier = undefined;
    }

    if (contact.value) contact.value = false;

    const workspace = props.context.workspace;
    workspace.scaling(false);
    workspace.rotating(false);
    workspace.setCtrl('page');
    props.context.cursor.reset();

    remove_move_and_up_from_document(move, point_mouseup);
}

function window_blur() {
    reset_status();
}

watch(() => props.matrix, update);

watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})

onMounted(() => {
    props.shape.watch(update);
    update();
    window.addEventListener('blur', window_blur);
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