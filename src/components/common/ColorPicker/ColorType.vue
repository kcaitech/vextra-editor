<script setup lang="ts">
import { Color, FillType, Gradient, GradientType, ImageScaleMode } from '@kcdesign/data';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
    color: Color
    gradient_type?: GradientType
    angular: any
    fillType: FillType
    imageScaleMode: ImageScaleMode | undefined
}

interface Emits {
    (e: 'change', value: GradientType, fillType: FillType): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const t = useI18n().t;


onMounted(() => {
});

import fill_gradient_icon from "@/assets/icons/svg/fill-gradient.svg";
import linear_gradient_icon from "@/assets/icons/svg/linear-gradient.svg";
import radial_gradient_icon from "@/assets/icons/svg/radial-gradient.svg";
// import rhomb_gradient_icon from "@/assets/icons/svg/rhomb-gradient.svg";
import fill_image_icon from "@/assets/icons/svg/fill-image.svg";
import SvgIcon from '../SvgIcon.vue';
</script>
<template>
    <div class="color-type-wrapper">
        <div class="item"
            @click.stop="() => { emits('change', gradient_type || GradientType.Linear, FillType.SolidColor) }"
            :class="{ selected: fillType === FillType.SolidColor }">
            <SvgIcon :icon="fill_gradient_icon"/>
        </div>
        <div class="item" @click.stop="() => { emits('change', GradientType.Linear, FillType.Gradient) }"
            :class="{ selected: gradient_type === GradientType.Linear && fillType === FillType.Gradient }">
            <SvgIcon :icon="linear_gradient_icon"/>
        </div>
        <div class="item" @click.stop="() => { emits('change', GradientType.Radial, FillType.Gradient) }"
            :class="{ selected: gradient_type === GradientType.Radial && fillType === FillType.Gradient }">
            <SvgIcon :icon="radial_gradient_icon"/>
        </div>
        <div class="item" @click.stop="() => { emits('change', GradientType.Angular, FillType.Gradient) }"
            :class="{ selected: gradient_type === GradientType.Angular && fillType === FillType.Gradient }">
            <!-- <img :src="angular"> -->
            <div class="angular"></div>
        </div>
        <!-- <div class="item" @click.stop="() => { emits('change', GradientType.Angular) }"
            :class="{ selected: is_checked === GradientType.Radial }">
            <SvgIcon icon-class="rhomb-gradient"/>
        </div> -->
        <div class="item" v-if="imageScaleMode"
            @click.stop="() => { emits('change', gradient_type || GradientType.Linear, FillType.Pattern) }"
            :class="{ selected: fillType === FillType.Pattern }">
            <SvgIcon :icon="fill_image_icon" style="width: 15px; height: 15px;"/>
        </div>
    </div>
</template>
<style scoped lang="scss">
.color-type-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 6px;
    background-color: #F5F5F5;
    outline: none;
    box-sizing: border-box;
    padding: 0 2px;

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
        // border: 1.5px solid #434343;
        box-shadow: 0px 0px 0px 1.3px #434343;
        box-sizing: border-box;
        background: conic-gradient(#9C9C9C, #FFFFFF);
    }
}
</style>