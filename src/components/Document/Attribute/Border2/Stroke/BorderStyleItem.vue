/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { SelectItem } from '@/components/common/Select.vue'
import SvgIcon from '@/components/common/SvgIcon.vue';
import { ref } from 'vue';
interface Props {
    data: SelectItem;
    isCurValue: boolean;
}
interface Emits {
    (e: "select", data: SelectItem): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const isHoverCurValue = ref(false);

function select() {
    emits('select', props.data);
}

import white_select_icon from '@/assets/icons/svg/white-select.svg';
import page_select_icon from '@/assets/icons/svg/page-select.svg';

import solid_icon from '@/assets/icons/svg/solid.svg';
import dash_icon from '@/assets/icons/svg/dash.svg';
const border_style_icons:{[key: string]: string} = {
    'solid': solid_icon,
    'dash': dash_icon
}

</script>

<template>
    <div class="border-style-item-container" @click="select" @mouseenter="isHoverCurValue = true"
        @mouseleave="isHoverCurValue = false">
        <div class="content">
            <SvgIcon :icon="border_style_icons[props.data.value]"/>
            <span>{{ props.data.content }}</span>
        </div>
        <SvgIcon class="check" v-show="props.isCurValue"
            :icon="isHoverCurValue ? white_select_icon : page_select_icon"/>
    </div>
</template>

<style scoped lang="scss">
.border-style-item-container {
    height: 32px;
    width: 100%;
    padding: 4px 6px 4px 12px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .content {
        width: 60px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;

        >img {
            width: 24px;
            height: 100%;
            color: #BFBFBF;
        }

        >span {
            font-family: HarmonyOS Sans;
            font-size: var(--font-default-fontsize);
            font-weight: 500;
        }
    }

    .check {
        width: 12px;
        height: 12px;
    }
}

.border-style-item-container:hover {
    background-color: var(--active-color);
    color: #fff;

    .content {
        >span {
            color: #fff;
        }

        >img {
            color: #fff;
        }
    }
}
</style>