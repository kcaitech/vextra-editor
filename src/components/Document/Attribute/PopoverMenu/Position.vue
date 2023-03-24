<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
type Side = 'top' | 'right' | 'bottom' | 'left';
const { t } = useI18n();

const popover = ref();

const constraintLeft = ref<boolean>(false);
const constraintTop = ref<boolean>(false);
const constraintRight = ref<boolean>(false);
const constraintBottom = ref<boolean>(false);

const widthSelected = ref<SelectItem>();
const widthOptions: SelectSource[] = genOptions([
  ['left', '靠左固定'],
  ['right', '靠左固定'],
  ['lr', '左右固定'],
  ['centerh', '居中'],
  ['widthWithContainer', '跟随缩放']
]);

const heightSelected = ref<SelectItem>();
const heightOptions: SelectSource[] = genOptions([
  ['top', '顶部固定'],
  ['bottom', '底部固定'],
  ['tb', '上下固定'],
  ['centerv', '居中'],
  ['heightWithContainer', '跟随缩放']
])


function genOptions(items: string[][]) {
  return items.map((item: string[], index: number) => {
    return {
      id: index,
      data: {
        value: item[0],
        content: item[1]
      }
    }
  })
}
function showMenu() {
  popover.value?.show()
}
function setConstrainTop(side: Side) {
  switch (side) {
    case 'top':
      constraintTop.value  = !constraintTop.value;
      break;
    case 'right':
      constraintRight.value  = !constraintRight.value;
      break;
    case 'bottom':
      constraintBottom.value  = !constraintBottom.value;
      break;
    case 'left':
      constraintLeft.value  = !constraintLeft.value;
      break;
    default:
      break;
  }
}

</script>

<template>
  <div class="position-container">
    <Popover ref="popover" :left="-636" :height="160" :title="t('attr.constraints')">
      <template #trigger>
        <svg-icon icon-class="gear" @click="showMenu" class="trigger"></svg-icon>
      </template>
      <template #body>
        <div class="position">
          <div class="options">
            <div>
              <label>{{t('attr.horizontal')}}</label>
              <Select :item-height="32" :width="136" :source="widthOptions"></Select>
            </div>
            <div>
              <label>{{t('attr.vertical')}}</label>
              <Select :item-height="32" :width="136" :source="heightOptions"></Select>
            </div>
          </div>
          <div class="control">
            <div class="top" :class="{active: constraintTop}" @click="setConstrainTop('top')">
              <svg-icon icon-class="side-button"></svg-icon>
            </div>
            <div class="right" :class="{active: constraintRight}" @click="setConstrainTop('right')">
              <svg-icon icon-class="side-button"></svg-icon>
            </div>
            <div class="bottom" :class="{active: constraintBottom}" @click="setConstrainTop('bottom')">
              <svg-icon icon-class="side-button"></svg-icon>
            </div>
            <div class="left" :class="{active: constraintLeft}" @click="setConstrainTop('left')">
              <svg-icon icon-class="side-button"></svg-icon>
            </div>
            <div class="height" :style="{
              backgroundColor: (constraintTop && constraintBottom) ? '#0929fa' : '#B6B6B6',
            }"/>
            <div class="width" :style="{
              backgroundColor: (constraintLeft && constraintRight) ? '#0929fa' : '#B6B6B6',
            }"/>
            <div class="dot" :style="{
              backgroundColor: ((constraintTop && constraintBottom) || (constraintLeft && constraintRight)) ? '#0929fa' : '#B6B6B6'
            }"></div>
          </div>
        </div>
      </template>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
.position-container {
  text-align: center;
  .trigger {
    width: 40%;
    height: 40%;
    transition: 0.5s;
  }
  .trigger:hover {
    transform: rotate(90deg);
  }
  .position {
    height: 100%;
    display: flex;
    padding: var(--default-padding);
    box-sizing: border-box;
    .options {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      > div {
        display: flex;
        align-items: center;
        > label {
          flex: 0 0 80px;
          text-align: left;
          font-weight: var(--font-default-bold);
        }
      }
    }
    .control {
      flex: 0 0 96px;
      box-sizing: border-box;
      border: 2px solid var(--grey-dark);
      height: 100%;
      border-radius: var(--default-radius);
      background-color: var(--input-background);
      margin: 0 auto;
      position: relative;
      > div {
        position: absolute;
        height: 32px;
        width: 32px;
        > svg {
          height: 80%;
          width: 80%;
          margin-top: 12px;
        }
      }
      > .active {
        color: var(--active-color);
      }
      > .top {
        transform: rotate(180deg) translateX(50%);
        left: 50%;
      }
      > .right {
        transform: rotate(270deg) translateX(50%);
        right: 0;
        top: 50%;
      }
      > .bottom {
        transform: rotate(0deg) translateX(-50%);
        left: 50%;
        bottom: 0;
      }
      > .left {
        transform: rotate(90deg) translateX(-50%);
        left: 0;
        top: 50%;
      }
      .height {
        width: 3px;
        height: 20px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
      .width {
        width: 20px;
        height: 3px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
      .dot {
        width: 3px;
        height: 3px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
}
</style>