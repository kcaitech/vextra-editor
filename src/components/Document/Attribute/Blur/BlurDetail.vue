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
import { Context } from '@/context';
import { nextTick, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { LinearApi, Blur, BlurMask } from '@kcaitech/vextra-core';
import { hidden_selection } from '@/utils/content';
import { watchEffect } from 'vue';
import { BlurHandler } from '@/transform/blur';
import { sortValue } from '../BaseAttr/oval';
import SvgIcon from '@/components/common/SvgIcon.vue';
import gear_icon from '@/assets/icons/svg/gear.svg';
import { BlurCatch, BlurContextMgr } from './ctx';
import { ElementManager, ElementStatus } from '@/components/common/elementmanager';
import PopoverHeader from "@/components/common/PopoverHeader.vue";

const { t } = useI18n();

interface Props {
    context: Context;
    blur: BlurCatch;
    manager: BlurContextMgr;
}

interface Emits {
    (e: 'setBlurSaturation', value: number): void
    (e: 'keyDownSaturation', fn: LinearApi, value: number): void
    (e: 'dragBlurSaturation', fn: BlurHandler, value: number): void
}

const emits = defineEmits<Emits>();
const props = defineProps<Props>();
const blurValue = ref(0);
const Detail = reactive({
    value: blurValue
})
let blurModifyHandler: BlurHandler | undefined = undefined;

const linearApi = new LinearApi(props.context.repo, props.context.data, props.context.selection.selectedPage!);

const progressBar = ref<HTMLDivElement>();
const progress = ref<HTMLDivElement>();
const progressBtn = ref<HTMLDivElement>();

const panelStatus = reactive<ElementStatus>({ id: '#blur-detail-container', visible: false });
const panelStatusMgr = new ElementManager(
    props.context,
    panelStatus,
    { whiteList: ['#blur-detail-container', '.blur-container'] }
);

function showDetailPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('blur-container')) {
            e && panelStatusMgr.showBy(e, { once: { offsetLeft: -266 } });
            break;
        }
        e = e.parentElement;
    }
}

defineExpose({ Detail })

let isDragging = false
const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    updateProgress(e.clientX);
    down(e);
    nextTick(() => {
        if (progressBtn.value) {
            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUP)
        }
    })
}
const onMouseMove = (e: MouseEvent) => {
    if (isDragging) {
        updateProgress(e.clientX);
        if (!blurModifyHandler) {
            return
        }
        if (!blurModifyHandler.asyncApiCaller) {
            blurModifyHandler.createApiCaller();
        }
        blurModifyHandler.executeSaturation(props.blur.blur, blurValue.value);
    }
}
const onMouseUP = () => {
    isDragging = false;
    if (progressBtn.value) {
        mouseup();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUP);
    }
}
function down(e: MouseEvent) {
    blurModifyHandler = new BlurHandler(props.context, e);
    if (!blurModifyHandler.asyncApiCaller) {
        blurModifyHandler.createApiCaller();
    }
    blurModifyHandler.executeSaturation(props.blur.blur, blurValue.value);
}
function mouseup() {
    blurModifyHandler?.fulfil();
    blurModifyHandler = undefined;
}
function updateProgress(x: number) {
    if (progressBar.value) {
        const progressBarRect = progressBar.value.getBoundingClientRect();
        const progressWidth = Math.min(Math.max(x - progressBarRect.left, 0), progressBarRect.width);
        const progressPercentage = progressWidth / progressBarRect.width * 100;
        const percentage = progressWidth / progressBarRect.width * 200;
        if (progress.value) {
            progress.value.style.width = progressPercentage + '%';
            progressBtn.value!.style.left = `calc(${progressPercentage}% - 6px)`;
            blurValue.value = Number(percentage.toFixed(0));
        }
    }
}

const is_select = ref(false);
const blurInput = ref<HTMLInputElement>();
function clickBlurInput() {
    if (!blurInput.value) return;
    const el = blurInput.value;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_select.value) return;
    el.select();
    is_select.value = true;
}
function changeBlurInput(e: Event) {
    is_select.value = false;
    let value = Number((e.target as HTMLInputElement).value);
    if (isNaN(value)) {
        (e.target as HTMLInputElement).value = `${props.blur?.saturation}`;
        return;
    }
    if (value < 0) value = 0;
    if (value > 200) value = 200;

    props.manager.modifyBlurSaturation(props.blur.blur, value);

    hidden_selection(props.context);
}

const text_keyboard = (e: KeyboardEvent, val: string | number) => {
    if (e.code === "Enter" || e.code === "NumpadEnter") {
        blurInput.value?.blur();
    }
    if (e.code === 'ArrowUp' || e.code === "ArrowDown") {
        let value: any = sortValue(val.toString());
        value = value + (e.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        value = value <= 0 ? 0 : value <= 200 ? value : 200;
        blurValue.value = value;
        const actions: { blur: Blur, value: number }[] = [];
        if (props.blur.blur.parent instanceof BlurMask) {
            actions.push({ blur: props.blur.blur, value });
        } else {
            for (let i = 0; i < props.manager.flat.length; i++) {
                const shape = props.manager.flat[i];
                if (shape.style.blur) actions.push({ blur: shape.style.blur, value });
            }
        }
        linearApi.modifyShapeBlurSaturation(actions);
        e.preventDefault();
    }
}

const update = () => {
    if (progressBar.value && progress.value) {
        progress.value.style.width = (blurValue.value / 2) + '%';
        progressBtn.value!.style.left = `calc(${blurValue.value / 2}% - 6px)`;
    }
}

watchEffect(() => {
    if (!props.blur) return;
    blurValue.value = props.blur.saturation;
    update();
})
</script>

<template>
    <div class="blur-trigger" :class="{ 'active': panelStatus.visible }" @click="showDetailPanel">
        <SvgIcon :icon="gear_icon" />
    </div>
    <div v-if="panelStatus.visible" id="blur-detail-container">
        <PopoverHeader :title="t('blur.blur_setting')" :create="false" @close="panelStatusMgr.close()" />
        <div class="options-container">
            <div class="blur_setting">
                <div class="name-title">{{ $t('blur.blur') }}</div>
                <div class="slider" @mousedown="onMouseDown">
                    <div ref="progressBar" class="progress-bar">
                        <div ref="progress" class="progress"></div>
                        <div ref="progressBtn" class="progress-button" @mousedown.stop="onMouseDown"></div>
                    </div>
                </div>
                <input type="text" ref="blurInput" class="input-text" :value="blurValue" @click="clickBlurInput"
                    @change="changeBlurInput" @keydown="e => text_keyboard(e, blurValue)" />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.active {
    background-color: #ebebeb !important;
}

.blur-trigger {
    flex: 0 0 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 28px;
    height: 28px;
    border-radius: var(--default-radius);

    >img {
        width: 16px;
        height: 16px;
    }
}

.blur-trigger:hover {
    background-color: #F5F5F5;
}

#blur-detail-container {
    width: 254px;
    height: fit-content;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    background-color: #FFFFFF;
    border-radius: 8px;
    box-sizing: border-box;
    z-index: 99;
}

.options-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 12px;
    box-sizing: border-box;
    height: 100%;

    >div {
        display: flex;
        align-items: center;
    }
}

.blur_setting {
    width: 100%;
    height: 32px;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    //justify-content: space-between;

    .name-title {
        width: 24px;
        height: 14px;
        font-family: HarmonyOS Sans;
        font-size: 12px;
        color: #737373;
        margin-right: 20px;
    }

    .input-text {
        border: none;
        outline: none;
    }

    input[type="text"] {
        width: 45px;
        height: 30px;
        text-align: center;
        margin-left: 10px;
        border: none;
        background-color: #F4F5F5;
        border: 1px solid transparent;
        border-radius: var(--default-radius);
        box-sizing: border-box;

        &:focus {
            border-color: #1878F5;
        }
    }

}

.slider {
    flex: 1;
    height: 32px;
    display: flex;
    align-items: center;
}

.progress-bar {
    width: 100%;
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
    width: 12px;
    height: 12px;
    border-radius: 6px;
    background-color: #fff;
    box-shadow: 1px 1px 6px 1px rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
    cursor: pointer;
}
</style>