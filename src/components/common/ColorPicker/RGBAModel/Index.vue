<script setup lang="ts">
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import ColorModels from "@/components/common/ColorPicker/RGBAModel/Models/ColorModels.vue";
import Hue from "@/components/common/ColorPicker/RGBAModel/Hue.vue";
import Saturation from "@/components/common/ColorPicker/RGBAModel/Saturation.vue";

const props = defineProps<{ stop: RGBACatch }>();
const emits = defineEmits(["change"]);

</script>

<template>
    <Saturation/>
    <Hue :stop="stop" @change="emits('change')"/>
    <ColorModels :stop="stop" @change="emits('change')"/>
</template>

<style scoped lang="scss">

</style>