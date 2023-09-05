<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncPathEditor, Matrix, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive, ref } from 'vue';
import { ClientXY } from '@/context/selection';
import { Point } from "../../SelectionView.vue";
import { get_apexs } from './common';

interface Props {
    matrix: number[]
    context: Context
    shape: Shape
    cFrame: Point[]
}
interface Apex {
    point: { x: number, y: number }
    type: 'from' | 'to'
}

const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = new Matrix();
const apex = ref<boolean>(false);
const data: { apex1: Apex, apex2: Apex } = reactive({ apex1: { point: { x: 0, y: 0 }, type: 'from' }, apex2: { point: { x: 0, y: 0 }, type: 'to' } });
let { apex1, apex2 } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let down_index: number = 0;
let pathEditor: AsyncPathEditor | undefined;
let move: any;

const dragActiveDis = 3;
function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}
function update_dot_path() {
    if (!props.context.workspace.shouldSelectionViewUpdate) return;
    apex.value = false;
    const result = get_apexs(props.shape, matrix);
    if (!result) return;
    apex.value = true, apex1 = result.apex1, apex2 = result.apex2
}

function point_mousedown(event: MouseEvent, type: 'from' | 'to') {
    return;
    // if (event.button !== 0) return;
    // props.context.menu.menuMount();
    // const workspace = props.context.workspace;
    // workspace.setCtrl('controller');
    // const root = workspace.root;
    // startPosition = { x: event.clientX - root.x, y: event.clientY - root.y };
    // down_index = index;
    // document.addEventListener('mousemove', point_mousemove);
    // document.addEventListener('mouseup', point_mouseup);
    // move = point_mousemove;
    // event.stopPropagation();
}
function point_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;
    const root = workspace.root;
    const mouseOnClient: ClientXY = { x: event.clientX - root.x, y: event.clientY - root.y };
    if (isDragging && pathEditor) {
        pathEditor.execute(down_index, submatrix.computeCoord3(mouseOnClient));
        startPosition.x = mouseOnClient.x, startPosition.y = mouseOnClient.y;
    } else {
        const { x: sx, y: sy } = startPosition;
        const { x: mx, y: my } = mouseOnClient;
        if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
            pathEditor = props.context.editor.controller().asyncPathEditor(props.shape, props.context.selection.selectedPage!);
            isDragging = true;
            submatrix.reset(workspace.matrix.inverse);
        }
    }
}
function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) return;
    if (isDragging) {
        isDragging = false;
    }
    if (pathEditor) {
        pathEditor.close();
        pathEditor = undefined;
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
    if (pathEditor) {
        pathEditor.close();
        pathEditor = undefined;
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
    <g v-if="apex">
        <rect :x="apex1.point.x - 8" :y="apex1.point.y - 8" rx="8" ry="8" height="16" width="16"
            @mousedown.stop="(e) => point_mousedown(e, apex1.type)" class="point">
        </rect>
        <rect :x="apex2.point.x - 8" :y="apex2.point.y - 8" rx="8" ry="8" height="16" width="16"
            @mousedown.stop="(e) => point_mousedown(e, apex2.type)" class="point">
        </rect>
    </g>
</template>
<style lang='scss' scoped>
.point {
    width: 16px;
    height: 16px;
    fill: #fff;
    stroke: var(--active-color);
    stroke-width: 2px;
}

.point:hover {
    width: 16px;
    height: 16px;
    fill: var(--active-color);
    stroke: #fff;
    stroke-width: 2px;
}
</style>