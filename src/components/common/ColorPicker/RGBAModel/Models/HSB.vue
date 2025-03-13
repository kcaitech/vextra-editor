/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { HSB2RGB, RGB2HSB, verifiedVal } from "@/components/common/ColorPicker/utils";
import { onUnmounted, Ref, ref, watchEffect } from "vue";
import { Color } from "@kcdesign/data";
import { inject } from "vue";
const props = defineProps<{ stop: RGBACatch }>();
const emits = defineEmits<{
    (e: "change", stop: RGBACatch): void;
}>();
const H = ref<number>(100);
const S = ref<number>(0);
const B = ref<number>(0);
const { valueS, valueH, changeValueS, changeValueH } = inject('HSB') as { valueS: Ref<number>, valueH: Ref<number>, changeValueS: (v: number) => void, changeValueH: (v: number) => void };

function update() {
    const hsb = RGB2HSB({ red: props.stop.R, green: props.stop.G, blue: props.stop.B } as unknown as Color);
    if ((props.stop.R === 0 && props.stop.G === 0 && props.stop.B === 0) || hsb.s === 0) {
        S.value = Math.round(valueS.value * 100);
        H.value = Math.round(valueH.value);
    } else {
        S.value = Math.round(hsb.s * 100);
        H.value = Math.round(hsb.h);
        changeValueH(H.value)
    }
    B.value = Math.round(hsb.b * 100);
}

function focus(event: Event) {
    const target = event.target as HTMLInputElement;
    target.select();
}

function changeH(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = verifiedVal(parseInt(target.value), 0, 360);
    changeValueH(value);
    const rgb = HSB2RGB(value, S.value * 0.01, B.value * 0.01);
    emits('change', Object.assign({ ...props.stop }, { R: rgb.R, G: rgb.G, B: rgb.B }));
    target.blur();
}

function changeS(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = verifiedVal(parseInt(target.value), 0, 100);
    S.value = value;
    changeValueS(value * 0.01);
    const rgb = HSB2RGB(H.value, value * 0.01, B.value * 0.01);
    emits('change', Object.assign({ ...props.stop }, { R: rgb.R, G: rgb.G, B: rgb.B }));
    target.blur();
}

function changeB(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = verifiedVal(parseInt(target.value), 0, 100);
    B.value = value;
    const rgb = HSB2RGB(H.value, S.value * 0.01, value * 0.01);
    emits('change', Object.assign({ ...props.stop }, { R: rgb.R, G: rgb.G, B: rgb.B }));
    target.blur();
}

onUnmounted(watchEffect(update));
</script>

<template>
    <div class="inputs">
        <input :value="H" @focus="focus" @change="changeH" />
        <input :value="S" @focus="focus" @change="changeS" />
        <input :value="B" @focus="focus" @change="changeB" />
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