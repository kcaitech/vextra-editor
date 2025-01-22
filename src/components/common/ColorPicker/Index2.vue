<script setup lang="ts">
import PopoverHeader from "@/components/common/PopoverHeader.vue";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import RecentlyColor from "@/components/common/ColorPicker/RecentlyColor.vue";
import RGBAModel from "@/components/common/ColorPicker/RGBAModel/Index.vue";
import ColorType from "@/components/common/ColorPicker/ColorType.vue";
import { FillType } from "@kcdesign/data";
import Station from "@/components/common/ColorPicker/Gradient/Station.vue";
import { GradientCatch } from "@/components/common/ColorPicker/Editor/gradientlineareditor";
import { PatternCatch } from "@/components/common/ColorPicker/Editor/patternlineareditor";
import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/fillmanager";

const WIDTH = 250;
const WIDTH_CSS = `${WIDTH}px`;

const props = defineProps<{
    editor: ColorPickerEditor;

    type: string;
    color: RGBACatch;

    gradient?: GradientCatch;
    media?: PatternCatch;
}>();
const emits = defineEmits(["close"]);

const editor = props.editor;

function change(cc: RGBACatch) {
    editor.setColor(cc);
}

</script>

<template>
    <div id="color-piker-gen-2-panel" :style="{width: WIDTH_CSS}">
        <PopoverHeader title="新颜色面板" :create="false" @close="emits('close')"/>
        <ColorType :options="[FillType.Pattern]" :value="type"/>
        <Station v-if="gradient" :gradient="gradient"/>
        <RGBAModel :stop="color" @change="change"/>
        <RecentlyColor/>
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