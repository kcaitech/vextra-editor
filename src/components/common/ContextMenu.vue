<script setup lang="ts">
import { Context } from '@/context';
import { Menu } from '@/context/menu';
import { onMounted, onUnmounted, ref } from 'vue';

interface Props {
  x: number
  y: number
  context: Context
  width?: number
  site?: { x: number, y: number }
}
interface Emits {
  (e: 'close'): void
}
const surplusX = ref<number>(0);
const menu = ref<HTMLDivElement>();
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const weak_focus = ref<boolean>(false);

defineExpose({ menu });

function handleClickOutside(event: MouseEvent) {
  event.stopPropagation()
  if (event.target instanceof Element && !event.target.closest('.__context-menu')) {
    props.context.menu.menuMount();
  }
}
function menu_watcher(type: number) {
  if (type === Menu.SHUTDOWN_MENU) {
    emit('close');
  } else if (type === Menu.SHOW_PLACEMENT) {
    weak_focus.value = true;
  } else if (type === Menu.HIDE_PLACEMENT) {
    weak_focus.value = false;
  }
}
//二级菜单距离右侧的距离
if (props.site) {
  surplusX.value = document.documentElement.clientWidth - props.site.x
}

onMounted(() => {
  props.context.menu.watch(menu_watcher)
  document.addEventListener('mousedown', handleClickOutside);
})
onUnmounted(() => {
  props.context.menu.unwatch(menu_watcher);
  document.removeEventListener('mousedown', handleClickOutside);
})
</script>
<template>
  <div ref="menu" class="__context-menu" @mousemove.stop
    :style="{ top: `${props.y}px`, left: `${props.width && surplusX < 198 + props.width ? -props.width : props.x}px`, width: `${props.width || 198}px` }">
    <div class="header"></div>
    <slot></slot>
    <div class="bottom"></div>
  </div>
</template>
<style scoped lang="scss">
.__context-menu {
  position: absolute;
  z-index: 99;
  color: var(--theme-color-anti);
  width: 240px;
  display: flex;
  flex-direction: column;
  border-radius: 2px;
  box-shadow: 4px 4px 10px rgba($color: #000000, $alpha: 0.2);
  background-color: rgba($color: #000000, $alpha: 0.82);

  >.header {
    width: 100%;
    height: 4px;
  }

  >.bottom {
    width: 100%;
    height: 4px;
    align-self: flex-end;
  }
}
</style>
