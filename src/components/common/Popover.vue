<script setup lang="ts">
import { ref, nextTick, defineProps, defineExpose } from 'vue';

const props = defineProps<{
  title?: string,
  top?: number,
  left?: number,
  width?: number,
  height?: string | number,
}>();
defineExpose({
  show,
  focus
})

const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();

function focus() {  
  container.value?.focus();
}
function show() {
  if (popoverVisible.value) return popoverClose();
  if (container.value) {
    popoverVisible.value = true;
    container.value.focus();
    container.value.addEventListener('keyup', esc);
    document.addEventListener('click', handleClickOutside);
    nextTick(() => { // popver 挂载之后计算其布局位置
      if (popover.value) {
        const buffer = 10;
        const { top, left, width, height } = popover.value.getBoundingClientRect();
        const propsLeft = (props.left || 0);
        const propsTop = (props.top || 0);

        const L = Math.min(document.documentElement.clientWidth - buffer - (left + width), 0);
        const T = Math.min(document.documentElement.clientHeight - buffer - (top + height), 0);

        popover.value.style.left = Math.min(propsLeft, L) + 'px';
        popover.value.style.top = Math.min(propsTop, T) + 'px';
      }
    })
  }
}
function handleClickOutside(event: MouseEvent) {
  event.target instanceof Element && !event.target.closest('.__popover-container') && popoverClose();
}
function esc(e: KeyboardEvent) {
  if (e.code === 'Escape') popoverClose();
}
function popoverClose() {
  popoverVisible.value = false;
  container.value?.removeEventListener('keyup', esc);
  document.removeEventListener('click', handleClickOutside);
}
</script>

<template>
  <div class="__popover-container" ref="container" tabindex="-1">
    <slot name="trigger"></slot>
    <div :style="{
      width: `${props.width ? props.width : 360}px`,
      height: `${props.height ? props.height : 200}px`,
    }" class="popover" ref="popover" v-if="popoverVisible">
      <div class="header">
        <span class="title">{{ props.title }}</span>
        <div class="close" @click="popoverClose">
          X
        </div>
      </div>
      <div class="body">
        <slot name="body"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.__popover-container {
  position: relative;
  outline: none;

  >.popover {
    position: absolute;
    outline: none;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
    background-color: #ffffff;
    z-index: 1;

    >.header {
      width: 100%;
      height: 32px;
      border-bottom: 1px solid var(--grey-light);
      display: flex;
      font-size: var(--font-default-fontsize);
      padding: 0 var(--default-padding);
      box-sizing: border-box;

      >.title {
        line-height: 32px;
        font-weight: var(--font-default-bold);
      }

      >.close {
        width: 24px;
        height: 24px;
        text-align: center;
        line-height: 24px;
        position: absolute;
        right: var(--default-padding);
        top: 4px;
        text-align: right;
      }
    }

    >.body {
      width: 100%;
      height: calc(100% - 32px);
      font-size: 10px;
      position: relative;
    }
  }
}
</style>