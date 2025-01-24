<script setup lang="ts">
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { HSB2RGB, RGB2HSB, verifiedVal } from "@/components/common/ColorPicker/utils";
import { onUnmounted, ref, watchEffect } from "vue";
import { Color } from "@kcdesign/data";

const props = defineProps<{ stop: RGBACatch }>();
const emits = defineEmits<{
    (e: "change", stop: RGBACatch): void;
}>();
const H = ref<number>(100);
const S = ref<number>(0);
const B = ref<number>(0);

function update() {
    const hsb = RGB2HSB({red: props.stop.R, green: props.stop.R, blue: props.stop.R} as unknown as Color);
    H.value = Math.round(hsb.h);
    S.value = Math.round(hsb.s * 100);
    B.value = Math.round(hsb.b * 100);
}

function focus(event: Event) {
    const target = event.target as HTMLInputElement;
    target.select();
}

function changeH(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = verifiedVal(parseInt(target.value), 0, 360);
    const rgb = HSB2RGB(value, S.value, B.value);
    emits('change', Object.assign({...props.stop}, {R: rgb.R, G: rgb.G, B: rgb.B}));
    target.blur();
}

function changeS(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = verifiedVal(parseInt(target.value), 0, 100);
    const rgb = HSB2RGB(H.value, value, B.value);
    emits('change', Object.assign({...props.stop}, {R: rgb.R, G: rgb.G, B: rgb.B}));
    target.blur();
}

function changeB(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = verifiedVal(parseInt(target.value), 0, 100);
    const rgb = HSB2RGB(H.value, S.value, value);
    emits('change', Object.assign({...props.stop}, {R: rgb.R, G: rgb.G, B: rgb.B}));
    target.blur();
}

onUnmounted(watchEffect(update));
</script>

<template>
    <div class="inputs">
        <input :value="H" @focus="focus" @change="changeH"/>
        <input :value="S" @focus="focus" @change="changeS"/>
        <input :value="B" @focus="focus" @change="changeB"/>
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