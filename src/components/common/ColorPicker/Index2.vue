<script setup lang="ts">
import PopoverHeader from "@/components/common/PopoverHeader.vue";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import ColorType from "@/components/common/ColorPicker/ColorType.vue";
import { FillType } from "@kcdesign/data";
import { GradientCatch } from "@/components/common/ColorPicker/Editor/gradientlineareditor";
import { PatternCatch } from "@/components/common/ColorPicker/Editor/patternlineareditor";
import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import Solid from "@/components/common/ColorPicker/Solid/Index.vue";
import GradientView from "@/components/common/ColorPicker/Gradient/Index.vue";

import { computed, onMounted, onUnmounted, ref, watchEffect } from "vue";

const WIDTH = 250;
const WIDTH_CSS = `${WIDTH}px`;

const props = defineProps<{
    editor: ColorPickerEditor;

    type: string;
    color: RGBACatch;

    gradient?: GradientCatch;
    pattern?: PatternCatch;
}>();
const emits = defineEmits(["close"]);

const compos = computed(() => {
    if (props.gradient) return GradientView;
    else return Solid;
});

const data = ref<RGBACatch | GradientCatch | PatternCatch>(props.color);

const editor = props.editor;

function modifyFillType(type: string) {
    if (type !== props.type) editor.modifyFillType(type);
}

function update() {
    if (props.gradient) data.value = props.gradient;
    else if (props.pattern) data.value = props.pattern;
    else data.value = props.color;
}

onUnmounted(watchEffect(update));
</script>

<template>
    <div id="color-piker-gen-2-panel" :style="{width: WIDTH_CSS}">
        <PopoverHeader title="新颜色面板" :create="false" @close="emits('close')"/>
        <ColorType :options="[FillType.Pattern]" :value="type" @change="modifyFillType"/>
        <component :is="compos" :editor="editor" :data="data as any"/>
    </div>
</template>

<style scoped lang="scss">
#color-piker-gen-2-panel {
    position: fixed;
    height: fit-content;
    background-color: var(--theme-color-anti);
    box-shadow: 0 4px 16px #0000002e;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: space-between;
}
</style>