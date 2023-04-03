<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, defineEmits } from 'vue';

interface Props {
  x: number
  y: number
  width?: number
}

defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();

function handleClickOutside(event: MouseEvent) {
  event.target instanceof Element && !event.target.closest('.__context-menu') && emit('close');
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
})
</script>
<template>
  <div class="__context-menu" :style="{ top: `${y}px`, left: `${x}px`, width: `${width || 240}px` }">
    <div class="header"></div>
    <slot></slot>
    <div class="bottom"></div>
  </div>
</template>
<style scoped lang="scss">
.__context-menu {
  position: absolute;
  z-index: 1;
  background-color: var(--theme-color);
  color: var(--theme-color-anti);
  width: 240px;
  display: flex;
  flex-direction: column;
  border-radius: 2px;

  >.header {
    width: 100%;
    height: 10px;
  }

  >.bottom {
    width: 100%;
    height: 10px;
    align-self: flex-end;
  }
}
</style>
