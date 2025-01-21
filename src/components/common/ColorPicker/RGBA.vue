<script setup lang="ts">
import { ref } from "vue";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";


const emits = defineEmits(["change"]);
const {data} = defineProps<{ data: RGBACatch }>();

const ipt1 = ref<number>(data.R);
const ipt2 = ref<number>(data.G);
const ipt3 = ref<number>(data.B);
const ipt4 = ref<number>(data.A);

const format = ref<'hex' | 'rgb' | 'hsl' | 'hsb'>('hex');

function modifyFormat() {}
</script>

<template>

</template>

<style scoped lang="scss">

</style>