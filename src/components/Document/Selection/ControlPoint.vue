<template>
  <div class="drag-container" ref="dragContainer" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp">
    <div class="drag-handle" ref="dragHandle">
      <div></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

let dragContainer = ref<HTMLElement | null>(null)
let dragHandle = ref<HTMLElement | null>(null)
let isDragging = false
let mouseOffset = { x: 0, y: 0 }
let startPosition = { x: 0, y: 0 }

const onMouseDown = (event: MouseEvent) => {
  if (!dragContainer.value || !dragHandle.value) {
    return
  }
  if (event.button !== 0) {
    return
  }
  isDragging = true
  startPosition = {
    x: dragContainer.value.offsetLeft,
    y: dragContainer.value.offsetTop
  }
  mouseOffset = {
    x: event.clientX - startPosition.x,
    y: event.clientY - startPosition.y
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const onMouseMove = (event: MouseEvent) => {
  if (!isDragging || !dragContainer.value || !dragHandle.value) {
    return
  }
  const newPosition = {
    x: event.clientX - mouseOffset.x,
    y: event.clientY - mouseOffset.y
  }
  dragContainer.value.style.left = `${newPosition.x}px`
  dragContainer.value.style.top = `${newPosition.y}px`
}

const onMouseUp = () => {
  if (!isDragging) {
    return
  }
  isDragging = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}
</script>

<style scoped lang="scss">
.drag-container {
  position: absolute;
  width: 28px;
  height: 28px;
  cursor: rotate;
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
    }
  }
}
</style>
