<script setup lang="ts">
import Station from "@/components/common/ColorPicker/Gradient/Station.vue";
import RGBAModel from "@/components/common/ColorPicker/RGBAModel/Index.vue";
import { GradientCatch } from "@/components/common/ColorPicker/Editor/gradientlineareditor";
import { onUnmounted, ref, watchEffect } from "vue";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";

const props = defineProps<{
    editor: ColorPickerEditor;
    data: GradientCatch;
}>();
const gradientStopAt = ref<number>(0);
const editor = props.editor;
const stop = ref<RGBACatch>(props.data.RGBAs[gradientStopAt.value]);

function createStop(cc: RGBACatch) {
    editor.createStop(cc);
}

function update() {
    stop.value = props.data.RGBAs[gradientStopAt.value];
}

function setColor(cc: RGBACatch) {
    editor.setStopColor(cc, gradientStopAt.value);
}

function dragBegin() {
    editor.dragStopBegin();
}

function dragging(cc: RGBACatch) {
    editor.draggingStop(cc, gradientStopAt.value);
}

function dragEnd() {
    editor.dragStopEnd();
}

function reverse() {
    editor.reverseStops();
}

function rotate() {
    editor.rotateStops();
}

onUnmounted(watchEffect(update));
</script>

<template>
    <Station v-model:at="gradientStopAt" :gradient="data" @create-stop="createStop" @reverse="reverse"
             @rotate="rotate"/>
    <RGBAModel :stop="stop" @change="setColor" @drag-begin="dragBegin" @dragging="dragging" @drag-end="dragEnd"/>
</template>