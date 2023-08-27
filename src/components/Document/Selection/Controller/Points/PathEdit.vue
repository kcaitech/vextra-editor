<script setup lang='ts'>
import { Context } from '@/context';
import { CtrlElementType, Matrix, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive, ref } from 'vue';
import { ClientXY } from '@/context/selection';
import { update_dot } from './common';
import { Point } from "../../SelectionView.vue";

interface Props {
  matrix: number[]
  context: Context
  shape: Shape
  axle: { x: number, y: number }
  cFrame: Point[]
}
interface Dot {
  point: { x: number, y: number }
  extra: { x: number, y: number }
  r: { p: string, transform: string }
  type: CtrlElementType
  type2: CtrlElementType
}
const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = new Matrix();
const data: { dots: Dot[] } = reactive({ dots: [] });
const { dots } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;

const dragActiveDis = 3;
function update() {
  matrix.reset(props.matrix);
  update_dot_path();
}
function update_dot_path() {
  if (!props.context.workspace.shouldSelectionViewUpdate) return;
  dots.length = 0;
  const frame = props.shape.frame;
  const s_r = props.shape.rotation || 0;
  let lt = matrix.computeCoord(0, 0);
  let rt = matrix.computeCoord(frame.width, 0);
  let rb = matrix.computeCoord(frame.width, frame.height);
  let lb = matrix.computeCoord(0, frame.height);
  dots.push(...update_dot([lt, rt, rb, lb], s_r, props.shape));
}
function point_mousedown(event: MouseEvent, ele: CtrlElementType) {
  if (event.button !== 0) return;
  props.context.menu.menuMount();
  const workspace = props.context.workspace;
  event.stopPropagation();
  workspace.setCtrl('controller');
  const { clientX, clientY } = event;
  matrix.reset(workspace.matrix);
  const root = workspace.root;
  startPosition = { x: clientX - root.x, y: clientY - root.y };
  document.addEventListener('mousemove', point_mousemove);
  document.addEventListener('mouseup', point_mouseup);
}
function point_mousemove(event: MouseEvent) {
  const { clientX, clientY } = event;
  const workspace = props.context.workspace;
  const root = workspace.root;
  const mouseOnClient: ClientXY = { x: clientX - root.x, y: clientY - root.y };
  const { x: sx, y: sy } = startPosition;
  const { x: mx, y: my } = mouseOnClient;
  if (isDragging) {
    startPosition = { ...mouseOnClient };
  } else {
    if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
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
  document.removeEventListener('mousemove', point_mousemove);
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
    <g v-for="(p, i) in dots" :key="i" :style="`transform: ${p.r.transform};`">
      <rect :x="p.extra.x" :y="p.extra.y" width="14px" height="14px" fill="transparent" stroke='transparent'
        @mousedown.stop="(e) => point_mousedown(e, p.type)">
      </rect>
      <rect :x="p.point.x" :y="p.point.y" rx="4px" ry="4px" height="8px" width="8px"
        @mousedown.stop="(e) => point_mousedown(e, p.type)" class="point">
      </rect>
    </g>
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
</style>