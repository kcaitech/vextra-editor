<script setup lang="ts">
import SvgIcon from '../SvgIcon.vue';
import fill_gradient_icon from "@/assets/icons/svg/fill-gradient.svg";
import linear_gradient_icon from "@/assets/icons/svg/linear-gradient.svg";
import radial_gradient_icon from "@/assets/icons/svg/radial-gradient.svg";
import fill_image_icon from "@/assets/icons/svg/fill-image.svg";

import { FillType, GradientType } from '@kcdesign/data';

type Props = {
    value: string;
    options: string[];
}

interface Emits {
    (e: 'change', type: string): void;
}

defineProps<Props>();
const emits = defineEmits<Emits>();

</script>
<template>
    <div class="color-type-wrapper">
        <div class="item" @click.stop="() => { emits('change',  FillType.SolidColor) }"
             :class="{ selected: value === FillType.SolidColor }">
            <SvgIcon :icon="fill_gradient_icon"/>
        </div>
        <div class="item" @click.stop="() => { emits('change', GradientType.Linear) }"
             :class="{ selected: value === GradientType.Linear }">
            <SvgIcon :icon="linear_gradient_icon"/>
        </div>
        <div class="item" @click.stop="() => { emits('change', GradientType.Radial) }"
             :class="{ selected: value === GradientType.Radial }">
            <SvgIcon :icon="radial_gradient_icon"/>
        </div>
        <div class="item" @click.stop="() => { emits('change', GradientType.Angular) }"
             :class="{ selected: value === GradientType.Angular }">
            <div class="angular"></div>
        </div>
        <div v-if="options.includes(FillType.Pattern)" class="item"
             @click.stop="() => { emits('change',  FillType.Pattern) }"
             :class="{ selected: value === FillType.Pattern }">
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