<script setup lang="ts">
import TypeHeader from '../TypeHeader.vue';
import {Shape} from '@kcdesign/data';
import {useI18n} from 'vue-i18n';
import {computed, nextTick, ref} from 'vue';
import {Context} from '@/context';

interface Props {
    context: Context
    shapes: Shape[]
}

const props = defineProps<Props>();
const {t} = useI18n();
const sliderValue = ref(100);
const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const selectedOption = ref('')
const updateSlider = () => {
    if (sliderValue.value < 0) {
        sliderValue.value = 0;
    } else if (sliderValue.value > 100) {
        sliderValue.value = 100;
    }
};
const sliderValueFormatted = computed({
    get: () => `${sliderValue.value}%`,
    set: (value) => {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
            sliderValue.value = numericValue;
            updateSlider();
        }
    },
});
const change = (event: Event) => {
    if (event.target instanceof HTMLInputElement) {
        event.target.select();
    }
};

function showMenu(e: MouseEvent) {
    if (popoverVisible.value) return popoverVisible.value = false;
    popoverVisible.value = true;
    nextTick(() => {
        if (!popover.value) return;
        popover.value.style.left = 80 + 'px';
        popover.value.style.top = 20 + 'px';
    })
    document.addEventListener('click', onMenuBlur)
}

function onMenuBlur(e: MouseEvent) {
    if (e.target instanceof Element && !e.target.closest('.popover-f') && !e.target.closest('.icon')) {
        let timer = setTimeout(() => {
            popoverVisible.value = false;
            clearTimeout(timer)
            document.removeEventListener('click', onMenuBlur);
        }, 10)
    }
}

function selectOption(event: MouseEvent) {
    selectedOption.value = (event.target as HTMLSpanElement).innerText;
    popoverVisible.value = false;
}

function range_change(e: InputEvent) {
    const value = (e.target as HTMLInputElement).value;
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const selected = props.context.selection.selectedShapes;
    editor.modifyShapesContextSettingOpacity(selected, Number(value) / 100);
}
</script>
<template>
    <div class="opacity-panel">
        <TypeHeader :title="t('attr.opacity')" class="mt-24">
            <template #tool>
                <!--                <div class="icon" @click="showMenu" ref="trigger">-->
                <!--                    <input v-model="selectedOption">-->
                <!--                    <svg-icon icon-class="down"></svg-icon>-->
                <!--                </div>-->
                <!--                <div ref="popover" class="popover-f" v-if="popoverVisible">-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.normal') }">{{-->
                <!--                        t('opacity.normal') }}</span>-->
                <!--                    <div class="line"></div>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.become_dark') }">{{-->
                <!--                        t('opacity.become_dark') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.multiply') }">{{-->
                <!--                        t('opacity.multiply') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.color_deepening') }">{{-->
                <!--                        t('opacity.color_deepening') }}</span>-->
                <!--                    <div class="line"></div>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.become_bright') }">{{-->
                <!--                        t('opacity.become_bright') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.filter') }">{{-->
                <!--                        t('opacity.filter') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.color_dodge') }">{{-->
                <!--                        t('opacity.color_dodge') }}</span>-->
                <!--                    <div class="line"></div>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.superpose') }">{{-->
                <!--                        t('opacity.superpose') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.soft_light') }">{{-->
                <!--                        t('opacity.soft_light') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.strong_light') }">{{-->
                <!--                        t('opacity.strong_light') }}</span>-->
                <!--                    <div class="line"></div>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.difference') }">{{-->
                <!--                        t('opacity.difference') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.exclude') }">{{-->
                <!--                        t('opacity.exclude') }}</span>-->
                <!--                    <div class="line"></div>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.hue') }">{{-->
                <!--                        t('opacity.hue') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.saturation') }">{{-->
                <!--                        t('opacity.saturation') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.color') }">{{-->
                <!--                        t('opacity.color') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.lightness') }">{{-->
                <!--                        t('opacity.lightness') }}</span>-->
                <!--                    <div class="line"></div>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.darken') }">{{-->
                <!--                        t('opacity.darken') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.brighten') }">{{-->
                <!--                        t('opacity.brighten') }}</span>-->
                <!--                </div>-->
            </template>
        </TypeHeader>
        <div class="opacity-container">
            <input type="range" v-model="sliderValue" @input="updateSlider" @change="range_change" class="input-range"/>
            <input type="text" class="input-text" v-model="sliderValueFormatted" @input="updateSlider" @click="change"/>
        </div>
    </div>
</template>
<style scoped lang="scss">
.opacity-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px 10px 12px 10px;
    box-sizing: border-box;

    .icon {
        width: 10px;
        height: 28px;
        display: flex;
        padding-right: 4px;
        margin-right: 2px;
        justify-content: center;
        align-items: center;
        color: #000000;
        transition: 0.3s;

        > input {
            width: 55px;
            height: 15px;
            margin-left: -79px;
            text-align: center;
            background-color: white;
            border: none;
            font-size: 12px;
        }

        > svg {
            width: 80%;
            height: 60%;
            margin-left: -2px;
        }
    }

    .popover-f {
        position: absolute;
        color: #ffffff;
        z-index: 999;
        width: 150px;
        height: auto;
        font-size: var(--font-default-fontsize);
        background-color: var(--theme-color);
        border-radius: 4px;
        outline: none;
        padding: var(--default-padding-half) 0;

        .selected::before {
            content: '';
            position: absolute;
            left: 3px;
            box-sizing: border-box;
            width: 10px;
            height: 6px;
            border-width: 0 0 2px 2px;
            border-style: solid;
            border-color: var(--theme-color-anti);
            transform: rotate(-45deg) translateY(-4%);
        }

        .line {
            width: 100%;
            height: 8px;
            border-bottom: 1px solid gray;
            margin-bottom: 8px;
            box-sizing: border-box;
        }

        > span {
            position: relative;
            width: 100%;
            height: 28px;
            padding: 0 var(--default-padding);
            display: flex;
            flex-direction: row;
            align-items: center;
            box-sizing: border-box;

            &:hover {
                background-color: var(--active-color);
            }
        }
    }

    .opacity-container {
        display: flex;
        align-items: center;
        justify-content: center;

        input[type="text"] {
            width: 50px;
            height: 23px;
            text-align: center;
            margin-left: -33px;
            margin-top: 10px;
            border: none;
            background-color: #D8D8D866;
        }

        input[type="range"] {
            width: 150px;
            margin-right: 42px;
            margin-top: 10px;
        }

        .input-text {
            border: none;
            outline: none;
        }

        .input-range {
            -webkit-appearance: none;
            background: -webkit-linear-gradient(#D8D8D8, #D8D8D8) no-repeat, #ddd;
            background-size: 75% 100%;
            height: 4px;
        }

        .input-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 14px;
            width: 14px;
            background: #000000d1;
            border-radius: 100%;
            border: solid 1px #ddd;
        }
    }

    .opacity-container .el-slider {
        margin-top: 9px;
        margin-left: 12px;
    }
}</style>