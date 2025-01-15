<script lang="ts" setup>
import { Color } from "@kcdesign/data";
import { onUnmounted, ref, watch } from "vue";

const {params} = defineProps<{ params: { data: Color, disabledAlpha: boolean } }>();
const rgb = ref<string>(`rgb(${params.data.red}, ${params.data.green}, ${params.data.blue})`);
const rgba = ref<string>(`rgba(${params.data.red}, ${params.data.green}, ${params.data.blue}, ${params.data.alpha})`);

onUnmounted(watch(() => params, () => {
    const data = params.data;
    rgb.value = `rgb(${data.red}, ${data.green}, ${data.blue})`;
    rgba.value = `rgba(${data.red}, ${data.green}, ${data.blue}, ${data.alpha})`;
}));
</script>
<template>
    <div class="block-solid">
        <div v-if="params.disabledAlpha" :style="{'background-color': rgba, width: '100%', height: '100%'}"/>
        <div v-else class="split">
            <div :style="{'background-color': rgb}"/>
            <div :style="{'background-color': rgba}"/>
        </div>
    </div>
</template>
<style scoped lang="scss">
.block-solid {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: transparent;

    .split {
        width: 100%;
        height: 100%;
        display: flex;

        > div {
            width: 50%;
            height: 100%;
        }
    }
}
</style>