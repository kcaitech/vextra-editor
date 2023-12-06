<script setup lang="ts">
import { h, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { Artboard, exportInnerSvg, renderArtboard as r } from '@kcdesign/data';
import { SymbolRefShape, SymbolShape, RenderTransform } from "@kcdesign/data";
import { RenderCtx, initCommonShape } from './common';
import comsMap from './comsmap';

const props = defineProps<{
    renderCtx?: RenderCtx,
    data: Artboard,
    transx?: RenderTransform,
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

const updater = () => {
    common.incReflush();
}

function render() {

    // isRenderAsSvg = !!(props.renderCtx?.checkRenderAsSvg(props.data, updater));

    // if (isRenderAsSvg) {

    //     const startTime = Date.now();
    //     const svg = exportInnerSvg(props.data);
    //     const href = "data:image/svg+xml," + ((svg.replaceAll("#", "%23")));
    //     console.log("render " + props.data.name + " as svg cost: " + (Date.now() - startTime) + "ms")
    //     const frame = props.data.frame;
    //     const image = h('image', { href, x: frame.x, y: frame.y, width: frame.width, height: frame.height, reflush: common.reflush })
    //     return image;

    // }
    // else {
        const startTime = Date.now();
        const ret = r(h, props.data, comsMap, props.transx, props.varsContainer, common.reflush);
        console.log("render " + props.data.name + " as native cost: " + (Date.now() - startTime) + "ms")
        return ret;
    // }
}

</script>

<template>
    <render></render>
</template>

<style scoped></style>