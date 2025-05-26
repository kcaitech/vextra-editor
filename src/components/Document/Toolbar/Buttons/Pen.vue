/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import ToolButton from '../ToolButton.vue';

type Button = InstanceType<typeof ToolButton>

const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const button = ref<Button>();

function showMenu(e: MouseEvent) {
  if (popoverVisible.value) return popoverVisible.value = false;
  if (button.value?.toolButtonEl) {
    let el = button.value?.toolButtonEl;
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
  if (popover.value) {
    popover.value.removeEventListener('blur', onMenuBlur);
  }
  var timer = setTimeout(() => {
    popoverVisible.value = false;
    clearTimeout(timer)
  }, 100)
}
import SvgIcon from '@/components/common/SvgIcon.vue';
import pen_icon from '@/assets/icons/svg/pen.svg';
import white_down_icon from '@/assets/icons/svg/white-down.svg';

</script>

<template>
  <div ref="popover" class="popover" tabindex="-1" v-if="popoverVisible"></div>
  <ToolButton ref="button">
    <div class="svg-container" title="Pen">
      <SvgIcon :icon="pen_icon"/>
    </div>
    <div class="menu" @click="showMenu">
      <SvgIcon :icon="white_down_icon"/>
    </div>
  </ToolButton>
</template>

<style scoped lang="scss">
.svg-container {
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  > img {
    width: 18px;
    height: 18px;
  }
}
.menu {
  width: 20px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  transition: 0.3s;
  > svg {
    width: 12px;
    height: 12px;
  }
}
.menu:hover {
  transform: translateY(4px);
}
.popover {
  position: absolute;
  z-index: 999;
  width: 200px;
  height: 240px;
  background-color: var(--theme-color);
  border-radius: 4px;
  outline: none;
}
// @keyframes bounce {
//   0% {
//     transform: translateY(0);
//   }
//   50% {
//     transform: translateY(6px);
//   }
//   100% {
//     transform: translateY(0);
//   }
// }
// .button:hover {
//   .menu > svg {
//     animation-duration: .5s;
//     animation-name: bounce;
//   }
// }
</style>