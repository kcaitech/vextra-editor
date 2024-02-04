<script setup lang="ts">
import { Color, Gradient, GradientType } from '@kcdesign/data';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import angular from '@/assets/angular-gradient.png'
interface Props {
    color: Color
    gradient_type?: GradientType | 'solid'
}
interface Emits {
    (e: 'change', value: GradientType | 'solid'): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const t = useI18n().t;


onMounted(() => {
});
</script>
<template>
    <div class="color-type-wrapper">
        <div class="item" @click.stop="() => { emits('change', 'solid') }" :class="{ selected: gradient_type === 'solid' }">
            <svg-icon icon-class="fill-gradient"></svg-icon>
        </div>
        <div class="item" @click.stop="() => { emits('change', GradientType.Linear) }"
            :class="{ selected: gradient_type === GradientType.Linear }">
            <svg-icon icon-class="linear-gradient"></svg-icon>
        </div>
        <div class="item" @click.stop="() => { emits('change', GradientType.Radial) }"
            :class="{ selected: gradient_type === GradientType.Radial }">
            <svg-icon icon-class="radial-gradient"></svg-icon>
        </div>
        <div class="item" @click.stop="() => { emits('change', GradientType.Angular) }"
            :class="{ selected: gradient_type === GradientType.Angular }">
            <img :src="angular">
        </div>
        <!-- <div class="item" @click.stop="() => { emits('change', GradientType.Angular) }"
            :class="{ selected: is_checked === GradientType.Radial }">
            <svg-icon icon-class="rhomb-gradient"></svg-icon>
        </div>
        <div class="item" @click.stop="() => { emits('change', GradientType.Angular) }"
            :class="{ selected: is_checked === GradientType.Radial }">
            <svg-icon icon-class="layer-image" style="fill: #595959;"></svg-icon>
        </div> -->
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
        width: 38px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
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
        background: conic-gradient(var(--active-color-beta), var(--theme-color-anti));
    }
}
</style>