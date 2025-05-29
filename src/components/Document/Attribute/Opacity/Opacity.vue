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
import TypeHeader from '../TypeHeader.vue';
import { AsyncOpacityEditor, BlendMode, ContextSettings, LinearApi, ShapeView, adapt2Shape } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { Context } from '@/context';
import { throttle } from 'lodash';
import { modifyOpacity } from '@/utils/common';
import { hidden_selection } from '@/utils/content';
import { v4 } from 'uuid';
import { sortValue } from "@/components/Document/Attribute/BaseAttr/oval";

const mixModeList = [
    BlendMode.Normal,
    BlendMode.Darken,
    BlendMode.Multiply,
    BlendMode.ColorBurn,
    BlendMode.Lighten,
    BlendMode.Screen,
    BlendMode.ColorDodge,
    BlendMode.Overlay,
    BlendMode.SoftLight,
    BlendMode.HardLight,
    BlendMode.Difference,
    BlendMode.Exclusion,
    BlendMode.Hue,
    BlendMode.Saturation,
    BlendMode.Color,
    BlendMode.Luminosity,
    BlendMode.PlusDarker,
    BlendMode.PlusLighter
]
const dialogLine = [
    BlendMode.Normal,
    BlendMode.ColorBurn,
    BlendMode.ColorDodge,
    BlendMode.HardLight,
    BlendMode.Exclusion,
    BlendMode.Luminosity
]

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
const selectedMixMode = ref<BlendMode>();
const hovered = ref<BlendMode>();
const modeList = ref<HTMLDivElement[]>();
const panel = ref<HTMLDivElement>();
let opacity_editor: AsyncOpacityEditor | undefined = undefined;
const linearApi = new LinearApi(props.context.coopRepo, props.context.data, props.context.selection.selectedPage!)

function showMenu(e: MouseEvent) {
    if (popoverVisible.value) return popoverVisible.value = false;
    popoverVisible.value = true;
    props.context.escstack.save(v4(), min_mode_dialog);
    nextTick(() => {
        if (!popover.value) return;
        const index = mixModeList.findIndex(item => item === selectedMixMode.value);
        if (index === -1) {
            popover.value.style.top = 30 + 'px';
        } else {
            if (modeList.value) {
                const max_top = -(panel.value?.offsetTop || 0);
                let top = -modeList.value[index].offsetTop;
                popover.value.style.top = Math.max(top, max_top) + 'px';
            }
        }
    })
    document.addEventListener('click', onMenuBlur)
}

function min_mode_dialog() {
    const is_achieve_expected_results = popoverVisible.value;
    popoverVisible.value = false;
    return is_achieve_expected_results;
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
    is_select.value = false;
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

function keydownOpacity(event: KeyboardEvent) {
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        const target = event.target as HTMLInputElement;
        let value: number = sortValue(target.value) * 0.01 + (event.code === 'ArrowUp' ? 0.01 : -0.01);
        if (isNaN(value)) return;
        const shapes = props.context.selection.selectedShapes;
        value = value >= 1 ? 1 : value <= 0 ? 0 : value
        linearApi.modifyShapesOpacity(shapes, value);
        event.preventDefault();
    }
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
    }
}
const is_select = ref(false);
function click() {
    if (!opacityInput.value) return;
    const el = opacityInput.value;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_select.value) return;
    el.select();
    is_select.value = true;
}

const text_keyboard = (e: KeyboardEvent) => {
    if (e.code === "Enter" || e.code === "NumpadEnter") {
        opacityInput.value?.blur();
    }
    keydownOpacity(e)
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
    getMixMode();
    if (progressBar.value && progress.value) {
        progress.value.style.width = (firstOpacity * 100) + '%';
        progressBtn.value!.style.left = (firstOpacity * 100) - 4 + '%';
    }
}

const getMixMode = () => {
    const shapes = props.context.selection.selectedShapes
    if (!shapes.length) return;
    const contextSettings = shapes[0].contextSettings as ContextSettings;
    let fristMode
    if (contextSettings) {
        fristMode = contextSettings.blenMode;
    } else {
        fristMode = BlendMode.Normal;
    }
    if (shapes.length > 1) {
        for (let i = 1; i < shapes.length; i++) {
            const c = shapes[i].contextSettings;
            let mode
            if (c) {
                mode = c.blenMode;
            } else {
                mode = BlendMode.Normal;
            }
            if (mode !== fristMode) {
                selectedMixMode.value = undefined;
                hovered.value = undefined;
                return;
            }
        }
    }
    selectedMixMode.value = fristMode;
    hovered.value = fristMode;
}

const onClickMode = (mode: BlendMode) => {
    selectedMixMode.value = mode;
    setMixMode(mode);
    popoverVisible.value = false;
}

const enterMixMode = (mode: BlendMode) => {
    hovered.value = mode;
}

const setMixMode = (mode: BlendMode) => {
    const shapes = props.context.selection.selectedShapes
    if (!shapes.length) {
        return;
    }
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const editor = props.context.editor4Page(page);
    editor.modifyShapesContextSettingBlendMode((shapes as ShapeView[]).map(s => adapt2Shape(s)), mode);
}

// const update = throttle(_update, 320, { leading: true });
const update = _update;

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

import arrow2_icon from '@/assets/icons/svg/arrow2.svg';
import white_select_icon from '@/assets/icons/svg/white-select.svg';
import page_select_icon from '@/assets/icons/svg/page-select.svg';
import SvgIcon from "@/components/common/SvgIcon.vue";


</script>
<template>
    <div class="opacity-panel" ref="panel">
        <TypeHeader :title="t('attr.opacity')" class="mt-24" :active="true">
            <template #tool>
                <div class="icon" @click="showMenu" ref="trigger">
                    <div class="mode_box">{{ selectedMixMode ? t(`opacity.${selectedMixMode}`) : t('attr.more_value') }}
                    </div>
                    <SvgIcon :icon="arrow2_icon"/>
                </div>
                <div ref="popover" class="popover-f" v-if="popoverVisible">
                    <div class="item" style="opacity: 0.3;" v-if="!selectedMixMode">
                        <div></div>
                        <span>{{ t('attr.more_value') }}</span>
                    </div>
                    <div class="line" v-if="!selectedMixMode"></div>
                    <template v-for="(item, index) in mixModeList" :key="index">
                        <div class="item" ref="modeList" :class="{ 'hovered': hovered === item }"
                            @mouseenter="enterMixMode(item)" @click="onClickMode(item)">
                            <div>
                                <SvgIcon v-if="selectedMixMode === item"
                                    :icon="hovered === item ? white_select_icon : page_select_icon"/>
                            </div>
                            <span>{{ t(`opacity.${item}`) }}</span>
                        </div>
                        <div class="line" v-if="dialogLine.includes(item)"></div>
                    </template>
                </div>
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
                :value="typeof opacity === 'string' ? ipt() : `${ipt()}%`" @click="click" @focus="focus"
                @change="change" @blur="change" @input="handleOPacity" @keydown="text_keyboard" />
        </div>
    </div>
</template>
<style scoped lang="scss">
.opacity-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 8px 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .clear {
        overflow: hidden;
    }

    .icon {
        height: 28px;
        display: flex;
        padding: 0 5px;
        justify-content: space-between;
        align-items: center;
        color: #000000;
        border-radius: 4px;
        box-sizing: border-box;
        transition: 0.2s;

        &:hover {
            background-color: #F5F5F5;
        }

        .mode_box {
            flex: 1;
            margin-right: 3px;
            box-sizing: border-box;
        }

        >img {
            width: 10px;
            height: 10px;
        }
    }

    .popover-f {
        position: absolute;
        right: 0px;
        color: #000000;
        z-index: 999;
        width: 104px;
        height: auto;
        font-size: var(--font-default-fontsize);
        background-color: #fff;
        box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
        border-radius: 4px;
        border: 1px solid #F5F5F5;
        outline: none;
        padding: 4px 0;

        .line {
            width: 100%;
            height: 4px;
            border-bottom: 1px solid #EBEBEB;
            margin-bottom: 4px;
            box-sizing: border-box;
        }

        .item {
            width: 100%;
            height: 32px;
            padding-right: var(--default-padding);
            display: flex;
            flex-direction: row;
            align-items: center;
            box-sizing: border-box;

            >div {
                width: 32px;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;

                >img {
                    width: 13px;
                    height: 13px;
                }
            }
        }
    }

    .opacity-container {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .aj_tempt {
            display: contents;
        }
    }

    input[type="text"] {
        width: 54px;
        height: 32px;
        text-align: center;
        border: none;
        background-color: #F4F5F5;
        border-radius: var(--default-radius);
        box-sizing: border-box;
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

.hovered {
    background-color: var(--active-color);
    color: #ffffff;
}
</style>