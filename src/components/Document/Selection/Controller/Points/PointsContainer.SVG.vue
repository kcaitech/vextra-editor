<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncBaseAction, CtrlElementType, Matrix, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
import { getAngle } from '@/utils/common';
interface Props {
  matrix: number[]
  context: Context
  shape: Shape
  axle: { x: number, y: number }
}
const props = defineProps<Props>();
const matrix = new Matrix();
const data: { dots: { point: { x: number, y: number }, extra: { x: number, y: number }, r: { p: string, transform: string }, type: CtrlElementType, type2: CtrlElementType }[] } = reactive({ dots: [] });
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
  const s_r = props.shape.rotation || 0;

  // lt
  let lt = { x: 0, y: 0 };
  lt = matrix.computeCoord(lt.x, lt.y);
  const r1 = get_r_path(lt, CtrlElementType.RectLT);
  const transform1 = `translate(${lt.x}px, ${lt.y}px) rotate(${-180 + s_r}deg) translate(-${lt.x}px, -${lt.y}px)`;
  const path_obj_1 = { point: { x: lt.x - bit_v, y: lt.y - bit_v }, extra: { x: lt.x - bit_v_d, y: lt.y - bit_v_d }, r: { p: r1, transform: transform1 }, type: CtrlElementType.RectLT, type2: CtrlElementType.RectLTR };
  //rt
  let rt = { x: frame.width, y: 0 };
  rt = matrix.computeCoord(rt.x, rt.y);
  const r2 = get_r_path(rt, CtrlElementType.RectRT);
  const transform2 = `translate(${rt.x}px, ${rt.y}px) rotate(${-90 + s_r}deg) translate(-${rt.x}px, -${rt.y}px)`;
  const path_obj_2 = { point: { x: rt.x - bit_v, y: rt.y - bit_v }, extra: { x: rt.x - bit_v_d, y: rt.y - bit_v_d }, r: { p: r2, transform: transform2 }, type: CtrlElementType.RectRT, type2: CtrlElementType.RectRTR };

  //rb
  let rb = { x: frame.width, y: frame.height };
  rb = matrix.computeCoord(rb.x, rb.y);
  const r3 = get_r_path(rb, CtrlElementType.RectRB);
  const transform3 = `translate(${rb.x}px, ${rb.y}px) rotate(${0 + s_r}deg) translate(-${rb.x}px, -${rb.y}px)`;
  const path_obj_3 = { point: { x: rb.x - bit_v, y: rb.y - bit_v }, extra: { x: rb.x - bit_v_d, y: rb.y - bit_v_d }, r: { p: r3, transform: transform3 }, type: CtrlElementType.RectRB, type2: CtrlElementType.RectRBR };
  //lb
  let lb = { x: 0, y: frame.height };
  lb = matrix.computeCoord(lb.x, lb.y)
  const r4 = get_r_path(lb, CtrlElementType.RectLB);
  const transform4 = `translate(${lb.x}px, ${lb.y}px) rotate(${90 + s_r}deg) translate(-${lb.x}px, -${lb.y}px)`;
  const path_obj_4 = { point: { x: lb.x - bit_v, y: lb.y - bit_v }, extra: { x: lb.x - bit_v_d, y: lb.y - bit_v_d }, r: { p: r4, transform: transform4 }, type: CtrlElementType.RectLB, type2: CtrlElementType.RectLBR };
  dots.push(path_obj_1, path_obj_2, path_obj_3, path_obj_4);
}
function get_r_path(ps: { x: number, y: number }, type: CtrlElementType) {
  const bit_v_r = 14;
  return `M${ps.x} ${ps.y} h${bit_v_r} a${bit_v_r} ${bit_v_r} 0 0 1 ${-bit_v_r} ${bit_v_r} z`;
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
  let aType: 'scale' | 'rotate' = 'scale';
  if (isDragging) {
    let deg = 0;
    if (cur_ctrl_type.endsWith('rotate')) {
      const { x: sx, y: sy } = startPosition;
      const { x: mx, y: my } = mouseOnClient;
      const { x: ax, y: ay } = props.axle;
      deg = getAngle([ax, ay, sx, sy], [ax, ay, mx, my]) || 0;
      aType = 'rotate';
    }
    if (asyncBaseAction) {
      const selection = props.context.selection;
      workspace.scaling(true);
      matrix.reset(workspace.matrix);
      const shapes = selection.selectedShapes;
      const len = shapes.length;
      if (len === 1) {
        const p1OnPage: PageXY = matrix.inverseCoord(startPosition.x, startPosition.y);
        const p2Onpage: PageXY = matrix.inverseCoord(mouseOnClient.x, mouseOnClient.y);
        asyncBaseAction.execute(cur_ctrl_type, p1OnPage, p2Onpage, deg, aType);
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
      <path :d="p.r.p" fill="transparent" stroke="none" @mousedown.stop="(e) => point_mousedown(e, p.type2)"
        :style="`transform: ${p.r.transform}; cursor: pointer`">
      </path>
      <rect :x="p.extra.x" :y="p.extra.y" width="14px" height="14px" fill="transparent" stroke='transparent'
        @mousedown.stop="(e) => point_mousedown(e, p.type)"></rect>
      <rect :x="p.point.x" :y="p.point.y" width="8px" height="8px" fill="#ffffff" stroke='#865dff' stroke-width="1.5px"
        @mousedown.stop="(e) => point_mousedown(e, p.type)"></rect>
    </g>
  </g>
</template>
<style lang='scss' scoped></style>