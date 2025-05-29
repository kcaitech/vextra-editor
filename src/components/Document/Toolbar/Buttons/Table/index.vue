/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import ToolButton from '../ToolButton.vue';
import { ref, nextTick } from 'vue';
import { Action } from "@/context/tool";
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import CreateTable from './CreateTable.vue';
const { t } = useI18n()
interface Props {
  context: Context,
  params: {
    active: boolean,
    select: (action: string) => void
  }
}
type Button = InstanceType<typeof ToolButton>;
const props = defineProps<Props>();
const button = ref<Button>();
const visible = ref(false);
const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
// const emit = defineEmits<{
//   (e: "select", action: string): void;
// }>();
function select(action: string) {
  // emit('select', action);
  props.params.select(action)
}

function showTable(e: MouseEvent) {
  if (button.value?.toolButtonEl) {
    select(Action.AddTable);
    const el = button.value?.toolButtonEl;
    visible.value = false;
    popoverVisible.value = true;
    nextTick(() => {
      if (popover.value) {
        popover.value.style.left = el.offsetLeft + 'px';
        popover.value.style.top = el.offsetHeight + 9 + 'px';

      }
    })
    document.addEventListener('click', onTableBlur);
  }
}

function onTableBlur(e: MouseEvent) {
  if (e.target instanceof Element && !e.target.closest('.popover-t') && !e.target.closest('.svg-table')) {
    if (e.target.closest('.popover-t')) return;
    if (e.target instanceof Element && (!e.target.closest('.tool-button') || e.target.closest('.group'))) {
      select(Action.AutoV);
    }
    var timer = setTimeout(() => {
      popoverVisible.value = false;
      clearTimeout(timer);
      document.removeEventListener('click', onTableBlur);
    }, 10)
  }
}

const closeInsert = () => {
  popoverVisible.value = false
}

var timer: any = null;
const onMouseenter = () => {
  timer = setTimeout(() => {
    visible.value = true;
    clearTimeout(timer);
  }, 600);
}
const onMouseleave = () => {
  clearTimeout(timer);
  visible.value = false;
}

import SvgIcon from '@/components/common/SvgIcon.vue';
import pattern_table_icon from '@/assets/icons/svg/pattern-table.svg';
</script>

<template>
  <div ref="popover" class="popover-t" tabindex="-1" v-if="popoverVisible">
    <!-- <div ref="popover" class="popover" tabindex="-1"> -->
    <CreateTable :context="context" @close="closeInsert"></CreateTable>
  </div>
  <el-tooltip class="box-item" effect="dark" :content="`${t('table.table')}`" placement="bottom" :show-after="600"
    :offset="10" :hide-after="0" :visible="popoverVisible ? false : visible">
    <ToolButton ref="button" :selected="props.params.active" @mouseenter.stop="onMouseenter" @mouseleave.stop="onMouseleave"
      style="width: 32px">
      <div class="svg-table" @click="showTable">
        <SvgIcon :icon="pattern_table_icon"/>
      </div>
    </ToolButton>
  </el-tooltip>
</template>

<style lang="scss" scoped>
.svg-table {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  padding: 6px 6px 6px 6px;
  box-sizing: border-box;

  >svg {
    width: 18px;
    height: 18px;
  }
}

.popover-t {
  position: absolute;
}
</style>