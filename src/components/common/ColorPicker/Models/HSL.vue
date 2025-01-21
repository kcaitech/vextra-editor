<script setup lang="ts">
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import {  HSL2RGB, RGB2HSL, verifiedVal } from "@/components/common/ColorPicker/utils";
import { onUnmounted, ref, watchEffect } from "vue";
import { Color } from "@kcdesign/data";

const props = defineProps<{ stop: RGBACatch }>();
const emits = defineEmits(["change"]);
const H = ref<number>(360);
const S = ref<number>(0);
const L = ref<number>(0);

function update() {
    const hsl = RGB2HSL({red: props.stop.R, green: props.stop.R, blue: props.stop.R} as unknown as Color);
    H.value = hsl.h;
    S.value = hsl.s * 100;
    L.value = hsl.l * 100;
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
    const rgb = HSL2RGB({h: H.value, s: value, l: L.value});
    emits('change', Object.assign({...props.stop}, {R: rgb.R, G: rgb.G, B: rgb.B}));
    target.blur();
}

function changeL(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = verifiedVal(parseInt(target.value), 0, 100);
    const rgb = HSL2RGB({h: H.value, s: S.value, l: value});
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