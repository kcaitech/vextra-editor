<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncBaseAction, CtrlElementType, Matrix, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive, ref } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
import { getAngle } from '@/utils/common';
import { update_dot } from './common';
import { Point } from "../../SelectionView.vue";
import { Action } from '@/context/tool';
import { Asssit, PointType } from '@/context/assist';

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
const valid = ref<boolean>(true);
const data: { dots: Dot[] } = reactive({ dots: [] });
const { dots } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let asyncBaseAction: AsyncBaseAction | undefined = undefined;
let pointType: PointType = 'lt';
let stickedX: boolean = false;
let stickedY: boolean = false;
let sticked_x_v: number = 0;
let sticked_y_v: number = 0;

const STICKNESS = Asssit.STICKNESS + 1;

const dragActiveDis = 3;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;
function update() {
  matrix.reset(props.matrix);
  update_dot_path();
}
function update_dot_path() {
  if (!valid.value) return;
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
function ct2pt(ct: CtrlElementType) {
  if (ct === CtrlElementType.RectLT) return 'lt';
  else if (ct === CtrlElementType.RectRT) return 'rt';
  else if (ct === CtrlElementType.RectRB) return 'rb';
  else if (ct === CtrlElementType.RectLB) return 'lb';
  else return 'lt';
}
function point_mousedown(event: MouseEvent, ele: CtrlElementType) {
  if (!valid.value) return;
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
  pointType = ct2pt(cur_ctrl_type);
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
  let update_type = 0;
  if (isDragging && asyncBaseAction) {
    if (cur_ctrl_type.endsWith('rotate')) {
      let deg = 0;
      const { x: ax, y: ay } = props.axle;
      deg = getAngle([ax, ay, sx, sy], [ax, ay, mx, my]) || 0;
      if (props.shape.isFlippedHorizontal) deg = -deg;
      if (props.shape.isFlippedVertical) deg = -deg
      asyncBaseAction.executeRotate(deg);
      update_type = 3;
    } else {
      const action = props.context.tool.action;
      const p1: PageXY = submatrix.computeCoord(startPosition.x, startPosition.y);
      let p2: PageXY = submatrix.computeCoord(mouseOnClient.x, mouseOnClient.y);
      if (event.shiftKey || props.shape.constrainerProportions || action === Action.AutoK) {
        p2 = get_t(cur_ctrl_type, p1, p2);
      }
      update_type = scale(asyncBaseAction, p1, p2);
    }
    if (update_type === 3) startPosition = { ...mouseOnClient };
    else if (update_type === 2) startPosition.y = mouseOnClient.y;
    else if (update_type === 1) startPosition.x = mouseOnClient.x;
    setCursor(cur_ctrl_type, true);
  } else {
    if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
      isDragging = true;
      submatrix.reset(workspace.matrix.inverse);
      cur_ctrl_type.endsWith('rotate') ? workspace.rotating(true) : workspace.scaling(true);
      asyncBaseAction = props.context.editor.controller().asyncRectEditor(props.shape, props.context.selection.selectedPage!);
      props.context.assist.setTransTarget([props.shape]);
    }
  }
}
function get_t(cct: CtrlElementType, p1: PageXY, p2: PageXY): PageXY {
  if (cct === CtrlElementType.RectLT) {
    const m = props.shape.matrix2Root();
    p1 = m.inverseCoord(p1.x, p1.y);
    p2 = m.inverseCoord(p2.x, p2.y);
    const pre_delta = { x: p2.x - p1.x, y: p2.y - p1.y };
    const f = props.shape.frame;
    const r = f.width / f.height;
    return m.computeCoord(pre_delta.x, pre_delta.x * (1 / r));
  } else if (cct === CtrlElementType.RectRT) {
    const m = props.shape.matrix2Root();
    p1 = m.inverseCoord(p1.x, p1.y);
    p2 = m.inverseCoord(p2.x, p2.y);
    const pre_delta = { x: p2.x - p1.x, y: p2.y - p1.y };
    const f = props.shape.frame;
    const r = f.width / f.height;
    return m.computeCoord(f.width + pre_delta.x, -pre_delta.x * (1 / r));
  } else if (cct === CtrlElementType.RectRB) {
    const m = props.shape.matrix2Root();
    p1 = m.inverseCoord(p1.x, p1.y);
    p2 = m.inverseCoord(p2.x, p2.y);
    const pre_delta = { x: p2.x - p1.x, y: p2.y - p1.y };
    const f = props.shape.frame;
    const r = f.width / f.height;
    return m.computeCoord(f.width + pre_delta.x, f.height + pre_delta.x * (1 / r));
  } else if (cct === CtrlElementType.RectLB) {
    const m = props.shape.matrix2Root();
    p1 = m.inverseCoord(p1.x, p1.y);
    p2 = m.inverseCoord(p2.x, p2.y);
    const pre_delta = { x: p2.x - p1.x, y: p2.y - p1.y };
    const f = props.shape.frame;
    const r = f.width / f.height;
    return m.computeCoord(pre_delta.x, f.height - pre_delta.x * (1 / r));
  } else return p2
}
function scale(asyncBaseAction: AsyncBaseAction, p1: PageXY, p2: PageXY) {
  let update_type = 3;
  const target = props.context.assist.point_match(props.shape, pointType);
  if (target) {
    if (stickedX) {
      if (Math.abs(p2.x - sticked_x_v) > STICKNESS) stickedX = false;
      else {
        p2.x = sticked_x_v;
        update_type = update_type - 1;
      }
    } else if (target.sticked_by_x) {
      p2.x = target.x;
      sticked_x_v = p2.x;
      update_type = update_type - 1;
      stickedX = true;
    }
    if (stickedY) {
      if (Math.abs(p2.y - sticked_y_v) > STICKNESS) stickedY = false;
      else {
        p2.y = sticked_y_v;
        update_type = update_type - 2;
      }
    } else if (target.sticked_by_y) {
      p2.y = target.y;
      sticked_y_v = p2.y;
      update_type = update_type - 2;
      stickedY = true;
    }
    asyncBaseAction.executeScale(cur_ctrl_type, p1, p2);
  } else {
    asyncBaseAction.executeScale(cur_ctrl_type, p1, p2);
  }
  return update_type;
}
function point_mouseup(event: MouseEvent) {
  if (event.button !== 0) return;
  if (isDragging) {
    props.context.assist.reset();
    isDragging = false;
  }
  if (asyncBaseAction) asyncBaseAction = asyncBaseAction.close();
  document.removeEventListener('mousemove', point_mousemove);
  document.removeEventListener('mouseup', point_mouseup);
  const workspace = props.context.workspace;
  workspace.scaling(false);
  workspace.rotating(false);
  workspace.setCtrl('page');
  props.context.cursor.reset();
}
function setCursor(t: CtrlElementType, force?: boolean) {
  if (!valid.value) return;
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
function point_mouseleave() {
  props.context.cursor.setType('auto-0');
}
function window_blur() {
  const workspace = props.context.workspace;
  if (isDragging) {
    props.context.assist.reset();
    isDragging = false;
  }
  if (asyncBaseAction) asyncBaseAction = asyncBaseAction.close();
  workspace.scaling(false);
  workspace.rotating(false);
  workspace.setCtrl('page');
  props.context.cursor.reset();
  document.removeEventListener('mousemove', point_mousemove);
  document.removeEventListener('mouseup', point_mouseup);
}
function ctrl_frame_watcher() {
  valid.value = true;
  const p1 = props.cFrame[0], p2 = props.cFrame[2];
  const w = Math.abs(p2.x - p1.x), h = Math.abs(p2.y - p1.y);
  if (w < 6 || h < 6) valid.value = false;
}
watch(() => props.cFrame, ctrl_frame_watcher, { deep: true, immediate: true });
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
  <g :opacity="valid ? 1 : 0">
    <g v-for="(p, i) in dots" :key="i" :style="`transform: ${p.r.transform};`">
      <path :d="p.r.p" fill="transparent" stroke="none" @mousedown.stop="(e) => point_mousedown(e, p.type2)"
        @mouseenter="() => setCursor(p.type2)" @mouseleave="point_mouseleave">
      </path>
      <rect :x="p.extra.x" :y="p.extra.y" width="14px" height="14px" fill="transparent" stroke='transparent'
        @mousedown.stop="(e) => point_mousedown(e, p.type)" @mouseenter="() => setCursor(p.type)"
        @mouseleave="point_mouseleave">
      </rect>
      <rect :x="p.point.x" :y="p.point.y" width="8px" height="8px" fill="#ffffff" stroke='#865dff' stroke-width="1.5px"
        @mousedown.stop="(e) => point_mousedown(e, p.type)" @mouseenter="() => setCursor(p.type)"
        @mouseleave="point_mouseleave"></rect>
    </g>
  </g>
</template>
<style lang='scss' scoped></style>