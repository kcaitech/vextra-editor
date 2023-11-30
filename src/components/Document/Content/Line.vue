<script setup lang="ts">
import { RenderTransform, Shape, SymbolRefShape, SymbolShape } from '@kcdesign/data';
import { h } from 'vue';
import { renderLine as r } from "@kcdesign/data";
import { initCommonShape } from './common';

const props = defineProps<{
    data: Shape, transx?: RenderTransform,
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();
const common = initCommonShape(props);

function render() {
    const ret = r(h, props.data, props.transx, props.varsContainer, common.reflush);
    return ret;
}
</script>

<template>
    <render></render>
</template>