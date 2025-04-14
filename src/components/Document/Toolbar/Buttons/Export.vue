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
import { Context } from "@/context";
import { useI18n } from "vue-i18n";
import Tooltip from '@/components/common/Tooltip.vue';
import { Action } from '@/context/tool';
import SvgIcon from '@/components/common/SvgIcon.vue';
import dialog_icon from '@/assets/icons/svg/dialog.svg';

const { t } = useI18n();

const props = defineProps<{
    context: Context,
    params: {
        active: boolean
    }
}>();

const exportClick = () => {
    props.context.menu.setExportDialog(true);
    props.context.tool.setAction(Action.Export);
}
</script>

<template>
    <Tooltip :content="`${t('cutoutExport.export_cutout')}`">
        <ToolButton ref="button" @click.stop="exportClick" style="width: 32px" :selected="params.active">
            <div class="svg-container" id="export_dialog">
                <SvgIcon :icon="dialog_icon"/>
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