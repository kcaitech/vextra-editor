<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { PatternFilter } from "@/components/common/ColorPicker/Editor/patternlineareditor";
import PatternToolBit from "@/components/common/ColorPicker/PatternToolBit.vue";
import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";

const props = defineProps<{
    editor: ColorPickerEditor;
    data: PatternFilter;
}>();

const t = useI18n().t;

function start() {

}

function modify(val: number, type: string) {
    console.log(type, val);
}

function end() {
}

</script>

<template>
    <div class="tool">
        <pattern-tool-bit :type="t('attr.brightness')" :value="data.exposure ?? 0" @drag-start="start"
                          @dragging="(val: number) => modify(val, 'exposure')" @drag-end="end"/>
        <pattern-tool-bit :type="t('attr.contrast')" :value="data.contrast ?? 0" @drag-start="start"
                          @dragging="(val: number) => modify(val, 'contrast')" @drag-end="end"/>
        <pattern-tool-bit :type="t('attr.saturation')" :value="data.saturation ?? 0" @drag-start="start"
                          @dragging="(val: number) => modify(val, 'saturation')" @drag-end="end"/>
        <pattern-tool-bit :type="t('attr.temperature')" :value="data.temperature ?? 0" @drag-start="start"
                          @dragging="(val: number) => modify(val, 'temperature')" @drag-end="end"/>
        <pattern-tool-bit :type="t('attr.tint')" :value="data.tint ?? 0" @drag-start="start"
                          @dragging="(val: number) => modify(val, 'tint')" @drag-end="end"/>
        <pattern-tool-bit :type="t('attr.shadow')" :value="data.shadow ?? 0" @drag-start="start"
                          @dragging="(val: number) => modify(val, 'shadow')" @drag-end="end"/>
        <pattern-tool-bit :type="t('attr.hue')" :value="(data.hue ?? 0) * (100 / 180)" @drag-start="start"
                          @dragging="(val: number) => modify(val, 'hue')" @drag-end="end"/>
    </div>
</template>

<style scoped lang="scss">
.tool {
    width: 100%;
    display: flex;
    flex-direction: column;
}
</style>