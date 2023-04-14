<script lang="ts" setup>
import { Context } from '@/context';
import { ref, defineProps, defineEmits, computed } from 'vue';
import { CtrlElementType } from '@/context/workspace';
import { AbsolutePosition } from '@/context/selection';
import { Matrix } from '@/basic/matrix';
import { getAngle } from '@/utils/common';
import { CPoint } from '../CtrlRect/RectangleCtrl.vue'
import { CtrlRect } from '../SelectionView.vue';
interface Props {
  context: Context,
  axle: AbsolutePosition,
  point: CPoint,
  ctrlRect: CtrlRect
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
let scaling: boolean = false;
let rotating: boolean = false;
function onMouseDown(event: MouseEvent) {
  if (!dragContainer.value || !dragHandle.value || !props.context.repo) return;
  const { button, clientX, clientY, offsetX, offsetY } = event;
  if (button !== 0) return;
  matrix.reset(props.context.workspace.matrix);
  const area = getAreaStatus(props.point[0], {x: offsetX, y: offsetY});
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
function mouseleave() {
  workspace.value.resetCursor();
}
function mousemove(e: MouseEvent) {
  const { offsetX, offsetY } = e;
  const area = getAreaStatus(props.point[0], { x: offsetX, y: offsetY });
  console.log(area);  
  workspace.value.genCursor(area, props.ctrlRect.rotate);
}
function getAreaStatus(ct: CtrlElementType, position: { x: number, y: number }): CtrlElementType {
  let area = ct;
  const { x, y } = position;
  if (ct === CtrlElementType.RectLB) {
    if ((x < 10 && y < 18) || (y >= 18)) {
      area = CtrlElementType.RectLBR;
    }
  }
  return area
}
</script>
<template>
  <div ref="dragContainer" class="drag-container" @mousedown.stop="onMouseDown" @mousemove="mousemove"
    @mouseleave="mouseleave" :style="{ left: `${props.point[1]}px`, top: `${props.point[2]}px` }">
    <div v-if="props.point[0] === CtrlElementType.RectLT" class="drag-handle lt" ref="dragHandle">
      <div class="center"></div>
    </div>
    <div v-if="props.point[0] === CtrlElementType.RectRT" class="drag-handle rt" ref="dragHandle">
      <div class="center"></div>
    </div>
    <div v-if="props.point[0] === CtrlElementType.RectRB" class="drag-handle rb" ref="dragHandle">
      <div class="center"></div>
    </div>
    <div v-if="props.point[0] === CtrlElementType.RectLB" class="drag-handle lb" ref="dragHandle">
      <div class="center"></div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.drag-container {
  position: absolute;
  z-index: 1;
  width: 28px;
  height: 28px;
  background-color: aquamarine;
  .drag-handle {
    position: absolute;
    width: 18px;
    height: 18px;
    background-color: antiquewhite;
    >.center {
      width: 8px;
      height: 8px;
      border: solid 1px var(--active-color);
      border-radius: 0px;
      background-color: var(--theme-color-anti);
      box-sizing: border-box;
    }
  }
  .lt {
    right: 0;
    bottom: 0;
    > div {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
  .rt {
    right: 0;
    bottom: 0;
    > div {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
  .rb {
    right: 0;
    bottom: 0;
    > div {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
  .lb {
    right: 0;
    bottom: 0;
    > div {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
}
</style>
