<script lang="ts" setup>
import { Color } from "@kcdesign/data";
import { onUnmounted, ref, watch } from "vue";

const props = defineProps<{ params: { data: Color, disabledAlpha: boolean } }>();
const d = props.params.data;
const rgb = ref<string>(`rgb(${d.red}, ${d.green}, ${d.blue})`);
const rgba = ref<string>(`rgba(${d.red}, ${d.green}, ${d.blue}, ${d.alpha})`);

onUnmounted(watch(() => props.params, () => {
    const d = props.params.data;
    rgb.value = `rgb(${d.red}, ${d.green}, ${d.blue})`;
    rgba.value = `rgba(${d.red}, ${d.green}, ${d.blue}, ${d.alpha})`;
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