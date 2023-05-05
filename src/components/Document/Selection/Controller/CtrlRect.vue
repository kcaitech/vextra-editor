<script setup lang='ts'>
import { defineProps, computed, onMounted, onUnmounted, watchEffect, ref, reactive } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data/basic/matrix';
import { Action, CtrlElementType } from "@/context/workspace";
import { XY } from "@/context/selection";
import { translate, adjustLT2, adjustLB2, adjustRT2, adjustRB2, translateTo } from "@kcdesign/data/editor/frame";
import CtrlPoint from "./Points/CtrlPoints.vue";
import { GroupShape, Shape } from "@kcdesign/data/data/shape";
interface ControllerFrame {
  visible: 1 | 0
  height: number
  width: number
}
interface Props {
  context: Context
  isController: boolean
}
const props = defineProps<Props>();
const workspace = computed(() => props.context.workspace);

const reflush = ref(0);
const watcher = () => {
  reflush.value++;
  updater();
}
const matrix = new Matrix();
const dragActiveDis = 3;
const borderWidth = 2;
const offset = 17;
const controllerFrame: ControllerFrame = reactive({
  visible: 1,
  height: 0,
  width: 0
});
let isDragging = false;
let startPosition: XY = { x: 0, y: 0 };
let root: XY = { x: 0, y: 0 };
let shapes: Shape[] = [];

function updater() { }

function getShapesByXY() {
  const shapes = props.context.selection.getShapesByXY(startPosition);
  if (shapes.length) {
    props.context.selection.selectShape(shapes.at(-1));
  } else {
    props.context.selection.selectShape();
  }
}

function mousedown(e: MouseEvent) {
  if (e.button === 0) { // 当前组件只处理左键事件，右键事件冒泡出去由父节点处理
    const action = workspace.value.action;
    if (action === Action.AutoV && props.isController) {
      e.stopPropagation(); // props.isController 当控制权在selection时，不要冒泡出去, 否则父节点也会被控制
      shapes = props.context.selection.selectedShapes;
      if (!shapes.length) return;
      matrix.reset(workspace.value.matrix);
      const { clientX, clientY } = e;
      root = workspace.value.root;
      document.addEventListener('mousemove', mousemove);
      document.addEventListener('mouseup', mouseup);
      startPosition = { x: clientX - root.x, y: clientY - root.y };
    }
  }
}
function mousemove(e: MouseEvent) {
  if (e.button === 0) { //只处理鼠标左键按下时的移动
    const { clientX, clientY } = e;
    const mousePosition = { x: clientX - root.x, y: clientY - root.y };
    if (isDragging) {
      workspace.value.translating(true); // 编辑器开始处于transforming状态 ---start transforming---
      props.context.selection.unHoverShape(); // 当编辑器处于transforming状态时, 此时的编辑器焦点为选中的图层, 应该取消被hover图层的hover状态, 同时不再给其他图层赋予hover状态
      transform(shapes, startPosition, mousePosition);
      startPosition = { ...mousePosition };
    } else {
      if (Math.hypot(mousePosition.x - startPosition.x, mousePosition.y - startPosition.y) > dragActiveDis) { // 是否开始移动的判定条件
        isDragging = true;
        props.context.repo.start('transform', {}); // 开启当前事务,事务在结束(commit/rollback)之前只能开启一次!!! ---begin transaction---
      }
    }
  }
}
function mouseup(e: MouseEvent) {
  if (e.button === 0) { // 只处理鼠标左键按下时的抬起
    if (isDragging) {
      props.context.repo.commit({}); // 如果触发了拖拽状态,必定开启了事务 ---end transaction---
    } else {
      getShapesByXY(); // 单纯点击,只选择图层
    }
    isDragging = false;
    workspace.value.translating(false); // 编辑器关闭transforming状态  ---end transforming---
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
  }
}
function transform(shapes: Shape[], start: XY, end: XY) {
  const ps = matrix.inverseCoord(start.x, start.y);
  const pe = matrix.inverseCoord(end.x, end.y);
  const origin = props.context.selection.getClosetContainer(ps);
  const targetParent = props.context.selection.getClosetContainer(pe);
  // 对选中的每个图层进行变换
  for (let i = 0; i < shapes.length; i++) {
    translate(shapes[i], pe.x - ps.x, pe.y - ps.y);
    if (origin.id !== targetParent.id) {
      shapeMoveNoTransaction(shapes[i], targetParent);
    }
  }
  props.context.repo.transactCtx.fireNotify(); // 通常情况下,当事务结束(commit),系统会根据事务中的改动更新视图. 而移动的过程中,整个移动(transform)的事务并未结束,即尚未commit,此时视图无法得到更新, 可以用此方法更新事务过程中的视图 ---before end transaction---
}

function handlePointAction(type: CtrlElementType, p2: XY, deg?: number, aType?: 'rotate' | 'scale') {
  shapes = props.context.selection.selectedShapes;
  matrix.reset(workspace.value.matrix);
  shapes.forEach(item => {
    if (aType === 'rotate') {
      const newDeg = (item.rotation || 0) + (deg || 0);
      item.rotate(newDeg);
    } else {
      const p2Onpage = matrix.inverseCoord(p2.x, p2.y); // page
      if (type === CtrlElementType.RectLT) {
        adjustLT2(item, p2Onpage.x, p2Onpage.y);
      } else if (type === CtrlElementType.RectRT) {
        adjustRT2(item, p2Onpage.x, p2Onpage.y);
      } else if (type === CtrlElementType.RectRB) {
        adjustRB2(item, p2Onpage.x, p2Onpage.y);
      } else if (type === CtrlElementType.RectLB) {
        adjustLB2(item, p2Onpage.x, p2Onpage.y);
      }
    }
  });
}

function initMatrix() {
  matrix.reset(props.context.workspace.matrix);
  const page = props.context.selection.selectedPage;
  if (page) {
    matrix.preTrans(page.frame.x, page.frame.y);
  }
}

// 自身不带事务的图形移动, 只能在事务开启之后调用
function shapeMoveNoTransaction(shape: Shape, targetParent: GroupShape) {
  const origin: GroupShape = ((shape.parent || props.context.selection.selectedPage) as GroupShape);
  origin.removeChild(shape);
  const { x, y } = shape.frame2Page();
  targetParent.addChild(shape);
  translateTo(shape, x, y);
}

function windowBlur() {
  if (isDragging) { // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
    workspace.value.translating(false);
    props.context.repo.commit({});
    isDragging = false;
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
  }
}
onMounted(() => {
  initMatrix()
  props.context.selection.watch(watcher);
  window.addEventListener('blur', windowBlur);
})

onUnmounted(() => {
  props.context.selection.unwatch(watcher);
  shapes.length = 0;
  window.removeEventListener('blur', windowBlur);
})
watchEffect(watcher)
</script>
<template>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible"
    :viewBox="`0 0 ${controllerFrame.width} ${controllerFrame.height}`" :width="controllerFrame.width"
    :height="controllerFrame.height" :reflush="reflush !== 0 ? reflush : undefined" @mousedown="mousedown"
    :style="{ transform: matrix.toString() }">
    <rect>
      <CtrlPoint></CtrlPoint>
    </rect>
  </svg>
</template>
<style lang='scss' scoped></style>