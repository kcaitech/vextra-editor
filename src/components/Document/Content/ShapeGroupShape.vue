<script setup lang="ts">
import { h, onMounted, onUnmounted, watch } from 'vue';
import { BoolShape, SymbolRefShape, SymbolShape } from "@kcdesign/data";
import { renderBoolOpShape as opr } from "@kcdesign/data";
import { initCommonShape } from './common';

const props = defineProps<{
    data: BoolShape, 
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();

let stopbubblewatch: (() => void) | undefined;
const common = initCommonShape(props, () => { 
    if (!stopbubblewatch) stopbubblewatch = props.data.bubblewatch(watcher);
});

const watcher = () => {
    common.incReflush();
}

onMounted(() => {
    stopbubblewatch = props.data.bubblewatch(watcher);
})
watch(() => props.data, (data, old) => {
    if (stopbubblewatch) {
        stopbubblewatch();
        stopbubblewatch = undefined
    }
    stopbubblewatch = props.data.bubblewatch(watcher);
});
onUnmounted(() => {
    if (stopbubblewatch) {
        stopbubblewatch();
        stopbubblewatch = undefined
    }
})

function render() {
    const ret = opr(h, props.data, props.varsContainer, common.reflush);
    return ret;
}

</script>

<template>
    <render />
</template>
