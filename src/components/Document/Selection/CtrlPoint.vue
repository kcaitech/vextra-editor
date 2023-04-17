<script lang="ts" setup>
import { Context } from '@/context';
import { ref, defineProps, defineEmits, computed, onMounted, onUnmounted } from 'vue';
import { CtrlElementType } from '@/context/workspace';
import { AbsolutePosition } from '@/context/selection';
import { Matrix } from '@kcdesign/data/basic/matrix';
import { getAngle } from '@/utils/common';
import { CPoint } from './CtrlRect/RectangleCtrl.vue'
import { WorkSpace } from '@/context/workspace';
interface Props {
  context: Context,
  ctrlPointType: CtrlElementType,
  axle: AbsolutePosition,
  point: CPoint
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'transform', type: CtrlElementType, delta: { x: number, y: number, deg: number },): void
}>();
const matrix = new Matrix();
const workspace = computed(() => props.context.workspace);
const dragActiveDis = 3;
const dragContainer = ref<HTMLElement>();
const dragHandle = ref<HTMLElement>();
let isDragging = false;
let startPosition = { x: 0, y: 0 };
let systemPosition = { x: 0, y: 0 };
let root = { x: 0, y: 0 };
function onMouseDown(event: MouseEvent) {
  if (!dragContainer.value || !dragHandle.value || !props.context.repo) return;
  const { button, clientX, clientY } = event;
  if (button !== 0) return;
  matrix.reset(props.context.workspace.matrix);
  root = workspace.value.root;
  startPosition = matrix.inverseCoord(clientX - root.x, clientY - root.y);
  systemPosition = { x: clientX, y: clientY };
  props.context.repo.start('transform', {});
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(event: MouseEvent) {
  const { clientX, clientY } = event;

  if (isDragging && props.context.repo) {
    const mouseOnPage = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    const delta = { x: mouseOnPage.x - startPosition.x, y: mouseOnPage.y - startPosition.y, deg: 0 };
    if (event.ctrlKey) {
      const { x: sx, y: sy } = startPosition;
      const { x: mx, y: my } = mouseOnPage;
      const { x: ax, y: ay } = props.axle;
      delta.deg = getAngle([ax, ay, sx, sy], [ax, ay, mx, my]) || 0;
    }
    emit('transform', props.point[0], delta);
    props.context.repo.transactCtx.fireNotify();
    startPosition = { x: mouseOnPage.x, y: mouseOnPage.y };
    systemPosition = { x: clientX, y: clientY };
  } else {
    if (Math.hypot(systemPosition.x - clientX, systemPosition.y - clientY) > dragActiveDis) {
      isDragging = true;
    }
  }
}

function onMouseUp() {
  if (!isDragging) {
    props.context.repo?.rollback();
  } else {
    props.context.repo?.commit({});
  }
  isDragging = false;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}
function actionFormWorkspace(t: number, params: any) {
  console.log('copy');
  if (t !== WorkSpace.RELAY) return;
  props.context.editor4Shape(params.shpae);
  props.context.repo?.rollback();
  props.context.repo?.start('addShapeByFreeFrame', {});
  root = workspace.value.root;
  startPosition = params.startPosition;
  systemPosition = params.systemPosition;
  document.addEventListener('mousemove', onMouseMoveRelay);
  document.addEventListener('mouseup', onMouseUpRelay);
}
function onMouseMoveRelay(event: MouseEvent) {
  const { clientX, clientY } = event;
  const mouseOnPage = matrix.inverseCoord(clientX - root.x, clientY - root.y);
  const delta = { x: mouseOnPage.x - startPosition.x, y: mouseOnPage.y - startPosition.y, deg: 0 };
  emit('transform', props.point[0], delta);
  props.context.repo?.transactCtx.fireNotify();
  startPosition = { x: mouseOnPage.x, y: mouseOnPage.y };
  systemPosition = { x: clientX, y: clientY };
}
function onMouseUpRelay(event: MouseEvent) {
  props.context.repo?.commit({});
  document.removeEventListener('mousemove', onMouseMoveRelay);
  document.removeEventListener('mouseup', onMouseUpRelay);
}
onMounted(() => {
  props.context.workspace.watch(actionFormWorkspace);
})

onUnmounted(() => {
  props.context.workspace.unwatch(actionFormWorkspace);
})
</script>
<template>
  <div ref="dragContainer" class="drag-container" @mousedown.stop="onMouseDown"
    :style="{ left: `${props.point[1]}px`, top: `${props.point[2]}px`, cursor: `${props.point[3]}, auto` }">
    <div class="drag-handle" ref="dragHandle">
      <div></div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.drag-container {
  position: absolute;
  z-index: 1;

  .drag-handle {

    >div {
      width: 8px;
      height: 8px;
      border: solid 1px var(--active-color);
      border-radius: 0px;
      background-color: var(--theme-color-anti);
      box-sizing: border-box;
    }
  }
}
</style>
