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
import SvgIcon from '../SvgIcon.vue';
import fill_gradient_icon from "@/assets/icons/svg/fill-gradient.svg";
import linear_gradient_icon from "@/assets/icons/svg/linear-gradient.svg";
import radial_gradient_icon from "@/assets/icons/svg/radial-gradient.svg";
import fill_image_icon from "@/assets/icons/svg/fill-image.svg";

import { FillType, GradientType } from '@kcdesign/data';

defineProps<{
    value: string;
    options: FillType[];
}>();

const emits = defineEmits<{
    (e: 'change', type: string): void;
}>();
</script>
<template>
    <div class="color-type-wrapper">
        <div v-if="options.includes(FillType.SolidColor)"
             :class="{item : true, selected: value === FillType.SolidColor }"
             @click.stop="() => { emits('change',  FillType.SolidColor) }">
            <SvgIcon :icon="fill_gradient_icon"/>
        </div>
        <div v-if="options.includes(FillType.Gradient)" :class="{ item: true,selected: value === GradientType.Linear }"
             @click.stop="() => { emits('change', GradientType.Linear) }">
            <SvgIcon :icon="linear_gradient_icon"/>
        </div>
        <div v-if="options.includes(FillType.Gradient)" :class="{item: true, selected: value === GradientType.Radial }"
             @click.stop="() => { emits('change', GradientType.Radial) }">
            <SvgIcon :icon="radial_gradient_icon"/>
        </div>
        <div v-if="options.includes(FillType.Gradient)" :class="{item: true, selected: value === GradientType.Angular }"
             @click.stop="() => { emits('change', GradientType.Angular) }">
            <div class="angular"/>
        </div>
        <div v-if="options.includes(FillType.Pattern)" :class="{item:true, selected: value === FillType.Pattern }"
             @click.stop="() => { emits('change',  FillType.Pattern) }">
            <SvgIcon :icon="fill_image_icon" style="width: 15px; height: 15px;"/>
        </div>
    </div>
</template>
<style scoped lang="scss">
.color-type-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 6px;
    background-color: #F5F5F5;
    outline: none;
    box-sizing: border-box;
    padding: 2px;
    margin: 0 12px;

    .item {
        flex: 1;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        border: 1px solid #F5F5F5;
        opacity: 0.8;
        box-sizing: border-box;

        &:hover {
            opacity: 1;
        }

        svg {
            width: 16px;
            height: 16px;
        }

        img {
            width: 16px;
            height: 16px;
        }
    }

    .selected {
        border: 1px solid #EBEBEB;
        background-color: #ffffff;
        opacity: 1;
    }

    .linear {
        background: linear-gradient(var(--active-color-beta), var(--theme-color-anti));
    }

    .radial {
        background: radial-gradient(var(--active-color-beta), var(--theme-color-anti));
    }

    .angular {
        width: 12.5px;
        height: 12.5px;
        border-radius: 50%;
        box-shadow: 0 0 0 1.3px #434343;
        box-sizing: border-box;
        background: conic-gradient(#9C9C9C, #FFFFFF);
    }
}
</style>