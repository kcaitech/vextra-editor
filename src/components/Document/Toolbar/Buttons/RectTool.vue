/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import ToolButton from '../ToolButton.vue';
import {} from 'vue';
import { Action } from "@/context/tool";
import { useI18n } from 'vue-i18n'
import Tooltip from '@/components/common/Tooltip.vue';
import SvgIcon from '@/components/common/SvgIcon.vue';
const { t } = useI18n()
const props = defineProps<{
    active: boolean,
}>();
const emit = defineEmits<{
    (e: "select", action: string): void;
}>();
function select(action: string) {    
    emit('select', action);
}
import pattern_rectangle_icon from '@/assets/icons/svg/pattern-rectangle.svg';
</script>
<template>
  <Tooltip :content="`${t('home.rect')} &nbsp;&nbsp; R`">
    <ToolButton ref="button" @click="() => {select(Action.AddRect)}" :selected="props.active">
      <div class="svg-container">
        <SvgIcon :icon="pattern_rectangle_icon"/>
      </div>
    </ToolButton>
  </Tooltip>
</template>
<style scoped lang="scss">
.svg-container {
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  > img {
    width: 18px;
    height: 18px;
  }
}
</style>