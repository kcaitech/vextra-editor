/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import RGBAModel from "@/components/common/ColorPicker/RGBAModel/Index.vue";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";

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