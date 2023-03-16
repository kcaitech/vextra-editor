<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Select from '@/components/common/Select.vue'

const { t } = useI18n();

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
      if (container.value) {
        container.value.focus();
      }
    })
  }
})

function popoverClose() {
  if (popoverVisible.value) return popoverVisible.value = false;
}

</script>

<template>
  <div class="container" ref="container" tabindex="-1">
    <svg-icon icon-class="gear" @click="showMenu"></svg-icon>
    <div class="popover" ref="popover" v-if="popoverVisible">
      <div class="header">
        <span class="title">{{ t('attr.advanced_stroke') }}</span>
        <div class="close" @click="popoverClose">
          X
        </div>
      </div>
      <div class="body">
        <div class="tr">
          <label>{{ t('attr.position') }}</label>
          <div class="item">
            <Select></Select>
          </div>
        </div>
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
    > .body {
      font-size: 10px;
      > .tr {
        width: 100%;
        height: 36px;
        padding: 4px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        > label {
          display: block;
          width: 32px;
          flex: 0 0 64px;
          font-weight: 700;
        }
        > .item {
          flex: 1 1 auto;
        }
      }
      
    }
  }
}
</style>