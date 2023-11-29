<script setup lang="ts">
import { RectShape, RenderTransform, SymbolRefShape, SymbolShape } from '@kcdesign/data';
import { h } from 'vue';
import { renderPathShape as r } from "@kcdesign/data";
import { initCommonShape } from './common';

const props = defineProps<{
    data: RectShape, transx?: RenderTransform,
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