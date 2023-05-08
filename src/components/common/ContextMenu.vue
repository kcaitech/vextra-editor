<script setup lang="ts">
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { defineProps, onMounted, onUnmounted, defineEmits, ref, defineExpose } from 'vue';

interface Props {
  x: number
  y: number
  width?: number,
  site?: { x: number, y: number },
  context: Context;
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
function workspaceUpdate(t?: number) {  
  if (t === WorkSpace.SHUTDOWN_MENU) {
    emit('close');
  }
}
//二级菜单距离右侧的距离
if (props.site)
  surplusX.value = document.documentElement.clientWidth - props.site.x

onMounted(() => {
  props.context.workspace.menuMount(true);
  props.context.workspace.watch(workspaceUpdate);
  document.addEventListener('mousedown', handleClickOutside);
})
onUnmounted(() => {
  props.context.workspace.unwatch(workspaceUpdate);
  document.removeEventListener('mousedown', handleClickOutside);
})
</script>
<template>
  <div ref="menu" class="__context-menu Menu"
    :style="{ top: `${props.y}px`, left: `${props.width && surplusX < 216 + props.width ? -props.width : props.x}px`, width: `${props.width || 216}px` }">
    <div class="header"></div>
    <slot></slot>
    <div class="bottom"></div>
  </div>
</template>
<style scoped lang="scss">
.__context-menu {
  position: absolute;
  z-index: 99;
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
