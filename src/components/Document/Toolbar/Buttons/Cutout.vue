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
import ToolButton from './ToolButton.vue';
import { useI18n } from 'vue-i18n'
import Tooltip from '@/components/common/Tooltip.vue';
import { Context } from '@/context';
import { useCutout } from "@/components/Document/Creator/execute";
import SvgIcon from '@/components/common/SvgIcon.vue';
const { t } = useI18n()
defineProps<{
  context: Context,
  params: {
    active: boolean,
  }
}>();
import cutout_icon from '@/assets/icons/svg/cutout.svg';
</script>
<template>
  <Tooltip :content="`${t('cutoutExport.cutout')} &nbsp;&nbsp; S`">
      <ToolButton ref="button" @click="() => {useCutout(context)}" :selected="params.active" style="width: 32px">
      <div class="svg-container">
          <SvgIcon :icon="cutout_icon"/>
      </div>
    </ToolButton>
  </Tooltip>
</template>
<style scoped lang="scss">
.svg-container {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
    padding: 6px 6px 6px 6px;
    box-sizing: border-box;

  >img {
      width: 18px;
      height: 18px;
  }
}
</style>