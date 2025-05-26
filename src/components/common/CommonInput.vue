/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { ref, watch } from "vue";
import SvgIcon from "./SvgIcon.vue";

type Props = {
    icon: string;
    value: string | number;
    show?: boolean;
    position?: boolean;
    disabled?: boolean;
    draggable?: boolean;
}

interface Emits {
    (e: "change", value: string): void;

    (e: "dragstart", event: MouseEvent): void;

    (e: "dragging", event: MouseEvent): void;

    (e: "dragend"): void;

    (e: "wheel", event: WheelEvent): void;

    (e: "keydown", event: KeyboardEvent): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const inputEl = ref<HTMLInputElement>();
const active = ref<boolean>();
const RadiusActive = ref<boolean>(false)
let isDown = false;

function down(e: MouseEvent) {
    if (!props.draggable || props.disabled || isDown || e.button !== 0) return;

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
    if (!e.button) clearDragStatus();
}

function windowBlur() {
    clearDragStatus();
}

function change(e: Event) {
    emits('change', (e.target as HTMLInputElement).value);
    inputEl.value?.blur();
}

function blur() {
    active.value = false;
}

function focus() {
    if (active.value) return;
    active.value = true;
    inputEl.value?.focus();
    inputEl.value?.select();
}

function keydown(event: KeyboardEvent) {
    if (event.key === "Escape") return inputEl.value?.blur();
    emits("keydown", event);
}

watch(() => props.position, (v) => {
    RadiusActive.value = v
})

</script>

<template>
<div :class="{ 'vext-input': true, disabled, active }" @click.stop="focus">
    <SvgIcon :icon="icon" :class="{ 'un-draggable': !draggable || disabled }" @mousedown.stop="down"/>
    <input ref="inputEl" :value="value" @change="change" @blur="blur" @keydown="keydown"/>
</div>
</template>

<style scoped lang="scss">
.vext-input {
    display: flex;
    gap: 8px;
    align-items: center;

    width: 88px;
    min-width: 88px;
    height: 32px;
    padding: 0 8px;
    border: 1px solid transparent;
    box-sizing: border-box;
    background-color: var(--input-background);
    border-radius: var(--default-radius);

    >img {
        flex: 0 0 12px;
        height: 12px;
        display: block;
        cursor: -webkit-image-set(url("@/assets/cursor/scale.png") 1.5x) 14 14, auto;
    }

    .radius-style {
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-radius: 4px;
        visibility: hidden;

        >svg {
            width: 12px;
            height: 12px;
        }
    }

    .radius-style svg {
        padding: 1px;
        box-sizing: border-box;
    }

    .radius-style:hover {
        background-color: #e5e5e5;
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

    &:hover .radius-style {
        visibility: visible;
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

.active-radius {
    visibility: visible !important;
    background-color: #e5e5e5;
}
</style>