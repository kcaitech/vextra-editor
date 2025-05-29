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
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { getRGBFromInputEvent } from "@/components/Document/Attribute/basic";
import { onUnmounted, ref, watchEffect } from "vue";

const props = defineProps<{ stop: RGBACatch }>();
const emits = defineEmits<{
    (e: "change", stop: RGBACatch): void;
}>();

function rgbToHex(R: number, G: number, B: number) {
    const toHex = (color: number) => {
        color = Math.round(color);
        const hex = color.toString(16).toUpperCase();
        return hex.length === 1 ? "0" + hex : hex;
    };
    return toHex(R) + toHex(G) + toHex(B);
}

const hex = ref<string>(rgbToHex(props.stop.R, props.stop.G, props.stop.B));

function focus(event: Event) {
    const target = event.target as HTMLInputElement;
    target.select();
}

function change(event: Event) {
    const target = event.target as HTMLInputElement;
    const rgb = getRGBFromInputEvent(event);
    if (!rgb) return;
    emits('change', Object.assign({...props.stop}, {R: rgb[0], G: rgb[1], B: rgb[2]}));
    target.blur();
}

onUnmounted(watchEffect(() => {
    hex.value = rgbToHex(props.stop.R, props.stop.G, props.stop.B);
}))
</script>

<template>
    <div class="inputs">
        <input :value="hex" @focus="focus" @change="change" :spellcheck="false"/>
    </div>
</template>

<style scoped lang="scss">
.inputs {
    flex: 1;
    display: flex;

    input {
        width: 100%;
        height: 100%;
        border: none;
        outline: none;
        text-align: left;
        padding: 0;
        background-color: transparent;
        font-size: var(--default-font-size);
        font-weight: 500;
        color: #000000;
    }
}
</style>