<script setup lang="ts">
import { h } from 'vue';
import { TableShape, RenderTransform, SymbolRefShape , SymbolShape } from "@kcdesign/data";
import { renderTable as r } from "@kcdesign/data";
import { initCommonShape } from './common';
import comsMap from './comsmap';

const props = defineProps<{
    data: TableShape, transx?: RenderTransform,
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();

const common = initCommonShape(props);

function bubbleupdate() {
    common.incReflush();
}

function render() {
    const ret = r(h, props.data, comsMap, props.transx, props.varsContainer, bubbleupdate, common.reflush);
    return ret;
}

</script>

<template>
    <render />
</template>
