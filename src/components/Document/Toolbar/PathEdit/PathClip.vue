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
import ToolButton from '../Buttons/ToolButton.vue';
import { useI18n } from 'vue-i18n'
import Tooltip from '@/components/common/Tooltip.vue';
import SvgIcon from '@/components/common/SvgIcon.vue';
import clip_tool_icon from '@/assets/icons/svg/clip-tool.svg';

const { t } = useI18n()
const props = defineProps<{
    active: boolean
}>();
const emit = defineEmits<{
    (e: "click"): void;
}>();
</script>
<template>
    <Tooltip :content="t('shape.clip')">
        <ToolButton ref="button" :selected="props.active" :width="32" :height="32">
            <div class="svg-container" @click="emit('click')">
                <SvgIcon :icon="clip_tool_icon"/>
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

    > img {
        width: 18px;
        height: 18px;
    }
}
</style>