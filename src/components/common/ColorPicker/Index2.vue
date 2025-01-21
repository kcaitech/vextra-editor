<script setup lang="ts">
import PopoverHeader from "@/components/common/PopoverHeader.vue";
import Saturation from "@/components/common/ColorPicker/Saturation.vue";
import { ref } from "vue";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import Hue from "@/components/common/ColorPicker/Hue.vue";
import Typical from "@/components/common/ColorPicker/Typical.vue";
import ColorModels from "@/components/common/ColorPicker/Models/ColorModels.vue";

const WIDTH = 250;
const WIDTH_CSS = `${WIDTH}px`;
const emits = defineEmits(["close"]);

const rgba = ref<RGBACatch>({R: 255, G: 0, B: 0, A: 1, position: 1});

</script>

<template>
    <div id="color-piker-gen-2-panel" :style="{width: WIDTH_CSS}">
        <PopoverHeader title="新颜色面板" :create="false" @close="emits('close')"/>
        <Saturation/>
        <Hue :stop="rgba"/>
        <ColorModels :stop="rgba"/>
        <Typical/>
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