<script setup lang="ts">
import Tooltip from '@/components/common/Tooltip.vue';
import down_icon from '@/assets/icons/svg/down.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { ref } from 'vue';

const props = defineProps<{
    ticon: string
    shadowV: number
    tootip?: string
    disabled?: boolean
}>();
const emits = defineEmits<{
    (e: 'onChange', value: number): void;
    (e: 'dragstart', event: MouseEvent): void;
    (e: 'dragging', event: MouseEvent): void;
    (e: 'dragend'): void;
    (e: 'keyDown', event: KeyboardEvent, val: string | number): void;
}>();
const input = ref<HTMLInputElement>();
const isActive = ref(false)
const selectValue = () => {
    isActive.value = true
}

const onChange = () => {
    if (input.value) {
        let value = input.value.value;
        if (isNaN(Number(value)) || !value.trim().length) {
            return input.value.value = String(props.shadowV);
        }
        if (Number(value) > 3000) value = '3000';
        if (Number(value) < -3000) value = '-3000';
        if (props.ticon === 'B') {
            if (Number(value) > 200) value = '200';
            if (Number(value) < 0) value = '0';
        }
        emits('onChange', Number(value));
    }
}
const augment = () => {
    if (input.value && !props.disabled) {
        let value = input.value.value;
        if (Number(value) === 3000 || (props.ticon === 'B' && Number(value) === 200)) return;
        const result = +value + 1;
        emits('onChange', result);
    }
}
const decrease = () => {
    if (input.value && !props.disabled) {
        let value = input.value.value;
        if (Number(value) === -3000 || (props.ticon === 'B' && Number(value) === 0)) return;
        const result = +value - 1;
        emits('onChange', result);
    }
}

let isDown = false;
const onMouseDown = (e: MouseEvent) => {
    e.stopPropagation();

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
        return
    }
    e.stopPropagation();

    clearStatus();
}

function clearStatus() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('blur', windowBlur);
    isDown = false;
    emits('dragend');
}

function windowBlur() {
    clearStatus();
}

function blur2() {
    isActive.value = false
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
</script>

<template>
    <div class="input-container" :class="{ disabled: props.disabled, active: isActive }">
        <Tooltip v-if="props.tootip && !props.disabled" :content="props.tootip" :offset="12">
            <span class="icon" ref="icon" @mousedown="onMouseDown">{{ ticon }}</span>
        </Tooltip>
        <span class="icon" ref="icon" v-if="!props.tootip || props.disabled" @mousedown="onMouseDown"
            :class="{ cursor: !props.disabled }">{{ ticon }}</span>
        <Tooltip v-if="props.tootip && props.disabled" :content="props.tootip" :offset="12">
            <input ref="input" :value="props.shadowV" @focus="selectValue" :disabled="props.disabled"
                :style="{ cursor: props.disabled ? 'default' : 'text' }" @change="onChange">
        </Tooltip>
        <input v-if="!props.disabled" ref="input" :value="props.shadowV" @focus="selectValue" :disabled="props.disabled"
            :style="{ cursor: props.disabled ? 'default' : 'text' }" @change="onChange" @blur="blur2" @click="click"
            @keydown="e => emits('keyDown', e, props.shadowV)">
        <div class="adjust" :class="{ active: isActive }">
            <SvgIcon :icon="down_icon" style="transform: rotate(180deg);"
                :style="{ cursor: props.disabled ? 'default' : 'pointer' }" @click="augment" />
            <SvgIcon :icon="down_icon" :style="{ cursor: props.disabled ? 'default' : 'pointer' }" @click="decrease" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.input-container {
    display: flex;
    white-space: nowrap;
    width: 88px;
    height: 32px;
    overflow: hidden;
    padding: 3px 3px 3px 12px;
    align-items: center;
    border: 1px solid transparent;
    box-sizing: border-box;
    background-color: var(--input-background);
    border-radius: var(--default-radius);
    margin-left: 8px;

    .icon {
        flex-shrink: 0;
        cursor: -webkit-image-set(url("@/assets/cursor/scale.png") 1.5x) 14 14, auto;
        text-align: center;
        width: 8px;
        height: 16px;
        font-size: 12px;
        color: #8C8C8C;
    }

    input {
        width: 100%;
        flex: 1 1 auto;
        align-content: center;
        margin-left: 8px;
        color: #000000;
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
}

.disabled {
    opacity: 0.4;
}

.active {
    border: 1px solid #1878F5;
}

.cursor {
    cursor: -webkit-image-set(url("@/assets/cursor/scale.png") 1.5x) 14 14, auto;
}
</style>