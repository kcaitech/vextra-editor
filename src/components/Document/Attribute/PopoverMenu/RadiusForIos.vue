/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { nextTick, ref, } from 'vue';
import Popover from '@/components/common/Popover.vue';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps<{
  context: Context
}>();
const popover = ref();
const progressBar = ref<HTMLDivElement>()
const progress = ref<HTMLDivElement>()
const progressBtn = ref<HTMLDivElement>()
let isDragging = false
const text = ref<number>(0)
function showMenu() {
  popover.value?.show();
}
const onMouseDown = (e: MouseEvent) => {
  isDragging = true
  updateProgress(e.clientX)
  nextTick(() => {
    if (progressBtn.value) {
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUP)
    }
  })
}
const onMouseMove = (e: MouseEvent) => {
  if (isDragging) {
    updateProgress(e.clientX);
  }
}
const onMouseUP = () => {
  isDragging = false;
  if (progressBtn.value) {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUP)
  }
}

function updateProgress(x: number) {
  if (progressBar.value) {
    const progressBarRect = progressBar.value.getBoundingClientRect();
    const progressWidth = Math.min(Math.max(x - progressBarRect.left, 0), progressBarRect.width);
    const progressPercentage = progressWidth / progressBarRect.width * 100;
    if (progress.value) {
      progress.value.style.width = progressPercentage + '%';
      progressBtn.value!.style.left = progressPercentage - 4 + '%';
      text.value = Number(progressPercentage.toFixed(0))
    }
  }
}
import gear_icon from '@/assets/icons/svg/gear.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
</script>

<template>
  <div class="radius-for-ios-container">
    <Popover :context="props.context" :left="450" :width="240" :height="100" ref="popover"
      :title="t('attr.corner_smoothing')" class="popover">
      <template #trigger>
        <div class="trigger" @click="showMenu">
          <SvgIcon :icon="gear_icon"/>
        </div>
      </template>
      <template #body>
        <div class="progress-body">
          <div ref="progressBar" class="progress-bar" @mousedown="onMouseDown">
            <div ref="progress" class="progress"></div>
            <div ref="progressBtn" class="progress-button" @mousedown="onMouseDown"></div>
            <div class="line"><span>iOS</span></div>
          </div>
          <div class="progress-text">
            <span>{{ text }}%</span>
          </div>
        </div>
      </template>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
.radius-for-ios-container {
  .popover {
    width: 22px;
    height: 22px;

    .trigger {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      svg {
        width: 50%;
        height: 50%;
        transition: 0.5s;
      }

      svg:hover {
        transform: rotate(90deg);
      }
    }
  }

  .progress-body {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .progress-bar {
      width: 150px;
      height: 6px;
      background-color: var(--grey-dark);
      border-radius: 3px;
      position: relative;

    }

    .progress {
      width: 0%;
      height: 100%;
      background-color: var(--active-color);
      border-radius: 5px;
    }

    .progress-button {
      position: absolute;
      left: 0%;
      top: -3px;
      width: 12px;
      height: 12px;
      border-radius: 6px;
      border: 2px solid var(--grey-light);
      background-color: #fff;
      box-sizing: border-box;
      cursor: pointer;
      z-index: 1;
    }

    .line {
      width: 1.5px;
      height: 15px;
      background-color: #d8d8d8;
      position: absolute;
      top: 0;
      left: 60%;

      span {
        color: var(--el-color-primary);
        position: absolute;
        top: 15px;
        left: -8px;
      }
    }

    .progress-text {
      font-size: var(var(--active-color));
      margin-left: 15px;
      width: 20px;
    }

  }

}
</style>