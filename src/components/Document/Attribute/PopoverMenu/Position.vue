<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElSelect, ElOption } from 'element-plus';
type Side = 'top' | 'right' | 'bottom' | 'left';
const { t } = useI18n();

const popover = ref();

const constraintLeft = ref<boolean>(false);
const constraintTop = ref<boolean>(false);
const constraintRight = ref<boolean>(false);
const constraintBottom = ref<boolean>(false);
const width = ref<string>();
const height = ref<string>();
const ResizingConstraints = {
  Unset: 0b111111,
  Right: 0b000001,
  Width: 0b000010,
  Left: 0b000100,
  Bottom: 0b001000,
  Height: 0b010000,
  Top: 0b100000,
}
const widthOptions = [
  {
    value: 'left',
    label: '靠左固定'
  }, {
    value: 'right',
    label: '靠右固定'
  }, {
    value: 'widthWithContainer',
    label: '跟随容器缩放'
  }
]
const heightOptions = [
  {
    value: 'top',
    label: '顶部固定'
  }, {
    value: 'bottom',
    label: '底部固定'
  }, {
    value: 'heightWithContainer',
    label: '跟随容器缩放'
  }
]


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
function select(value: string) {  
  switch (value) {
    case 'top':
      constraintTop.value  = true;
      constraintBottom.value  = false;
      break;
    case 'right':
      constraintRight.value  = true;
      constraintLeft.value = false;
      break;
    case 'bottom':
      constraintBottom.value  = true;
      constraintTop.value  = false;
      break;
    case 'left':
      constraintLeft.value  = true;
      constraintRight.value  = false;
      break;
    case 'widthWithContainer':
      constraintLeft.value  = true;
      constraintRight.value  = true;
      break;
    case 'heightWithContainer':
      constraintBottom.value  = true;
      constraintTop.value  = true;
      break;
    default:
      break;
  }
}
</script>

<template>
  <div class="position-container">
    <Popover ref="popover" :left="-636" :height="124" :title="t('attr.constraints')">
      <template #trigger>
        <svg-icon icon-class="gear" @click="showMenu" class="trigger"></svg-icon>
      </template>
      <template #body>
        <div class="position">
          <div class="options">
            <div>
              <label>{{t('attr.horizontal')}}</label>
              <el-select
                size="large"
                v-model="width"
                @change="select"
                :placeholder="t('system.space')"
              >
                <el-option
                  v-for="(item, index) in widthOptions"
                  :label="item.label"
                  :value="item.value"
                  :key="index"
                />
              </el-select>
            </div>
            <div class="mt-16">
              <label>{{t('attr.vertical')}}</label>
              <el-select
                size="large"
                v-model="height"
                @change="select"
                :placeholder="t('system.space')"
              >
                <el-option v-for="(item, index) in heightOptions" :label="item.label" :value="item.value" :key="index"/>
              </el-select>
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
    margin-top: 10px;
  }
  .trigger:hover {
    transform: rotate(90deg);
  }
  .position {
    display: flex;
    padding: var(--default-padding-quarter);
    .options {
      flex: 0 0 240px;
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
      flex: 0 0 auto;
      border-radius: var(--default-radius);
      height: 80px;
      width: 80px;
      background-color: var(--input-background);
      margin: 0 auto;
      position: relative;
      > div {
        position: absolute;
        height: 32px;
        width: 32px;
        > svg {
          height: 100%;
          width: 100%;
          margin-top: 6px;
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