<script lang="ts" setup>
// 取代IconText, 一个输入框要做的就两个事情：展示值、修改值
// 为什么IconText各种可选属性在里面，独立功能相关的逻辑也写在了里面
// 杂乱的Dom结构让人看了头要爆炸，这样的代码会让人丧失写代码的欲望😣
//                                -- 来自一个靓仔👦的自我反省

import { ref } from "vue";

interface Props {
    icon: string;
    value: string | number;

    disabled?: boolean; // 是否禁用
    draggable?: boolean; // 是否可拖拽修改值
}

interface Emits {
    (e: "change", value: string): void;

    (e: "dragstart", event: MouseEvent): void;

    (e: "dragging", event: MouseEvent): void;

    (e: "dragend"): void;

    (e: "wheel", event: WheelEvent): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const inputEl = ref<HTMLInputElement>();
const active = ref<boolean>();
let isDown = false;

function down(e: MouseEvent) {
    if (!props.draggable || props.disabled || isDown || e.button !== 0) {
        return;
    }

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    window.addEventListener('blur', windowBlur);

    emits('dragstart', e);
}

function move(e: MouseEvent) {
    emits('dragging', e);
}

function clearDragStatus() {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
    window.removeEventListener('blur', windowBlur);

    emits('dragend');
}

function up(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }

    clearDragStatus();
}

function windowBlur() {
    clearDragStatus();
}

const is_select = ref(false);

function click() {
    if (!inputEl.value) return;
    const el = inputEl.value;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_select.value) return;
    el.select();
    is_select.value = true;
}

function change(e: Event) {
    emits('change', (e.target as HTMLInputElement).value);

    const el = inputEl.value;
    if (!el) {
        return;
    }
    el.blur();
}

function blur() {
    active.value = false;
    is_select.value = false;
}

function foucs() {
    active.value = true;
}

function wheel(event: WheelEvent) {
    if (!active.value) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();

    emits('wheel', event);
}
</script>

<template>
    <div :class="{ 'md-number-input': true, disabled, active }" @wheel="wheel">
        <svg-icon :icon-class="icon" :class="{ 'un-draggable': !draggable || disabled }" @mousedown="down" />
        <input ref="inputEl" :value="value" @click="click" @change="change" @blur="blur" @focus="foucs" />
    </div>
</template>

<style scoped lang="scss">
.md-number-input {
    display: flex;
    align-items: center;

    width: 88px;
    height: 32px;
    padding: 0 8px;
    box-sizing: border-box;
    background-color: var(--input-background);
    border-radius: var(--default-radius);

    >svg {
        flex: 0 0 12px;
        height: 12px;
        display: block;
        cursor: -webkit-image-set(url("@/assets/cursor/scale.png") 1.5x) 14 14, auto;
    }

    .un-draggable {
        pointer-events: none;
        cursor: auto;
    }

    >input {
        flex: 1;
        width: 100%;
        border: none;
        font-size: var(--font-default-fontsize);
        outline: none;
        text-overflow: ellipsis;
        background-color: transparent;
        font-family: var(--font-family);
        display: block;
    }

    input::selection {
        color: #FFFFFF;
        background: #1878F5;
    }

    input::-moz-selection {
        color: #FFFFFF;
        background: #1878F5;
    }
}

.disabled {
    pointer-events: none;
    opacity: 0.4;
}

.active {
    background-color: transparent !important;
    border: 1px solid #1878F5;
}
</style>