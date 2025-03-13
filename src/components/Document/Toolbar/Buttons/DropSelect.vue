/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import {} from 'vue';
import { useI18n } from 'vue-i18n'
import { BoolOp } from '@kcdesign/data';
import { Action } from "@/context/tool";
const { t } = useI18n()
const props = defineProps<{
    lg: string,
    quick?: string,
    select?: any,
    d?: any,
    type: string,
    bool?: BoolOp,
    state?: boolean
}>();
const emit = defineEmits<{
    (e: "selector", select: string): void;
    (e: "selectBool", select: string, bool: BoolOp): void;
}>();
const selector = (active: string) => {
    emit('selector', active);
}
const handleBoolean = (e: MouseEvent) => {
  e.stopPropagation()
  emit('selectBool',props.select, props.bool!)
}
import SvgIcon from '@/components/common/SvgIcon.vue';
import white_select_icon from '@/assets/icons/svg/white-select.svg';

import union_icon from '@/assets/icons/svg/union.svg'
import subtract_icon from '@/assets/icons/svg/subtract.svg'
import intersection_icon from '@/assets/icons/svg/intersection.svg'
import difference_icon from '@/assets/icons/svg/difference.svg'

function boolIcon() {
    switch (props.select) {
        case 'union':
            return union_icon
        case 'subtract':
            return subtract_icon
        case 'intersection':
            return intersection_icon
        case 'difference':
            return difference_icon
        default:
            return union_icon
    }
}
</script>
<template>
  <!-- cursor -->
  <div class="container-change" @click="selector(props.select!)" v-if="props.type === 'cursor'">
      <div style="display: flex; align-items: center;">
<!--        <div class="choose" :style="{ visibility: props.select === props.d ? 'visible' : 'hidden'  }"></div>-->
          <div class="choose">
              <SvgIcon :icon="white_select_icon" :style="{ visibility: props.select === props.d ? 'visible' : 'hidden' }"/>
          </div>
        <div class="svg-container">
          <SvgIcon :icon="boolIcon()"/>
        </div>
        <div class="select">{{ t(`home.${props.lg}`) }}</div>
      </div>
      <span class="quick">{{ props.quick }}</span>
    </div>
    <!-- 布尔对象下拉菜单 -->
    <div class="container-change" v-if="props.type === 'bool'" @mousedown="handleBoolean">
      <div style="display: flex; align-items: center;">
<!--        <div class="choose" :style="{ visibility: props.select === props.d && !state ? 'visible' : 'hidden'  }"></div>-->
          <div class="choose">
              <SvgIcon :icon="white_select_icon" :style="{ visibility: props.select === props.d && !state ? 'visible' : 'hidden' }"/>
          </div>
        <div class="svg-container">
          <SvgIcon :icon="boolIcon()"/>
        </div>
        <div class="select">{{ t(`bool.${props.lg}`) }}</div>
      </div>
    </div>
</template>
<style scoped lang="scss">
.container-change:hover {
  background-color: var(--active-color);
}
//.choose {
//  box-sizing: border-box;
//  width: 12px;
//  height: 8px;
//  border-width: 0 0 2px 2px;
//  border-style: solid;
//  border-color: var(--theme-color-anti);
//  transform: rotate(-45deg) translateY(-30%);
//}
.select {
  font-size: var(--font-default-fontsize);
    font-family: HarmonyOS Sans;
    z-index: 2;
}
.container-change {
  display: flex;
  color: var(--theme-color-anti);
  width: 100%;
  height: 32px;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px 9px 8px;
  box-sizing: border-box;

    .choose {
        width: 12px;
        height: 12px;
        display: contents;

        svg {
            width: 12px;
            height: 12px;
        }
    }

  .svg-container {
        width: 16px;
        height: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 8px;
        margin-right: 8px;

        img {
      width: 100%;
      height: 100%;
    }
  }
}
.quick {
    width: 9px;
    height: 14px;
    font-family: HarmonyOS Sans;
    font-size: 12px;
    font-weight: 500;
    z-index: 1;
}
//.container-change>div {
//  margin-left: var(--default-margin);
//}
</style>