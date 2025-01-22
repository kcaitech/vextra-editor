<script setup lang="ts">
import PopoverHeader from "@/components/common/PopoverHeader.vue";
import { ref } from "vue";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import Typical from "@/components/common/ColorPicker/Preset/Typical.vue";
import RecentlyColor from "@/components/common/ColorPicker/RecentlyColor.vue";
import RGBAModel from "@/components/common/ColorPicker/RGBAModel/Index.vue";
import ColorType from "@/components/common/ColorPicker/ColorType.vue";
import { FillType } from "@kcdesign/data";

const WIDTH = 250;
const WIDTH_CSS = `${WIDTH}px`;
const emits = defineEmits(["close"]);

const rgba = ref<RGBACatch>({R: 255, G: 0, B: 0, A: 1, position: 1});

</script>

<template>
    <div id="color-piker-gen-2-panel" :style="{width: WIDTH_CSS}">
        <PopoverHeader title="新颜色面板" :create="false" @close="emits('close')"/>
        <ColorType :options="[FillType.Pattern]" :value="FillType.SolidColor"/>
        <RGBAModel :stop="rgba"/>
        <Typical/>
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
}
</style>