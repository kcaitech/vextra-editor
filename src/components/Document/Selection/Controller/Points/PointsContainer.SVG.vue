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
const props = defineProps<Props>();
const matrix = new Matrix();
const data: { dots: { point: { x: number, y: number }, extra: { x: number, y: number }, type: CtrlElementType }[] } = reactive({ dots: [] });
const { dots } = data;
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
  const valve = props.context.workspace.shouldSelectionViewUpdate;
  if (!valve) return;
  dots.length = 0;
  const frame = props.shape.frame;
  // const bit_v = 4 / props.context.workspace.matrix.m00;
  const bit_v = 4;
  const bit_v_d = 7;
  const bit_v_r = 12;
  // lt
  let lt = { x: 0, y: 0 };
  lt = matrix.computeCoord(lt.x, lt.y);
  const path_obj_1 = { point: { x: lt.x - bit_v, y: lt.y - bit_v }, extra: { x: lt.x - bit_v_d, y: lt.y - bit_v_d }, type: CtrlElementType.RectLT };
  //rt
  let rt = { x: frame.width, y: 0 };
  rt = matrix.computeCoord(rt.x, rt.y);
  const path_obj_2 = { point: { x: rt.x - bit_v, y: rt.y - bit_v }, extra: { x: rt.x - bit_v_d, y: rt.y - bit_v_d }, type: CtrlElementType.RectRT };

  //rb
  let rb = { x: frame.width, y: frame.height };
  rb = matrix.computeCoord(rb.x, rb.y);
  const path_obj_3 = { point: { x: rb.x - bit_v, y: rb.y - bit_v }, extra: { x: rb.x - bit_v_d, y: rb.y - bit_v_d }, type: CtrlElementType.RectRB };
  //lb
  let lb = { x: 0, y: frame.height };
  lb = matrix.computeCoord(lb.x, lb.y)
  const path_obj_4 = { point: { x: lb.x - bit_v, y: lb.y - bit_v }, extra: { x: lb.x - bit_v_d, y: lb.y - bit_v_d }, type: CtrlElementType.RectLB };
  dots.push(path_obj_1, path_obj_2, path_obj_3, path_obj_4);
}
function get_r_path(ps: { x: number, y: number }[]) { }

function point_mousedown(event: MouseEvent, ele: CtrlElementType, is_r: boolean) {
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
    <g v-for="(p, i) in dots" :key="i">
      <rect :x="p.extra.x" :y="p.extra.y" width="14px" height="14px" fill="transparent" stroke='transparent'
        @mousedown.stop="(e) => point_mousedown(e, p.type, false)"></rect>
      <rect :x="p.point.x" :y="p.point.y" width="8px" height="8px" fill="#ffffff" stroke='#865dff' stroke-width="1.5px"
        @mousedown.stop="(e) => point_mousedown(e, p.type, false)"></rect>
    </g>
  </g>
</template>
<style lang='scss' scoped></style>