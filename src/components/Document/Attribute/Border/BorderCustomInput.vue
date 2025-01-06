<script setup lang="ts">
import SvgIcon from '@/components/common/SvgIcon.vue';
import { ref, watch } from 'vue';

const props = defineProps<{
    ticon: string
    shadowV: number | string
    disabled?: boolean
}>();
const emits = defineEmits<{
    (e: 'onChange', value: number): void;
    (e: 'dragstart', event: MouseEvent): void;
    (e: 'dragging', event: MouseEvent): void;
    (e: 'dragend'): void;
    (e: 'keydown', event: KeyboardEvent, value: string | number): void;
}>();
const input = ref<HTMLInputElement>();
const isActived = ref(false)
const selectValue = () => {
    isActived.value = true
}

const onChange = () => {
    if (input.value) {
        let value = input.value.value;
        if (isNaN(Number(value)) || !value.trim().length) {
            return input.value.value = String(props.shadowV);
        }
        if (Number(value) > 300) value = '300';
        if (Number(value) < 0) value = '0';
        emits('onChange', Number(value));
        input.value.blur();
    }
}
const augment = () => {
    if (input.value) {
        let value = input.value.value;
        if (Number(value) === 300) return;
        const result = +value + 1;
        emits('onChange', result);
    }
}
const decrease = () => {
    if (input.value) {
        let value = input.value.value;
        if (Number(value) === 0) return;
        const result = +value - 1;
        emits('onChange', result);
    }
}

let isDown = false;
const onMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    if (input.value && isNaN(Number(input.value.value))) return;
    if (props.disabled || e.button !== 0 || isDown) {
        return;
    }

    isDown = true;
    emits('dragstart', e);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', windowBlur);
}
const onMouseMove = (e: MouseEvent) => {
    emits('dragging', e);
}
const onMouseUp = (e: MouseEvent) => {
    if (e.button !== 0) {
        return;
    }
    e.stopPropagation();
    clearStatus();
}

const clearStatus = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('blur', windowBlur);
    isDown = false;
    emits('dragend');
}

const windowBlur = () => {
    clearStatus();
}

function blur2() {
    isActived.value = false
    is_select.value = false;
}

const is_select = ref(false);
function click() {
    if (!input.value) return;
    const el = input.value;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_select.value) return;
    el.select();
    is_select.value = true;
}

const getinput_value = () => {
    if (input.value) {
        return isNaN(Number(input.value.value)) ? true : false;
    } else {
        return true;
    }
}

import down_icon from '@/assets/icons/svg/down.svg';

import border_all_icon from '@/assets/icons/svg/border-all.svg';
import border_bottom_icon from '@/assets/icons/svg/border-bottom.svg';
import border_custom_icon from '@/assets/icons/svg/border-custom.svg';
import border_left_icon from '@/assets/icons/svg/border-left.svg';
import border_right_icon from '@/assets/icons/svg/border-right.svg';
import border_top_icon from '@/assets/icons/svg/border-top.svg';

const border_icons:{[key: string]: string} = {
    'border-all': border_all_icon,
    'border-bottom': border_bottom_icon,
    'border-custom': border_custom_icon,
    'border-left': border_left_icon,
    'border-right': border_right_icon,
    'border-top': border_top_icon,
}
</script>

<template>
    <div class="input-container" :class="{ actived: isActived }">
        <div class="icon" :class="{ cursor_pointer: getinput_value() }" ref="icon" @mousedown="onMouseDown">
            <SvgIcon :icon="border_icons[ticon]"/>
        </div>
        <input ref="input" :value="props.shadowV" @focus="selectValue" @change="onChange" @blur="blur2" @click="click"
            @keydown="e => emits('keydown', e, props.shadowV)">
        <div class="adjust" :class="{ active: isActived }">
            <SvgIcon :icon="down_icon" style="transform: rotate(180deg);" :style="{ cursor: 'pointer' }"
                @click="augment"/>
            <SvgIcon :icon="down_icon" :style="{ cursor: 'pointer' }" @click="decrease"/>
        </div>
    </div>
</template>

<style scoped lang="scss">
.input-container {
    display: flex;
    white-space: nowrap;
    width: 83px;
    height: 32px;
    overflow: hidden;
    padding: 3px 3px 3px 8px;
    align-items: center;
    //padding-left: 12px;
    //padding-right: 3px;
    border: 1px solid transparent;
    box-sizing: border-box;
    background-color: var(--input-background);
    border-radius: var(--default-radius);

    .icon {
        cursor: -webkit-image-set(url("@/assets/cursor/scale.png") 1.5x) 14 14, auto;
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        font-family: HarmonyOS Sans;
        font-size: 12px;
        color: #8C8C8C;

        svg {
            width: 16px;
            height: 16px;
        }
    }

    .cursor_pointer {
        cursor: default !important;
    }

    input {
        width: 100%;
        flex: 1 1 auto;
        align-content: center;
        margin-left: 8px;
        color: #000000;
        font-family: HarmonyOS Sans;
        text-overflow: ellipsis;
        background-color: transparent;
        border: none;
        font-size: var(--font-default-fontsize);
        outline: none;
    }

    input::selection {
        color: #FFFFFF;
        background: #1878F5;
    }

    input::-moz-selection {
        color: #FFFFFF;
        background: #1878F5;
    }

    .adjust {
        width: 19px;
        height: 100%;
        flex: 0 0 19px;
        //background-color: #fff;
        //margin-left: 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        box-sizing: border-box;
        border-radius: 4px;

        >svg {
            cursor: pointer;
            width: 12px;
            height: 12px;
            color: #666666;
        }
    }

    .adjust:hover {
        background-color: #EBEBEB;
    }

    .adjust.active {
        background-color: #EBEBEB;
    }

    //.adjust.active {
    //    background-color: #EBEBEB !important;
    //}
}

.disabled {
    opacity: 0.4;
}

.actived {
    border: 1px solid #1878F5;
}
</style>