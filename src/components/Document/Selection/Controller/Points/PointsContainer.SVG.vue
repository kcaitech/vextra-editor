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
const data: { paths: { path_dot: string, path_dot_range: string, path_rot: string, type: CtrlElementType }[] } = reactive({ paths: [] });
const { paths } = data;
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
  paths.length = 0;
  const frame = props.shape.frame;
  // const bit_v = 4 / props.context.workspace.matrix.m00;
  const bit_v = 4;
  const bit_v_d = 8;
  const bit_v_r = 12;
  // lt
  let lt = { x: 0, y: 0 };
  lt = matrix.computeCoord(lt.x, lt.y)
  let point1_dot = [{ x: lt.x - bit_v, y: lt.y - bit_v }, { x: lt.x + bit_v, y: lt.y - bit_v }, { x: lt.x + bit_v, y: lt.y + bit_v }, { x: lt.x - bit_v, y: lt.y + bit_v }];
  const path1 = get_path_by_dot(point1_dot);
  let path1_dot_range = [{ x: lt.x - bit_v_d, y: lt.y - bit_v_d }, { x: lt.x + bit_v_d, y: lt.y - bit_v_d }, { x: lt.x + bit_v_d, y: lt.y + bit_v_d }, { x: lt.x - bit_v_d, y: lt.y + bit_v_d }];
  const pdr1 = get_path_by_dot(path1_dot_range);
  const path_obj_1 = { path_dot: path1, path_dot_range: pdr1, path_rot: '', type: CtrlElementType.RectLT };
  //rt
  let rt = { x: frame.width, y: 0 };
  rt = matrix.computeCoord(rt.x, rt.y);
  let point2_dot = [{ x: rt.x - bit_v, y: rt.y - bit_v }, { x: rt.x + bit_v, y: rt.y - bit_v }, { x: rt.x + bit_v, y: rt.y + bit_v }, { x: rt.x - bit_v, y: rt.y + bit_v }];
  const path2 = get_path_by_dot(point2_dot);
  let path2_dot_range = [{ x: rt.x - bit_v_d, y: rt.y - bit_v_d }, { x: rt.x + bit_v_d, y: rt.y - bit_v_d }, { x: rt.x + bit_v_d, y: rt.y + bit_v_d }, { x: rt.x - bit_v_d, y: rt.y + bit_v_d }];
  const pdr2 = get_path_by_dot(path2_dot_range);

  const path_obj_2 = { path_dot: path2, path_dot_range: pdr2, path_rot: '', type: CtrlElementType.RectRT };

  //rb
  let rb = { x: frame.width, y: frame.height };
  rb = matrix.computeCoord(rb.x, rb.y);
  let point3_dot = [{ x: rb.x - bit_v, y: rb.y - bit_v }, { x: rb.x + bit_v, y: rb.y - bit_v }, { x: rb.x + bit_v, y: rb.y + bit_v }, { x: rb.x - bit_v, y: rb.y + bit_v }];
  const path3 = get_path_by_dot(point3_dot);
  let path3_dot_range = [{ x: rb.x - bit_v_d, y: rb.y - bit_v_d }, { x: rb.x + bit_v_d, y: rb.y - bit_v_d }, { x: rb.x + bit_v_d, y: rb.y + bit_v_d }, { x: rb.x - bit_v_d, y: rb.y + bit_v_d }];
  const pdr3 = get_path_by_dot(path3_dot_range);
  const path_obj_3 = { path_dot: path3, path_dot_range: pdr3, path_rot: '', type: CtrlElementType.RectRB };
  //lb
  let lb = { x: 0, y: frame.height };
  lb = matrix.computeCoord(lb.x, lb.y)
  let point4_dot = [{ x: lb.x - bit_v, y: lb.y - bit_v }, { x: lb.x + bit_v, y: lb.y - bit_v }, { x: lb.x + bit_v, y: lb.y + bit_v }, { x: lb.x - bit_v, y: lb.y + bit_v }];
  const path4 = get_path_by_dot(point4_dot);
  let path4_dot_range = [{ x: lb.x - bit_v_d, y: lb.y - bit_v_d }, { x: lb.x + bit_v_d, y: lb.y - bit_v_d }, { x: lb.x + bit_v_d, y: lb.y + bit_v_d }, { x: lb.x - bit_v_d, y: lb.y + bit_v_d }];
  const pdr4 = get_path_by_dot(path4_dot_range);
  const path_obj_4 = { path_dot: path4, path_dot_range: pdr4, path_rot: '', type: CtrlElementType.RectLB };
  paths.push(path_obj_1, path_obj_2, path_obj_3, path_obj_4);
}
function get_path_by_dot(ps: { x: number, y: number }[]): string {
  const [p0, p1, p2, p3] = ps;
  return `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} z`;
}
function get_r_path(ps: { x: number, y: number }[]) {

}

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
    <g v-for="(p, i) in paths" :key="i">
      <path :d="p.path_dot_range" fill="yellow" stroke='transparent'
        @mousedown.stop="(e) => point_mousedown(e, p.type, false)">
      </path>
      <path :d="p.path_dot" fill="orange" stroke='#865dff' stroke-width="1.5px"
        @mousedown.stop="(e) => point_mousedown(e, p.type, false)">
      </path>
    </g>
  </g>
</template>
<style lang='scss' scoped></style>