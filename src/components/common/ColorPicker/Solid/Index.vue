<script setup lang="ts">
import RGBAModel from "@/components/common/ColorPicker/RGBAModel/Index.vue";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { onMounted } from "vue";

const props = defineProps<{
    editor: ColorPickerEditor;
    data: RGBACatch;
}>();
const editor = props.editor;

function setColor(cc: RGBACatch) {
    editor.setSolidColor(cc);
}

function dragBegin() {
    editor.dragSolidBegin();
}

function dragging(cc: RGBACatch) {
    editor.solidDragging(cc);
}

function dragEnd() {
    editor.dragSolidEnd();
}
</script>

<template>
    <RGBAModel :stop="data" @change="setColor" @drag-begin="dragBegin" @dragging="dragging" @drag-end="dragEnd"/>
</template>