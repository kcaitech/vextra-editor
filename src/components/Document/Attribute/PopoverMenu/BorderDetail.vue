<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import "@/assets/icons/svg/gear.svg";
const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();

function showMenu() {
  if (popoverVisible.value) return popoverVisible.value = false;
  if (container.value) {
    const el = container.value;    
    popoverVisible.value = true;
    nextTick(() => {
      if (popover.value) {   
        let top = Math.min(document.documentElement.clientHeight - 70 - el.offsetTop - popover.value.offsetHeight, 0)
        popover.value.style.left = -(el.offsetLeft + popover.value.clientWidth + 4) + 'px';
        popover.value.style.top = top + 'px';
      } 
    })
  }
}

watch(popoverVisible, (val) => {
  if (val) {
    nextTick(() => {
      if (popover.value) {
        popover.value.focus();
      }
    })
  }
})

function popoverClose() {
  if (popoverVisible.value) return popoverVisible.value = false;
}

</script>

<template>
  <div class="container" ref="container">
    <svg-icon icon-class="gear" @click="showMenu"></svg-icon>
    <div class="popover" ref="popover" tabindex="-1" v-if="popoverVisible">
      <div class="close" @click="popoverClose">
        X
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  > svg {
    width: 40%;
    height: 40%;
    transition: 0.5s;
    margin-top: 3px;
  }
  > svg:hover {
    transform: rotate(90deg);
  }
  > .popover {
    position: absolute;
    width: 360px;
    height: 200px;
    background-color: #ffffff;
    outline: none;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
    > .close {
      width: 24px;
      height: 24px;
      text-align: center;
      line-height: 24px;
      position: absolute;
      right: 4px;
      top: 4px;
    }
  }
}
</style>