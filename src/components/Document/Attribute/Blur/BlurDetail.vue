<script setup lang="ts">
import { Context } from '@/context';
import { nextTick, ref } from 'vue';
import Popover from '@/components/common/Popover.vue';
import { useI18n } from 'vue-i18n';
import { Blur, LinearApi, ShapeView } from '@kcdesign/data';
import { Menu } from "@/context/menu";
import { hidden_selection } from '@/utils/content';
import { get_actions_blur_modify } from '@/utils/shape_style';
import { watchEffect } from 'vue';
import { BlurHandler } from '@/transform/blur';
import { sortValue } from '../BaseAttr/oval';

const { t } = useI18n();

interface Props {
    context: Context
    blur: Blur | undefined
    shapes: ShapeView[]
    entry?: string
}

interface Emits {
    (e: 'setBlurSaturation', value: number): void
    (e: 'keyDownSaturation', fn: LinearApi, value: number): void
    (e: 'dragBlurSaturation', fn: BlurHandler, value: number): void
}

const emits = defineEmits<Emits>();
const props = defineProps<Props>();
const popover = ref();
const blurValue = ref(0);
let blurModifyHandler: BlurHandler | undefined = undefined;
function showMenu() {
    props.context.menu.notify(Menu.SHUTDOWN_MENU);
    popover.value.show();
}
const linearApi = new LinearApi(props.context.coopRepo, props.context.data, props.context.selection.selectedPage!)

const progressBar = ref<HTMLDivElement>()
const progress = ref<HTMLDivElement>()
const progressBtn = ref<HTMLDivElement>()
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
        if (props.entry === 'style') {
            emits('dragBlurSaturation', blurModifyHandler, blurValue.value);
        } else {
            blurModifyHandler.executeSaturation(blurValue.value);
        }
    }
}
const onMouseUP = () => {
    isDragging = false;
    if (progressBtn.value) {
        mouseup();
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUP)
    }
}

function down(e: MouseEvent) {
    blurModifyHandler = new BlurHandler(props.context, e);
    if (!blurModifyHandler.asyncApiCaller) {
        blurModifyHandler.createApiCaller();
    }
    if (props.entry === 'style') {
        emits('dragBlurSaturation', blurModifyHandler, blurValue.value);
    } else {
        blurModifyHandler.executeSaturation(blurValue.value);
    }
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
    blurValue.value = value;
    if (props.entry === 'style') {
        emits('setBlurSaturation', value);
    } else {
        const actions = get_actions_blur_modify(props.shapes, value);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapeBlurSaturation(actions);
        }
    }

    update();
    hidden_selection(props.context);
}

const text_keyboard = (e: KeyboardEvent, val: string | number) => {
    if (e.code === "Enter" || e.code === "NumpadEnter") {
        blurInput.value?.blur();
    }
    if (e.code === 'ArrowUp' || e.code === "ArrowDown") {
        let value: any = sortValue(val.toString());
        value = value + (e.code === 'ArrowUp' ? 1 : -1)
        if (isNaN(value)) return;
        value = value <= 0 ? 0 : value <= 200 ? value : 200
        blurValue.value = value
        if (props.entry === 'style') {
            emits('keyDownSaturation', linearApi, value);
        } else {
            const actions = get_actions_blur_modify(props.shapes, value);
            const page = props.context.selection.selectedPage;
            if (page) {
                linearApi.modifyShapeBlurSaturation(actions)
            }
        }
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
    <div class="blur-detail-container" @mousedown.stop>
        <Popover :context="props.context" class="popover" ref="popover" :width="254" :auto_to_right_line="true"
            :title="`${t('blur.blur_setting')}`">
            <template #trigger>
                <div class="trigger" @click="showMenu">
                    <svg-icon icon-class="gear" />
                </div>
            </template>
            <template #body>
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
            </template>
        </Popover>
    </div>
</template>

<style scoped lang="scss">
.blur-detail-container {
    >.popover {
        width: 28px;
        height: 28px;

        .trigger {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: var(--default-radius);

            >svg {
                width: 16px;
                height: 16px;
            }
        }

        .trigger:hover {
            background-color: #F5F5F5;
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