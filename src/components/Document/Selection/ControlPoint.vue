<script lang="ts" setup>
import { Context } from '@/context';
import { Shape } from '@kcdesign/data/data/shape';
import { ref, defineProps, computed } from 'vue';
interface Props {
  point: [string, number, number, string],
  shape: Shape,
  context: Context
}
const props = defineProps<Props>();
const editor = computed(() => {
  return props.context.editor4Shape(props.shape);
})
let dragContainer = ref<HTMLElement>();
let dragHandle = ref<HTMLElement>();
let isDragging = false;
let startPosition = { x: 0, y: 0 };

const onMouseDown = (event: MouseEvent) => {
  if (!dragContainer.value || !dragHandle.value) return;
  if (event.button !== 0) return;
  isDragging = true;
  const { clientX, clientY } = event;
  startPosition = {
    x: clientX,
    y: clientY
  }
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

const onMouseMove = (event: MouseEvent) => {
  if (!isDragging || !dragContainer.value || !dragHandle.value) return;
  change({ x: event.clientX - startPosition.x, y: event.clientY - startPosition.y });
  startPosition.x = event.clientX;
  startPosition.y = event.clientY;
}

function change(delta: { x: number, y: number }) {
  const p = props.point[0];
  const realXY = props.shape.realXY();
  if (p === 'lt') {
    editor.value.translateTo(realXY.x + delta.x, realXY.y + delta.y);
    editor.value.expandTo(realXY.width - delta.x, realXY.height - delta.y);
  } else if (p === 'rt') {
    editor.value.translateTo(realXY.x, realXY.y + delta.y);
    editor.value.expandTo(realXY.width + delta.x, realXY.height - delta.y);
  } else if (p === 'rb') {
    editor.value.expandTo(realXY.width + delta.x, realXY.height + delta.y);
  } else {
    editor.value.translateTo(realXY.x + delta.x, realXY.y);
    editor.value.expandTo(realXY.width - delta.x, realXY.height + delta.y);
  }
}

const onMouseUp = () => {
  if (!isDragging) return;
  isDragging = false
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}
</script>
<template>
  <div ref="dragContainer" class="drag-container" :style="{
    left: `${point[1]}px`,
    top: `${point[2]}px`
  }" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp">
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
      cursor: move;
      width: 10px;
      height: 10px;
      border: solid 1px var(--active-color);
      border-radius: 4px;
      background-color: var(--theme-color-anti);
    }
  }
}
</style>
