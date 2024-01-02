<script setup lang="ts">
import { h, onMounted, onUnmounted, watch } from 'vue';
import { Artboard, renderArtboard as r } from '@kcdesign/data';
import { SymbolRefShape, SymbolShape } from "@kcdesign/data";
import { initCommonShape } from './common';
import comsMap from './comsmap';

const props = defineProps<{
    data: Artboard,
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();

let isRenderAsSvg = false;
let stopbubblewatch: (() => void) | undefined;
const common = initCommonShape(props);

const watcher = () => {
    if (isRenderAsSvg) common.incReflush();
}

onMounted(() => {
    stopbubblewatch = props.data.bubblewatch(watcher);
})
watch(() => props.data, (data, old) => {
    if (stopbubblewatch) stopbubblewatch();
    stopbubblewatch = props.data.bubblewatch(watcher);
});
onUnmounted(() => {
    if (stopbubblewatch) {
        stopbubblewatch();
        stopbubblewatch = undefined
    }
})

function render() {    
    const ret = r(h, props.data, comsMap, props.varsContainer, common.reflush);
    return ret;
}

</script>

<template>
    <render></render>
</template>

<style scoped></style>