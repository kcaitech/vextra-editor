<script setup lang="ts">
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import ColorModels from "@/components/common/ColorPicker/RGBAModel/Models/ColorModels.vue";
import Saturation from "@/components/common/ColorPicker/RGBAModel/Saturation.vue";
import Typical from "@/components/common/ColorPicker/Preset/Typical.vue";
import RecentlyColor from "@/components/common/ColorPicker/RecentlyColor.vue";
import { provide, ref } from "vue";

const valueS = ref<number>(0)
const valueH = ref<number>(0)

function changeValueS(v: number) {
    valueS.value = v;
}

function changeValueH(v: number) {
    valueH.value = v;
}

defineProps<{ stop: RGBACatch }>();

provide('HSB', { valueS, valueH, changeValueS, changeValueH });
</script>

<template>
    <Saturation :stop="stop" v-bind="$attrs" />
    <ColorModels :stop="stop" v-bind="$attrs" />
    <Typical v-bind="$attrs" />
    <RecentlyColor v-bind="$attrs" />
</template>