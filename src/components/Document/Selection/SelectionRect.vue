<template>
  <div class="rect-container">
    <div class="rect" :style="{ width: rect.width + 'px', height: rect.height + 'px' }"></div>
    <div class="top-handle" :style="{ left: rect.width / 2 + 'px' }" @mousedown="handleMouseDown('top')"></div>
    <div class="right-handle" :style="{ top: rect.height / 2 + 'px' }" @mousedown="handleMouseDown('right')"></div>
    <div class="bottom-handle" :style="{ left: rect.width / 2 + 'px' }" @mousedown="handleMouseDown('bottom')"></div>
    <div class="left-handle" :style="{ top: rect.height / 2 + 'px' }" @mousedown="handleMouseDown('left')"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

interface Handle {
  x: number
  y: number
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

const rect = reactive<Rect>({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
})

const handleOffset = ref<Handle>({
  x: 0,
  y: 0,
})

const handleMouseDown = (type: string) => {
  const { x, y } = event
  const { left, top } = event.currentTarget.getBoundingClientRect()
  handleOffset.value.x = x - left
  handleOffset.value.y = y - top

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (event: MouseEvent) => {
  const { x, y } = event
  const { x: offsetX, y: offsetY } = handleOffset.value

  switch (type) {
    case 'top':
      rect.height += rect.y - y
      rect.y = y
      break
    case 'right':
      rect.width = x - rect.x
      break
    case 'bottom':
      rect.height = y - rect.y
      break
    case 'left':
      rect.width += rect.x - x
      rect.x = x
      break
  }
}

const handleMouseUp = () => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}
</script>

<style scoped>
.rect-container {
  position: relative;
}

.rect {
  position: absolute;
  top: 0;
  left: 0;
  background-color: blue;
}

.handle {
  position: absolute;
  background-color: white;
  border: 1px solid black;
  width: 10px;
  height: 10px;
}

.top-handle {
  top: -5px;
  cursor: ns-resize;
}

.right-handle {
  right: -5px;
  cursor: ew-resize;
}

.bottom-handle {
  bottom: -5px;
  cursor:
    ns-resize;
}

.left-handle {
  left: -5px;
  cursor: ew-resize;
}
</style>