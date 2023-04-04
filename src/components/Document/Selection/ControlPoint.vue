<script lang="ts" setup>
import { Context } from '@/context';
import { Shape } from '@kcdesign/data/data/shape';
import { ref, defineProps } from 'vue';
import { CtrlElementType } from '@/context/workspace';
import { AbsolutePosition } from '@/context/selection';
import { translateTo, expandTo } from '@kcdesign/data/editor/frame';
interface Props {
  point: [CtrlElementType, number, number, string],
  shape: Shape,
  context: Context
}
const props = defineProps<Props>();
const dragActiveDis = 3;

const dragContainer = ref<HTMLElement>();
const dragHandle = ref<HTMLElement>();
let isDragging = false;
let startPosition = { x: 0, y: 0 };

function onMouseDown(event: MouseEvent) {
  if (!dragContainer.value || !dragHandle.value || !props.context.repo) return;
  if (event.button !== 0) return;
  startPosition = {
    x: event.clientX,
    y: event.clientY
  }
  props.context.repo.start('scale', {});
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(event: MouseEvent) {
  const delta: AbsolutePosition = { x: event.clientX - startPosition.x, y: event.clientY - startPosition.y };
  if (isDragging && props.context.repo) {
    change({ x: delta.x, y: delta.y });
    props.context.repo.transactCtx.fireNotify();
    startPosition.x = event.clientX;
    startPosition.y = event.clientY;
  } else {
    if (Math.hypot(delta.x, delta.y) > dragActiveDis) {
      isDragging = true;
    }
  }
}

function change(delta: { x: number, y: number }) {
  const p = props.point[0];
  const realXY = props.shape.realXY();
  if (p === CtrlElementType.RectLT) {
    translateTo(props.shape, realXY.x + delta.x, realXY.y + delta.y);
    expandTo(props.shape, realXY.width - delta.x, realXY.height - delta.y);
  } else if (p === CtrlElementType.RectRT) {
    translateTo(props.shape, realXY.x, realXY.y + delta.y);
    expandTo(props.shape, realXY.width + delta.x, realXY.height - delta.y);
  } else if (p === CtrlElementType.RectRB) {
    expandTo(props.shape, realXY.width + delta.x, realXY.height + delta.y);
  } else if (p === CtrlElementType.RectLB) {
    translateTo(props.shape, realXY.x + delta.x, realXY.y);
    expandTo(props.shape, realXY.width - delta.x, realXY.height + delta.y);
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
</script>
<template>
  <div ref="dragContainer" class="drag-container" :style="{
    left: `${point[1]}px`,
    top: `${point[2]}px`,
    cursor: point[3]
  }" @mousedown="onMouseDown">
    <div class="drag-handle" ref="dragHandle">
      <div></div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.drag-container {
  position: absolute;
  width: 28px;
  height: 28px;
  z-index: 1;

  .drag-handle {
    width: 100%;
    height: 100%;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;

    >div {
      width: 10px;
      height: 10px;
      border: solid 1px var(--active-color);
      border-radius: 4px;
      background-color: var(--theme-color-anti);
    }
  }
}
</style>
