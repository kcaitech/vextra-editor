<script setup lang="ts">
import { ref, nextTick, watch, defineProps,defineEmits } from 'vue';
import ToolButton from '../ToolButton.vue';
import { Action } from '@/context/workspace';

type Button = InstanceType<typeof ToolButton>

const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const button = ref<Button>();
const props = defineProps<{
  active: boolean
}>();
const emit = defineEmits<{
    (e: "select", action: Action): void;
}>();
function select(action: Action) {    
    emit('select', action);
}

function showMenu() {
  if (popoverVisible.value) return popoverVisible.value = false;
  if (button.value?.toolButtonEl) {
    const el = button.value?.toolButtonEl;
    
    popoverVisible.value = true;
    nextTick(() => {
      if (popover.value) {      
        popover.value.style.left = el.offsetLeft + 'px';
        popover.value.style.top = el.offsetHeight + 2 + 'px';
      } 
    })
  }
}

watch(popoverVisible, (val) => {
  if (val) {
    nextTick(() => {
      if (popover.value) {
        popover.value.addEventListener('blur', onMenuBlur);
        popover.value.focus();
      }
    })
  }
})

function onMenuBlur() {
  // if (popover.value) {
  //   popover.value.removeEventListener('blur', onMenuBlur);
  // }
  // var timer = setTimeout(() => {
  //   popoverVisible.value = false;
  //   clearTimeout(timer)
  // }, 100)
}
</script>

<template>
  <div ref="popover" class="popover" tabindex="-1" v-if="popoverVisible">
    <div class="">V</div>
  </div>
  <ToolButton ref="button" @click="() => {select(Action.Auto)}" :selected="props.active">
    <div class="svg-container" title="Cursor">
      <svg-icon icon-class="cursor"></svg-icon>
    </div>
    <div class="menu" @click="showMenu">
      <svg-icon icon-class="down"></svg-icon>
    </div>
  </ToolButton>
</template>

<style scoped lang="scss">
.svg-container {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  > svg {
    width: 70%;
    height: 70%;
  }
}
.menu {
  width: 10px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  transition: 0.3s;
  > svg {
    width: 100%;
    height: 80%;
  }
}
.menu:hover {
  transform: translateY(4px);
}
.popover {
  position: absolute;
  z-index: 999;
  width: 200px;
  height: 260px;
  background-color: var(--theme-color);
  border-radius: 4px;
  outline: none;
}
</style>