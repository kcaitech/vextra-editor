/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

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
import Pattern from "@/components/common/ColorPicker/Pattern/Index.vue"

import { computed, onUnmounted, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";

const WIDTH = 250;
const WIDTH_CSS = `${WIDTH}px`;

const props = defineProps<{
    editor: ColorPickerEditor;

    type: string;
    color: RGBACatch;

    gradient?: GradientCatch;
    pattern?: PatternCatch;
    include?: FillType[];
    title?: string;
}>();
const emits = defineEmits(["close"]);

const t = useI18n().t;
const title = ref<string>(props.title || t("attr.fill"));

const compos = computed(() => {
    if (props.gradient) return GradientView;
    else if (props.pattern) return Pattern;
    else return Solid;
});

const data = ref<RGBACatch | GradientCatch | PatternCatch>(props.color);
const options = computed(() => props.include ? [...props.include] : [FillType.SolidColor, FillType.Gradient, FillType.Pattern]);

const editor = props.editor;

function modifyFillType(type: string) {
    if (type !== props.type) editor.modifyFillType(type);
}

function update() {
    if (props.gradient) data.value = props.gradient;
    else if (props.pattern) data.value = props.pattern;
    else data.value = props.color;
}

const stopWatch = watchEffect(update);
onUnmounted(() => {
    stopWatch();
    editor.onUnmounted();
});
</script>

<template>
    <div id="color-piker-gen-2-panel" :style="{width: WIDTH_CSS}">
        <PopoverHeader :title="title" :create="false" @close="emits('close')"/>
        <ColorType v-if="options.length" :options="options" :value="type" @change="modifyFillType"/>
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
    padding-bottom: 10px;
}
</style>