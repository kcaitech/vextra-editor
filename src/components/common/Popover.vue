<script setup lang="ts">
import { ref, nextTick, watch, defineProps, defineExpose } from 'vue';

const props = defineProps<{
  title?: string,
  top?: number,
  left?: number,
  width?: number,
  height?: number
}>();
defineExpose({
  show
})

const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();

function show() {
  if (popoverVisible.value) return popoverVisible.value = false;
  if (container.value) {
    popoverVisible.value = true;
    nextTick(() => {
      if (popover.value) {        
        const { top, left, width, height } = popover.value.getBoundingClientRect();
        let t = Math.min(document.documentElement.clientHeight - top - height - 10, 0);
        let l = Math.min(document.documentElement.clientWidth - left - width - 10, 0);
        props.top && (t = t + props.top);
        props.left && (l = l + props.left);
        popover.value.style.left = l + 'px';
        popover.value.style.top = t + 'px';
      } 
    })
  }
}
function onBlur() {
  popoverVisible.value = false;
  container.value?.removeEventListener('blur', onBlur);  
}

watch(popoverVisible, (val) => {
  if (val) {
    nextTick(() => {
      if (container.value) {
        container.value.focus();
        container.value.addEventListener('blur', onBlur);
      }
    })
  }
})

function popoverClose() {
  if (popoverVisible.value) return popoverVisible.value = false;
  container.value?.removeEventListener('blur', onBlur);
}

</script>

<template>
  <div class="__popover-container" ref="container" tabindex="-1">
    <slot name="trigger"></slot>
    <div
      :style="{
        width: `${props.width ? props.width : 360}px`,
        height: `${props.height ? props.height : 200}px`,
      }"
      class="popover"
      ref="popover"
      v-if="popoverVisible"
    >
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

<style lang="scss">
.__popover-container {
  position: relative;
  width: 32px;
  height: 32px;
  > .popover {
    position: absolute;
    background-color: #ffffff;
    outline: none;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1;
    > .header {
        width: 100%;
        height: 32px;
        border-bottom: 1px solid var(--grey-light);
        display: flex;
        font-size: var(--font-default-fontsize);
        > .title {
          line-height: 32px;
          font-weight: var(--font-default-bold);
          margin-left: 4px;
        }
        > .close {
          width: 24px;
          height: 24px;
          text-align: center;
          line-height: 24px;
          position: absolute;
          right: 4px;
          top: 4px;
          color: var(--grey-dark);
        }
    }
    > .body {
      font-size: 10px;
      position: relative;
    }
  }
}
</style>