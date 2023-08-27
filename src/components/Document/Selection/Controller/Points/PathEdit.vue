<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncPathEditor, Matrix, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive } from 'vue';
import { ClientXY } from '@/context/selection';
import { get_path_by_point } from './common';
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
const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = new Matrix();
const data: { dots: Dot[] } = reactive({ dots: [] });
const { dots } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let down_index: number = 0;
let pathEditor: AsyncPathEditor | undefined;

const dragActiveDis = 3;
function update() {
  matrix.reset(props.matrix);
  update_dot_path();
}
function update_dot_path() {
  if (!props.context.workspace.shouldSelectionViewUpdate) return;
  dots.length = 0;
  dots.push(...get_path_by_point(props.shape, matrix));
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
    <g v-for="(p, i) in dots" :key="i">
      <rect :x="p.point.x - 4" :y="p.point.y - 4" rx="4px" ry="4px" height="8px" width="8px"
        @mousedown.stop="(e) => point_mousedown(e, p.index)" class="point">
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