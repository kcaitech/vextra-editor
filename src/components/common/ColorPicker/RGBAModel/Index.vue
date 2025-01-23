<script setup lang="ts">
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import ColorModels from "@/components/common/ColorPicker/RGBAModel/Models/ColorModels.vue";
import Saturation from "@/components/common/ColorPicker/RGBAModel/Saturation.vue";
import Typical from "@/components/common/ColorPicker/Preset/Typical.vue";
defineProps<{ stop: RGBACatch}>();
</script>

<template>
    <Saturation :stop="stop" v-bind="$attrs"/>
    <ColorModels :stop="stop" v-bind="$attrs"/>
    <Typical v-bind="$attrs"/>
</template>