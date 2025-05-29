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
import ToolButton from './ToolButton.vue';
import { Action, Tool } from "@/context/tool";
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import Tooltip from '@/components/common/Tooltip.vue';
import { string_by_sys } from "@/utils/common";
import SvgIcon from '@/components/common/SvgIcon.vue';
const { t } = useI18n()
interface Props {
    context: Context,
    params: any,
}
const props = defineProps<Props>();

function select() {
    props.context.tool.notify(Tool.COMPONENT);
}

import resource_icon from '@/assets/icons/svg/resource.svg';
</script>

<template>
    <Tooltip :content="string_by_sys(`${t('navi.comps')} &nbsp;&nbsp; Shift I`)">
        <ToolButton ref="button" @click="select">
            <div class="svg-component">
                <SvgIcon :icon="resource_icon"/>
            </div>
        </ToolButton>
    </Tooltip>
</template>

<style lang="scss" scoped>
.svg-component {
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ffffff;

    >svg {
        width: 18px;
        height: 18px;
    }
}

.popover {
    position: absolute;
}
</style>