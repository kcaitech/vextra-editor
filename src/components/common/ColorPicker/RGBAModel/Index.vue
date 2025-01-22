<script setup lang="ts">
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import ColorModels from "@/components/common/ColorPicker/RGBAModel/Models/ColorModels.vue";
import Hue from "@/components/common/ColorPicker/RGBAModel/Hue.vue";
import Saturation from "@/components/common/ColorPicker/RGBAModel/Saturation.vue";
import Typical from "@/components/common/ColorPicker/Preset/Typical.vue";

const props = defineProps<{ stop: RGBACatch }>();

</script>

<template>
    <Saturation/>
    <Hue :stop="stop"/>
    <ColorModels :stop="stop"/>
    <Typical v-bind="$attrs"/>
</template>

<style scoped lang="scss">

</style>