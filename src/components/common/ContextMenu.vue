<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, defineEmits, ref, defineExpose } from 'vue';

interface Props {
  x: number
  y: number
  width?: number,
  site?:{ x: number, y: number }
}
const surplusX = ref<number>(0)
const menu = ref<HTMLDivElement>()
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();

defineExpose({
  menu
})

function handleClickOutside(event: MouseEvent) {
  event.target instanceof Element && !event.target.closest('.__context-menu') && emit('close');
}

 //二级菜单距离右侧的距离
 if(props.site)
  surplusX.value = document.documentElement.clientWidth - props.site.x
 
onMounted(() => {
  document.addEventListener('click', handleClickOutside);  
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
})
</script>
<template>
  <div ref="menu" class="__context-menu" :style="{ top: `${y}px`, left: `${props.width && surplusX < 240 + props.width ? -props.width : x}px`, width: `${width || 180}px` }">
    <div class="header"></div>
    <slot></slot>
    <div class="bottom"></div>
  </div>
</template>
<style scoped lang="scss">
.__context-menu {
  position: absolute;
  z-index: 9;
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
