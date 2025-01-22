<script setup lang="ts">
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { verifiedVal } from "@/components/common/ColorPicker/utils";

const props = defineProps<{ stop: RGBACatch }>();
const emits = defineEmits(["change"]);

function focus(event: Event) {
    const target = event.target as HTMLInputElement;
    target.select();
}

function changeR(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = verifiedVal(parseInt(target.value), 0, 255);
    emits('change', Object.assign({...props.stop}, {R: value}));
    target.blur();
}

function changeG(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = verifiedVal(parseInt(target.value), 0, 255);
    emits('change', Object.assign({...props.stop}, {G: value}));
    target.blur();
}

function changeB(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = verifiedVal(parseInt(target.value), 0, 255);
    emits('change', Object.assign({...props.stop}, {B: value}));
    target.blur();
}
</script>

<template>
    <div class="inputs">
        <input :value="stop.R" @focus="focus" @change="changeR"/>
        <input :value="stop.G" @focus="focus" @change="changeG"/>
        <input :value="stop.B" @focus="focus" @change="changeB"/>
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