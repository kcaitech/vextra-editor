<script setup lang="ts">
import TypeHeader from '../TypeHeader.vue';
import { AsyncOpacityEditor, ShapeView, adapt2Shape } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { Context } from '@/context';
import { throttle } from 'lodash';
import { modifyOpacity } from '@/utils/common';
import { hidden_selection } from '@/utils/content';

interface Props {
    context: Context;
    selectionChange: number;
    trigger: any[]
}

const props = defineProps<Props>();
const { t } = useI18n();
const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const shapes = ref<ShapeView[]>();
const opacityValue = ref(0);
const opacityInput = ref<HTMLInputElement>();
const executed = ref(true);
let opacity_editor: AsyncOpacityEditor | undefined = undefined;

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

function limitValue(value: number): number {
    if (value < 0) {
        return 0;
    } else if (value > 100) {
        return 100;
    } else {
        return value;
    }
}

const opacity = ref<number | string>(1);
const ipt = () => {
    if (typeof opacity.value === 'number') {
        return (opacity.value * 100).toFixed(0);
    } else {
        return opacity.value;
    }
}

function change(e: Event) {
    if (!executed.value) return;
    executed.value = false;
    const value = opacityValue.value;
    if (isNaN(value) || value === 1 || value === 0) {
        (e.target as HTMLInputElement).value =
            typeof opacity.value === 'string'
                ? ipt()
                : `${ipt()}%`;

        if (isNaN(value)) return;
    }
    modifyOpacity(props.context, value, shapes.value);
}

function down(v: number) {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!selected.length || !page) return;
    const value = limitValue(v);
    if (isNaN(value)) return;
    opacity.value = limitValue(Number(value));
    opacity_editor = props.context.editor
        .controller()
        .asyncOpacityEditor(selected, page);
    opacity_editor.execute(value);
}

function mouseup() {
    if (opacity_editor) {
        opacity_editor.close();
        opacity_editor = undefined;
    }
}
const progressBar = ref<HTMLDivElement>()
const progress = ref<HTMLDivElement>()
const progressBtn = ref<HTMLDivElement>()
let isDragging = false
const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    updateProgress(e.clientX);
    down(opacity.value as number);
    nextTick(() => {
        if (progressBtn.value) {
            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUP)
        }
    })
    hidden_selection(props.context);
}
const onMouseMove = (e: MouseEvent) => {
    if (isDragging) {
        updateProgress(e.clientX);
        if (opacity_editor && typeof opacity.value === 'number') {
            opacity_editor.execute(opacity.value);
        }
    }
    hidden_selection(props.context);
}
const onMouseUP = () => {
    isDragging = false;
    if (progressBtn.value) {
        mouseup()
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUP)
    }
}
function updateProgress(x: number) {
    if (progressBar.value) {
        const progressBarRect = progressBar.value.getBoundingClientRect();
        const progressWidth = Math.min(Math.max(x - progressBarRect.left, 0), progressBarRect.width);
        const progressPercentage = progressWidth / progressBarRect.width * 100;
        if (progress.value) {
            progress.value.style.width = progressPercentage + '%';
            progressBtn.value!.style.left = progressPercentage - 4 + '%';
            opacity.value = Number(progressPercentage.toFixed(0)) / 100;
        }
    }
}

function input(e: Event) {
    const value = limitValue(Number((e.target as HTMLInputElement).value)) / 100;
    if (isNaN(value) || !opacity_editor) return;
    opacity.value = limitValue(Number(value));
    opacity_editor.execute(value);
    hidden_selection(props.context);
}

const handleOPacity = (e: Event) => {
    executed.value = true;
    const value = limitValue(Number((e.target as HTMLInputElement).value)) / 100;
    opacityValue.value = value;
}

const focus = (e: Event) => {
    if (opacityInput.value) {
        executed.value = true;
        shapes.value = [...props.context.selection.selectedShapes];
        const value = limitValue(Number((e.target as HTMLInputElement).value)) / 100;
        opacityValue.value = value;
        opacityInput.value.select();
    }
}
const text_keyboard = (e: KeyboardEvent) => {
    if (e.code === "Enter" || e.code === "NumpadEnter") {
        opacityInput.value?.blur();
    }
}

function _update() {
    const shapes = props.context.selection.selectedShapes
    if (!shapes.length) {
        return;
    }
    let firstOpacity = shapes[0].contextSettings?.opacity;
    firstOpacity = firstOpacity === undefined ? 1 : firstOpacity;
    let difference = false;
    if (shapes.length > 1) {
        for (let i = 1; i < shapes.length; i++) {
            const o = shapes[i].contextSettings;
            const randomOpacity = o?.opacity === undefined ? 1 : o?.opacity;
            if (randomOpacity !== firstOpacity) {
                difference = true;
                break;
            }
        }
        opacity.value = difference ? `${t('attr.more_value')}` : firstOpacity;
    } else {
        opacity.value = firstOpacity;
    }
    if (progressBar.value && progress.value) {
        progress.value.style.width = (firstOpacity * 100) + '%';
        progressBtn.value!.style.left = (firstOpacity * 100) - 4 + '%';
    }
}

const update = throttle(_update, 320, { leading: true });

const stop = watch(() => props.trigger, (v) => {
    if (v.includes('layout')) {
        update();
    }
});
const stop2 = watch(() => props.selectionChange, () => {
    update()
});

onMounted(update);
onUnmounted(() => {
    if (opacity_editor) {
        opacity_editor.close();
    }

    stop();
    stop2();
})
</script>
<template>
    <div class="opacity-panel">
        <TypeHeader :title="t('attr.opacity')" class="mt-24" :active="true">
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
            <div class="slider" @mousedown="onMouseDown">
                <div ref="progressBar" class="progress-bar">
                    <div ref="progress" class="progress"></div>
                    <div ref="progressBtn" class="progress-button" @mousedown.stop="onMouseDown"></div>
                </div>
            </div>
            <input type="text" ref="opacityInput" class="input-text"
                :value="typeof opacity === 'string' ? ipt() : `${ipt()}%`" @focus="focus" @change="change" @blur="change"
                @input="handleOPacity" @keydown="text_keyboard" />
        </div>
    </div>
</template>
<style scoped lang="scss">
.opacity-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px 8px 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .clear {
        overflow: hidden;
    }

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

        >input {
            width: 55px;
            height: 15px;
            margin-left: -79px;
            text-align: center;
            background-color: white;
            border: none;
            font-size: 12px;
        }

        >svg {
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

        >span {
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
        justify-content: space-between;
        margin-top: -14px;
        margin-bottom: 3px;

        .aj_tempt {
            display: contents;
        }
    }

    input[type="text"] {
        width: 54px;
        height: 32px;
        text-align: center;
        margin-left: 4px;
        margin-top: 10px;
        border: none;
        background-color: #F4F5F5;
        border-radius: var(--default-radius);
    }

    .input-text {
        border: none;
        outline: none;
    }

    input[type="range"]:focus {
        outline: none;
    }

    input[type="range"] {
        -webkit-appearance: none !important;
        appearance: none !important;
        outline: 0;
        background-color: transparent;
        width: 150px;
        margin-right: 10px;
    }

    /* 火狐 外背景色 */
    input[type=range]::-moz-range-progress {
        background: #1878F5;
        height: 3px;
    }

    /* 定义range控件容器的样式 */
    input[type="range" i]::-webkit-slider-container {
        height: 20px;
        overflow: hidden;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none !important;
        appearance: none !important;
        width: 12px;
        height: 12px;
        border-radius: 8px;
        background-color: #FFFFFF;
        border: 1px solid transparent;
        box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.12);
        border-image: linear-gradient(#1878F5, #1878F5) 0 fill / 8 20 8 0 / 0px 0px 0 2000px;
    }

    .track {
        width: 150px;
        height: 2px;
        background-color: #D9D9D9;
        margin-left: 2px;
        margin-top: -14px
    }
}

.opacity-container .el-slider {
    margin-top: 9px;
    margin-left: 12px;
}

.slider {
    margin-top: 10px;
    margin-left: 5px;
    height: 32px;
    display: flex;
    align-items: center;
}

.progress-bar {
    width: 150px;
    height: 4px;
    background-color: var(--grey-dark);
    border-radius: 3px;
    position: relative;
    cursor: pointer;
}

.progress {
    width: 0%;
    height: 100%;
    background-color: var(--active-color);
    border-radius: 5px;
    cursor: pointer;
}

.progress-button {
    position: absolute;
    left: 0%;
    top: -4px;
    width: 14px;
    height: 14px;
    border-radius: 7px;
    background-color: #fff;
    box-sizing: border-box;
    cursor: pointer;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
}
</style>