<script setup lang="ts">
import { Color, Gradient, GradientType } from '@kcdesign/data';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
interface Props {
    color: Color
    gradient?: Gradient
}
interface Emits {
    (e: 'change', value: GradientType | 'solid'): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const t = useI18n().t;
const wrapper = ref<HTMLDivElement>();
const left = ref<number>(0);
const top = ref<number>(0);
const is_checked = ref<GradientType | 'solid'>('solid');
function init() {
    const parentNode = wrapper.value?.closest('.popover')?.querySelector('.header');
    if (!parentNode) {
        console.log('!parentNode');
        return;
    }
    const box = parentNode.getBoundingClientRect();
    top.value = box.height;
    if (!props.gradient) {
        return;
    }
    is_checked.value = props.gradient.gradientType;
}
onMounted(init);
</script>
<template>
    <div ref="wrapper" class="wrapper" :style="{ left: left + 'px', top: top + 'px' }">
        <div class="item" @click.stop="() => { emits('change', 'solid') }">
            <div :class="{ check: true, is: is_checked === 'solid' }"></div>
            <div class="desc">
                {{ t('color.solid') }}
            </div>
            <div class="block"></div>
        </div>
        <div class="item" @click.stop="() => { emits('change', GradientType.Linear) }">
            <div :class="{ check: true, is: is_checked === GradientType.Linear }"></div>
            <div class="desc">
                {{ t('color.linear') }}
            </div>
            <div class="block linear"></div>
        </div>
        <div class="item" @click.stop="() => { emits('change', GradientType.Radial) }">
            <div :class="{ check: true, is: is_checked === GradientType.Radial }"></div>
            <div class="desc">
                {{ t('color.radial') }}
            </div>
            <div class="block radial"></div>
        </div>
        <div class="item" @click.stop="() => { emits('change', GradientType.Angular) }">
            <div :class="{ check: true, is: is_checked === GradientType.Angular }"></div>
            <div class="desc">
                {{ t('color.angular') }}
            </div>
            <div class="block angular"></div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.wrapper {
    position: absolute;
    width: 112px;
    height: auto;
    padding: 8px 16px;
    box-shadow: 0px 0px 1px 1px #ccc;
    border-radius: var(--default-radius);
    z-index: 1;
    background-color: var(--theme-color-anti);

    .item {
        width: 100%;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;

        .check {
            flex: 0 0 8px;
            height: 4px;
            border-color: transparent;
            border-style: solid;
            border-width: 0 0 2px 2px;
            transform: rotate(-45deg);
            margin-right: 6px;
        }

        .is {
            border-color: var(--theme-color);
        }

        >.desc {
            flex: 1;
        }

        .block {
            flex: 0 0 18px;
            height: 18px;
            background-color: var(--active-color-beta);
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

}
</style>