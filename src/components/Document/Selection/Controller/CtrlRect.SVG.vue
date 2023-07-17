<script setup lang='ts'>
import { computed, onMounted, onUnmounted, watchEffect, ref, reactive } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data';
import { WorkSpace } from "@/context/workspace";
import { Point } from "../SelectionView.vue";
import { keyboardHandle as handle } from "@/utils/controllerFn";
import { ClientXY, Selection } from "@/context/selection";
import { useController } from "./controller";
import { genRectPath } from "../common";
import { Shape } from "@kcdesign/data";
import { useI18n } from "vue-i18n";
import ShapesStrokeContainer from "./ShapeStroke/ShapesStrokeContainer.vue";
import BarsContainer from "./Bars/BarsContainer.SVG.vue";
import PointsContainer from "./Points/PointsContainer.SVG.vue";
import { getAxle } from "@/utils/common";
interface Props {
  context: Context
  controllerFrame: Point[]
  rotate: number
  matrix: number[]
  shape: Shape
}
const props = defineProps<Props>();
const { isDrag } = useController(props.context);
const workspace = computed(() => props.context.workspace);
const visible = ref<boolean>(true);
const editing = ref<boolean>(false); // 是否进入路径编辑状态
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
const { t } = useI18n();
const matrix = new Matrix();
const submatrix = reactive(new Matrix());
let viewBox = '';
const axle = computed<ClientXY>(() => {
  const [lt, rt, rb, lb] = props.controllerFrame;
  return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});
// #region 绘制控件
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
  return "" + bounds.left + " " + bounds.top + " " + (bounds.right - bounds.left) + " " + (bounds.bottom - bounds.top);
}
function updateControllerView() {
  const m2p = props.shape.matrix2Root();
  matrix.reset(m2p);
  matrix.multiAtLeft(props.matrix);
  if (!submatrix.equals(matrix)) submatrix.reset(matrix)
  const framePoint = props.controllerFrame;
  boundrectPath.value = genRectPath(framePoint);
  const p0 = framePoint[0];
  bounds.left = p0.x;
  bounds.top = p0.y;
  bounds.right = p0.x;
  bounds.bottom = p0.y;
  framePoint.reduce((bounds, point) => {
    if (point.x < bounds.left) bounds.left = point.x;
    else if (point.x > bounds.right) bounds.right = point.x;
    if (point.y < bounds.top) bounds.top = point.y;
    else if (point.y > bounds.bottom) bounds.bottom = point.y;
    return bounds;
  }, bounds);
  viewBox = genViewBox(bounds);
}
// #endregion

function updater(t?: number) {
  updateControllerView();
  if (t == Selection.CHANGE_SHAPE) {
    editing.value = false;
  }
}
function workspace_watcher(t?: number) {
  if (t === WorkSpace.TRANSLATING) {
    visible.value = !workspace.value.isTranslating;
  }
}
function mousedown(e: MouseEvent) {
  document.addEventListener('mousemove', mousemove);
  document.addEventListener('mouseup', mouseup);
}
function mousemove(e: MouseEvent) {
  const isDragging = isDrag();
  if (isDragging) {
    visible.value = false; // 控件在移动过程中不可视
  }
}
function mouseup(e: MouseEvent) {
  document.removeEventListener('mousemove', mousemove);
  document.removeEventListener('mouseup', mouseup);
}
function keyboardHandle(e: KeyboardEvent) {
  handle(e, props.context, t);
}
function windowBlur() {
  // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
  document.removeEventListener('mousemove', mousemove);
  document.removeEventListener('mouseup', mouseup);
}
onMounted(() => {
  props.context.selection.watch(updater);
  props.context.workspace.watch(workspace_watcher);
  window.addEventListener('blur', windowBlur);
  document.addEventListener('keydown', keyboardHandle);
})
onUnmounted(() => {
  props.context.selection.unwatch(updater);
  props.context.workspace.unwatch(workspace_watcher);
  window.removeEventListener('blur', windowBlur);
  document.removeEventListener('keydown', keyboardHandle);
})
watchEffect(() => { updater() });
</script>
<template>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-area="controller"
    xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :viewBox="viewBox"
    :width="bounds.right - bounds.left" :height="bounds.bottom - bounds.top"
    :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }"
    :class="{ 'un-visible': !visible }" @mousedown="mousedown" overflow="visible">
    <path :d="boundrectPath" fill="none" stroke='#865dff' stroke-width="1.5px"></path>
    <ShapesStrokeContainer :context="props.context" :matrix="props.matrix" :shape="props.shape">
    </ShapesStrokeContainer>
    <BarsContainer :context="props.context" :matrix="submatrix.toArray()" :shape="props.shape"></BarsContainer>
    <PointsContainer :context="props.context" :matrix="submatrix.toArray()" :shape="props.shape" :axle="axle">
    </PointsContainer>
  </svg>
</template>
<style lang='scss' scoped>
.un-visible {
  opacity: 0;
}

.editing {
  background-color: rgba($color: #865dff, $alpha: 0.15);
}
</style>