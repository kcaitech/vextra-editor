<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncBaseAction, CtrlElementType, Matrix, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
import { getAngle } from '@/utils/common';
import { update_dot } from './common';
interface Props {
  matrix: number[]
  context: Context
  shape: Shape
  axle: { x: number, y: number }
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
const data: { dots: Dot[] } = reactive({ dots: [] });
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
  if (!props.context.workspace.shouldSelectionViewUpdate) return;
  dots.length = 0;
  const frame = props.shape.frame;
  const s_r = props.shape.rotation || 0;
  let lt = matrix.computeCoord(0, 0);
  let rt = matrix.computeCoord(frame.width, 0);
  let rb = matrix.computeCoord(frame.width, frame.height);
  let lb = matrix.computeCoord(0, frame.height);
  dots.push(...update_dot([lt, rt, rb, lb], s_r, matrix, props.shape));
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
  cur_ctrl_type = ele;
  document.addEventListener('mousemove', point_mousemove);
  document.addEventListener('mouseup', point_mouseup);
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
      workspace.scaling(true);
      matrix.reset(workspace.matrix);
      const p1OnPage: PageXY = matrix.inverseCoord(startPosition.x, startPosition.y);
      const p2Onpage: PageXY = matrix.inverseCoord(mouseOnClient.x, mouseOnClient.y);
      asyncBaseAction.execute(cur_ctrl_type, p1OnPage, p2Onpage, deg, aType);
    }
    startPosition = { ...mouseOnClient };
  } else {
    if (Math.hypot(mouseOnClient.x - startPosition.x, mouseOnClient.y - startPosition.y) > dragActiveDis) {
      isDragging = true;
      const shapes: Shape[] = props.context.selection.selectedShapes;
      asyncBaseAction = props.context.editor.controller().asyncRectEditor(shapes, props.context.selection.selectedPage!);
    }
  }
  setCursor(cur_ctrl_type, true);
}
function point_mouseup(event: MouseEvent) {
  if (event.button !== 0) return;
  if (isDragging) isDragging = false;
  if (asyncBaseAction) asyncBaseAction = asyncBaseAction.close();
  document.removeEventListener('mousemove', point_mousemove);
  document.removeEventListener('mouseup', point_mouseup);
  const workspace = props.context.workspace;
  workspace.scaling(false);
  workspace.setCtrl('page');
  props.context.cursor.reset();
}
function setCursor(t: CtrlElementType, force?: boolean) {
  const cursor = props.context.cursor;
  let deg = props.shape.rotation || 0;
  if (t === CtrlElementType.RectLT) {
    deg = deg + 45;
    if (props.shape.isFlippedHorizontal) deg = 180 - deg;
    if (props.shape.isFlippedVertical) deg = 360 - deg;
    cursor.setType(`scale-${deg}`, force);
  } else if (t === CtrlElementType.RectRT) {
    deg = deg + 135;
    if (props.shape.isFlippedHorizontal) deg = 180 - deg;
    if (props.shape.isFlippedVertical) deg = 360 - deg;
    cursor.setType(`scale-${deg}`, force);
  } else if (t === CtrlElementType.RectRB) {
    deg = deg + 45;
    if (props.shape.isFlippedHorizontal) deg = 180 - deg;
    if (props.shape.isFlippedVertical) deg = 360 - deg;
    cursor.setType(`scale-${deg}`, force);
  } else if (t === CtrlElementType.RectLB) {
    deg = deg + 135;
    if (props.shape.isFlippedHorizontal) deg = 180 - deg;
    if (props.shape.isFlippedVertical) deg = 360 - deg;
    cursor.setType(`scale-${deg}`, force);
  } else if (t === CtrlElementType.RectLTR) {
    deg = deg + 225;
    if (props.shape.isFlippedHorizontal) deg = 180 - deg;
    if (props.shape.isFlippedVertical) deg = 360 - deg;
    cursor.setType(`rotate-${deg}`, force);
  } else if (t === CtrlElementType.RectRTR) {
    deg = deg + 315;
    if (props.shape.isFlippedHorizontal) deg = 180 - deg;
    if (props.shape.isFlippedVertical) deg = 360 - deg;
    cursor.setType(`rotate-${deg}`, force);
  } else if (t === CtrlElementType.RectRBR) {
    deg = deg + 45;
    if (props.shape.isFlippedHorizontal) deg = 180 - deg;
    if (props.shape.isFlippedVertical) deg = 360 - deg;
    cursor.setType(`rotate-${deg}`, force);
  } else if (t === CtrlElementType.RectLBR) {
    deg = deg + 135;
    if (props.shape.isFlippedHorizontal) deg = 180 - deg;
    if (props.shape.isFlippedVertical) deg = 360 - deg;
    cursor.setType(`rotate-${deg}`, force);
  }
}
function point_mouseenter(t: CtrlElementType) {
  setCursor(t);
}
function point_mouseleave() {
  const cursor = props.context.cursor;
  cursor.setType('auto-0');
}
function window_blur() {
  const workspace = props.context.workspace;
  if (isDragging) isDragging = false;
  if (asyncBaseAction) asyncBaseAction = asyncBaseAction.close();
  workspace.scaling(false);
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
      <path :d="p.r.p" fill="transparent" stroke="none" @mousedown.stop="(e) => point_mousedown(e, p.type2)"
        @mouseenter="() => point_mouseenter(p.type2)" @mouseleave="point_mouseleave"
        :style="`transform: ${p.r.transform};`">
      </path>
      <rect :x="p.extra.x" :y="p.extra.y" width="14px" height="14px" fill="transparent" stroke='transparent' rx="7px"
        ry="7px" @mousedown.stop="(e) => point_mousedown(e, p.type)" @mouseenter="() => point_mouseenter(p.type)"
        @mouseleave="point_mouseleave">
      </rect>
      <rect :x="p.point.x" :y="p.point.y" width="8px" height="8px"
        :fill="p.type === CtrlElementType.RectLT ? 'red' : '#ffffff'" stroke='#865dff' stroke-width="1.5px" rx="4px"
        ry="4px" @mousedown.stop="(e) => point_mousedown(e, p.type)" @mouseenter="() => point_mouseenter(p.type)"
        @mouseleave="point_mouseleave"></rect>
    </g>
  </g>
</template>
<style lang='scss' scoped></style>