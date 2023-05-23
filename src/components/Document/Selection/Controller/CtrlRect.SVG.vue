<script setup lang='ts'>
import { defineProps, computed, onMounted, onUnmounted, watchEffect, ref, reactive } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data';
import { CtrlElementType, WorkSpace } from "@/context/workspace";
import { ClientXY } from "@/context/selection";
import CtrlBar from "./Bars/CtrlBar.vue";
import CtrlPoint from "./Points/CtrlPoint.vue";
import { Point, Bar } from "../SelectionView.vue";
import { keyboardHandle as handle } from "@/utils/controllerFn";
import { Selection } from "@/context/selection";
import { useController } from "./controller";
import { genRectPath } from "../common";
import { Shape, ShapeFrame } from "@kcdesign/data";
interface Props {
  context: Context,
  controllerFrame: Point[],
  rotate: number,
  matrix: number[],
  shape: Shape
}
const props = defineProps<Props>();
const { isDrag } = useController(props.context);
const workspace = computed(() => props.context.workspace);
const visible = ref<boolean>(true);
const editing = ref<boolean>(false); // 是否进入路径编辑状态
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
let viewBox = '';
let groupTrans = '';
let frame: ShapeFrame;
// #region 绘制控件
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
  return "" + bounds.left + " " + bounds.top + " " + (bounds.right - bounds.left) + " " + (bounds.bottom - bounds.top);
}
function updateControllerView() {
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
  const shape = props.shape;
  frame = props.shape.frame;
  if (shape.isFlippedHorizontal || shape.isFlippedVertical || shape.rotation) {
    const cx = frame.x + frame.width / 2;
    const cy = frame.y + frame.height / 2;
    groupTrans = "translate(" + bounds.left + "px," + bounds.top + "px) "
    groupTrans += "translate(" + cx + "px," + cy + "px) "
    if (shape.isFlippedHorizontal) groupTrans += "rotateY(180deg) "
    if (shape.isFlippedVertical) groupTrans += "rotateX(180deg) "
    if (shape.rotation) groupTrans += "rotate(" + shape.rotation + "deg) "
    groupTrans += "translate(" + (-cx + frame.x) + "px," + (-cy + frame.y) + "px)"
  }
  else {
    groupTrans = `translate(${bounds.left}px,${bounds.top}px)`;
  }
}
// #endregion

function updater(t?: number) {
  updateControllerView();
  if (t == Selection.CHANGE_SHAPE) {
    editing.value = false;
  }
}
function workspaceUpdate(t?: number) {
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
  handle(e, props.context);
}

function windowBlur() {
  // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
  document.removeEventListener('mousemove', mousemove);
  document.removeEventListener('mouseup', mouseup);
}
onMounted(() => {
  props.context.selection.watch(updater);
  props.context.workspace.watch(workspaceUpdate);
  window.addEventListener('blur', windowBlur);
  document.addEventListener('keydown', keyboardHandle);
})

onUnmounted(() => {
  props.context.selection.unwatch(updater);
  props.context.workspace.unwatch(workspaceUpdate);
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
    <path :d="boundrectPath" fill="none" stroke='blue' stroke-width="1px"></path>
    <g :style="{ transform: groupTrans }">
      <rect stroke='blue' stroke-width="1px" fill="#ffffff" width="8" height="8" rx="2" ry="2" :x="-4" :y="-4"></rect>
      <rect stroke='blue' stroke-width="1px" fill="#ffffff" width="8" height="8" :x="frame.width - 4" :y="-4" rx="2"
        ry="2"></rect>
      <rect stroke='blue' stroke-width="1px" fill="#ffffff" width="8" height="8" :x="frame.width - 4"
        :y="frame.height - 4" rx="2" ry="2">
      </rect>
      <rect stroke='blue' stroke-width="1px" fill="#ffffff" width="8" height="8" :y="frame.height - 4" :x="-4" rx="2"
        ry="2">
      </rect>
    </g>
  </svg>
</template>
<style lang='scss' scoped>
.un-visible {
  opacity: 0;
}

.editing {
  background-color: rgba($color: #2561D9, $alpha: 0.15);
}
</style>