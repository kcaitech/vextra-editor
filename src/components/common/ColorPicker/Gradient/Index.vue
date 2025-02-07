<script setup lang="ts">
import Station from "@/components/common/ColorPicker/Gradient/Station.vue";
import RGBAModel from "@/components/common/ColorPicker/RGBAModel/Index.vue";
import { GradientCatch } from "@/components/common/ColorPicker/Editor/gradientlineareditor";
import { onUnmounted, ref, watchEffect } from "vue";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { ColorCtx } from "@/context/color";

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
    editor.context.color.select_stop(props.data.stopIds[gradientStopAt.value] ?? props.data.stopIds[0]);
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

function colorCtxWatcher(t: any) {
    if (t === ColorCtx.CHANGE_STOP) {
        const id = editor.context.color.selected_stop;
        gradientStopAt.value = props.data.stopIds.findIndex(i => i === id);
    } else if (t === ColorCtx.STOP_DELETE) {
        if (props.data.RGBAs.length < 2) return;
        editor.removeStop(gradientStopAt.value);
    }
}

const stop1 = editor.context.color.watch(colorCtxWatcher);
const stop2 = watchEffect(update);
onUnmounted(() => {
    stop1();
    stop2();
});
</script>

<template>
    <Station v-model:at="gradientStopAt" :gradient="data" @create-stop="createStop" @reverse="reverse"
             @rotate="rotate"/>
    <RGBAModel :stop="stop" @change="setColor" @drag-begin="dragBegin" @dragging="dragging" @drag-end="dragEnd"/>
</template>