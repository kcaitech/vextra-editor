<script setup lang="ts">
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { getRGBFromInputEvent } from "@/components/Document/Attribute/basic";
import { ref } from "vue";

const props = defineProps<{ stop: RGBACatch }>();
const emits = defineEmits<{
    (e: "change", stop: RGBACatch): void;
}>();

function rgbToHex(R: number, G: number, B: number) {
    const toHex = (color: number) => {
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