<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';


const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();

const { t } = useI18n();

function showMenu() {
  if (popoverVisible.value) return onBlur();
  if (container.value) {
    const el = container.value;    
    popoverVisible.value = true;
    nextTick(() => {
      if (popover.value) {              
        popover.value.style.left = -(el.offsetLeft + popover.value.clientWidth + 28) + 'px';
        popover.value.style.top = 0 + 'px';
      } 
    })
  }
}

function popoverClose() {
  popoverVisible.value = false;
  container.value?.removeEventListener('blur', onBlur);
}

function onBlur() {
  popoverVisible.value = false;
  container.value?.removeEventListener('blur', onBlur);
}

// hooks
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
</script>

<template>
  <div class="container" ref="container" tabindex="-1">
    <svg-icon icon-class="gear" @click="showMenu"></svg-icon>
    <div class="popover" ref="popover" v-if="popoverVisible">
      <div class="header">
        <span class="title">{{ t('attr.constraints') }}</span>
        <div class="close" @click="popoverClose">X</div>
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
  font-size: 10px;
  > svg {
    width: 40%;
    height: 40%;
    transition: 0.5s;
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
    > .header {
      width: 100%;
      height: 32px;
      border-bottom: 1px solid var(--coco-grey);
      display: flex;
      > .title {
        line-height: 32px;
        font-weight: var(--default-bold);
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
        color: grey;
      }
    }
    
  }
}
</style>