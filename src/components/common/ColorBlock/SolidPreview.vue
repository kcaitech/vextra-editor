<script lang="ts" setup>
import { Color } from "@kcdesign/data";
import { onUnmounted, ref, watch } from "vue";

const {params} = defineProps<{ params: { data: Color } }>();
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
        <div :style="{'background-color': rgb}"/>
        <div :style="{'background-color': rgba}"/>
    </div>
</template>
<style scoped lang="scss">
.block-solid {
    width: 100%;
    height: 100%;
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADBJREFUOE9jfPbs2X8GPEBSUhKfNAPjqAHDIgz+//+PNx08f/4cfzoYNYCBceiHAQC5flV5JzgrxQAAAABJRU5ErkJggg==");
    background-size: auto 50%;
    display: flex;

    > div {
        width: 50%;
        height: 100%;
    }
}
</style>