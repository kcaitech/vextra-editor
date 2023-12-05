<script setup lang="ts">
import { h, onMounted, onUnmounted, watch } from 'vue';
import { GroupShape, SymbolRefShape, SymbolShape, RenderTransform } from "@kcdesign/data";
import { renderBoolOpShape as opr } from "@kcdesign/data";
import { renderGroup as normalR } from "@kcdesign/data";
import comsMap from './comsmap';
import { initCommonShape } from './common';

const props = defineProps<{
    data: GroupShape, transx?: RenderTransform,
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();

let stopbubblewatch: (() => void) | undefined;
const common = initCommonShape(props, () => { 
    if (props.data.isBoolOpShape && !stopbubblewatch) stopbubblewatch = props.data.bubblewatch(watcher);
});

const watcher = () => {
    common.incReflush();
}

onMounted(() => {
    if (props.data.isBoolOpShape) stopbubblewatch = props.data.bubblewatch(watcher);
})
watch(() => props.data, (data, old) => {
    if (stopbubblewatch) {
        stopbubblewatch();
        stopbubblewatch = undefined
    }
    if (props.data.isBoolOpShape) stopbubblewatch = props.data.bubblewatch(watcher);
});
onUnmounted(() => {
    if (stopbubblewatch) {
        stopbubblewatch();
        stopbubblewatch = undefined
    }
})

function render() {

    const isBoolOpShape = props.data.isBoolOpShape;
    if (isBoolOpShape) {
        const ret = opr(h, props.data, props.transx, props.varsContainer, common.reflush);
        return ret;
    }

    const ret = normalR(h, props.data, comsMap, props.transx, props.varsContainer, common.reflush);
    return ret;
}

</script>

<template>
    <render />
</template>
