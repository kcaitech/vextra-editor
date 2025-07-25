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
import {  HSL2RGB, RGB2HSL, verifiedVal } from "@/components/common/ColorPicker/utils";
import { onUnmounted, ref, watchEffect } from "vue";
import { Color } from "@kcaitech/vextra-core";

const props = defineProps<{ stop: RGBACatch }>();
const emits = defineEmits<{
    (e: "change", stop: RGBACatch): void;
}>();
const H = ref<number>(360);
const S = ref<number>(0);
const L = ref<number>(0);

function update() {
    const hsl = RGB2HSL({ red: props.stop.R, green: props.stop.G, blue: props.stop.B } as Color);
    H.value = Math.round(hsl.h);
    S.value = Math.round(hsl.s * 100);
    L.value = Math.round(hsl.l * 100);
}

function focus(event: Event) {
    const target = event.target as HTMLInputElement;
    target.select();
}

function changeH(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = verifiedVal(parseInt(target.value), 0, 360);
    const rgb = HSL2RGB({h: value, s: S.value, l: L.value});
    emits('change', Object.assign({...props.stop}, {R: rgb.R, G: rgb.G, B: rgb.B}));
    target.blur();
}

function changeS(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = verifiedVal(parseInt(target.value), 0, 100);
    const rgb = HSL2RGB({ h: H.value, s: value * 0.01, l: L.value * 0.01 });
    emits('change', Object.assign({...props.stop}, {R: rgb.R, G: rgb.G, B: rgb.B}));
    target.blur();
}

function changeL(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = verifiedVal(parseInt(target.value), 0, 100);
    const rgb = HSL2RGB({ h: H.value, s: S.value * 0.01, l: value * 0.01 });
    emits('change', Object.assign({...props.stop}, {R: rgb.R, G: rgb.G, B: rgb.B}));
    target.blur();
}

onUnmounted(watchEffect(update));
</script>

<template>
    <div class="inputs">
        <input :value="H" @focus="focus" @change="changeH"/>
        <input :value="S" @focus="focus" @change="changeS"/>
        <input :value="L" @focus="focus" @change="changeL"/>
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
        text-align: center;
        padding: 0;
        background-color: transparent;
        font-size: var(--default-font-size);
        font-weight: 500;
        color: #000000;
    }
}
</style>