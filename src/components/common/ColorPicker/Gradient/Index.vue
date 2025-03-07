/*
* Copyright (c) 2023-2024 vextra.io. All rights reserved.
*
* This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
* The full license text can be found in the LICENSE file in the root directory of this source tree.
*
* For more information about the AGPL-3.0 license, please visit:
* https://www.gnu.org/licenses/agpl-3.0.html
*/

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
const editor = props.editor;

const gradientStopAt = ref<number>((() => {
    const id = editor.context.color.selected_stop ?? props.data.stopIds[0];
    const index = props.data.stopIds.findIndex(i => i === id);
    return Math.max(0, index);
})());

const stop = ref<RGBACatch>(props.data.RGBAs[gradientStopAt.value]);

function update() {
    stop.value = props.data.RGBAs[gradientStopAt.value];
}

function colorCtxWatcher(t: any) {
    if (t === ColorCtx.CHANGE_STOP) {
        const id = editor.context.color.selected_stop;
        if (id === undefined) return;
        let index = props.data.stopIds.findIndex(i => i === id);
        if (index === -1) {
            index = Math.min(props.data.stopIds.length - 1, 0);
            editor.context.color.select_stop(props.data.stopIds[index]);
        }
        gradientStopAt.value = index;
    } else if (t === ColorCtx.STOP_DELETE) {
        if (props.data.RGBAs.length < 2) return;
        editor.removeStop(gradientStopAt.value);
        const index = gradientStopAt.value === props.data.stopIds.length - 1 ? 0 : gradientStopAt.value;
        const id = props.data.stopIds[index];
        editor.context.color.select_stop(id);
    }
}

function changeStop(id: string) {
    editor.context.color.select_stop(id);
}

function createStop(cc: RGBACatch) {
    const page = editor.context.selection.selectedPage!;
    const id = editor.createStop(cc);
    editor.context.nextTick(page, () => {
        editor.context.color.select_stop(id);
    })
}

function setColor(cc: RGBACatch) {
    editor.setStopColor(cc, gradientStopAt.value);
}

function dragBegin() {
    editor.dragStopBegin();
}

function dragging(cc: RGBACatch) {
    const id = editor.context.color.selected_stop;
    let index = props.data.stopIds.findIndex(i => i === id);
    if (index === -1) index = 0;
    gradientStopAt.value = index;
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

function dragStopBegin() {
    editor.dragStopPositionBegin();
}

function draggingStop(position: number) {
    const id = editor.context.color.selected_stop;
    let index = props.data.stopIds.findIndex(i => i === id);
    if (index === -1) index = 0;
    gradientStopAt.value = index;
    editor.draggingStopPosition(position, gradientStopAt.value);
}

function dragStopEnd() {
    editor.dragStopPositionEnd();
}

const stop1 = editor.context.color.watch(colorCtxWatcher);
const stop2 = watchEffect(update);
onUnmounted(() => {
    stop1();
    stop2();
});
</script>

<template>
    <Station :at="gradientStopAt" :gradient="data" @change-stop="changeStop" @create-stop="createStop"
        @reverse="reverse" @rotate="rotate" @drag-start="dragStopBegin" @dragging="draggingStop"
        @drag-end="dragStopEnd" />
    <RGBAModel :stop="stop" @change="setColor" @drag-begin="dragBegin" @dragging="dragging" @drag-end="dragEnd" />
</template>