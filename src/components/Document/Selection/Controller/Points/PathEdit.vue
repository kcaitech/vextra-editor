<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncPathEditor, Matrix, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive, ref } from 'vue';
import { ClientXY } from '@/context/selection';
import { get_path_by_point, get_conact_by_point } from './common';
import { Point } from "../../SelectionView.vue";

interface Props {
  matrix: number[]
  context: Context
  shape: Shape
  cFrame: Point[]
}
interface Dot {
  point: { x: number, y: number }
  index: number
}
interface Line {
  apex1: { x: number, y: number }
  point: { x: number, y: number }
  point_raw: { x: number, y: number }
  apex2: { x: number, y: number }
  index: number
}
const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = new Matrix();
const data: { dots: Dot[], lines: Line[] } = reactive({ dots: [], lines: [] });
const { dots, lines } = data;
const show_index = ref<number>(-1);
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let down_index: number = 0;
let pathEditor: AsyncPathEditor | undefined;
let cur_new_node: Line;
let move: any;

const dragActiveDis = 3;
function update() {
  matrix.reset(props.matrix);
  update_dot_path();
}
function update_dot_path() {
  if (!props.context.workspace.shouldSelectionViewUpdate) return;
  dots.length = 0;
  lines.length = 0;
  dots.push(...get_path_by_point(props.shape, matrix));
  lines.push(...get_conact_by_point(props.shape, matrix));
}
function point_mousedown(event: MouseEvent, index: number) {
  if (event.button !== 0) return;
  props.context.menu.menuMount();
  const workspace = props.context.workspace;
  workspace.setCtrl('controller');
  const root = workspace.root;
  startPosition = { x: event.clientX - root.x, y: event.clientY - root.y };
  down_index = index;
  document.addEventListener('mousemove', point_mousemove);
  document.addEventListener('mouseup', point_mouseup);
  move = point_mousemove;
  event.stopPropagation();
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
function line_enter(index: number) {
  show_index.value = index;
}
function line_leave() {
  show_index.value = -1;
}
function n_point_down(event: MouseEvent) {
  if (event.button !== 0) return;
  props.context.menu.menuMount();
  const workspace = props.context.workspace;
  workspace.setCtrl('controller');
  const root = workspace.root;
  startPosition = { x: event.clientX - root.x, y: event.clientY - root.y };
  cur_new_node = lines[show_index.value - 1];
  down_index = show_index.value;
  document.addEventListener('mousemove', n_point_mousemove);
  document.addEventListener('mouseup', point_mouseup);
  move = n_point_mousemove;
  event.stopPropagation();
}
function n_point_mousemove(event: MouseEvent) {
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
      pathEditor.addNode(down_index, cur_new_node.point_raw);
      isDragging = true;
      submatrix.reset(workspace.matrix.inverse);
    }
  }
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
  <g>
    <g v-for="(p, i) in lines" :key="i" @mouseenter="() => { line_enter(p.index) }" @mouseleave="line_leave">
      <line :x1="p.apex1.x" :y1="p.apex1.y" :x2="p.apex2.x" :y2="p.apex2.y" class="line"></line>
      <rect v-if="show_index === p.index" :x="p.point.x - 4" :y="p.point.y - 4" rx="4px" ry="4px" height="8px" width="8px"
        @mousedown="n_point_down" class="point">
      </rect>
    </g>
    <rect v-for="(p, i) in dots" :key="i" :x="p.point.x - 4" :y="p.point.y - 4" rx="4px" ry="4px" height="8px" width="8px"
      @mousedown.stop="(e) => point_mousedown(e, p.index)" class="point">
    </rect>
  </g>
</template>
<style lang='scss' scoped>
.point {
  fill: #ffffff;
  stroke: #555555;
  stroke-width: 1.5px;
}

.point:hover {
  fill: #cccccc;
}

.line {
  stroke: transparent;
  stroke-width: 8px;
  fill: none;
}
</style>