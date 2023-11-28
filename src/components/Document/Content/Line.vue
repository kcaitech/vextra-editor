<script setup lang="ts">
import { RenderTransform, Shape, SymbolRefShape, SymbolShape, Variable } from '@kcdesign/data';
import { h } from 'vue';
import { renderLine as r } from "@kcdesign/data";
import { initCommonShape } from './common';

const props = defineProps<{
    data: Shape, transx?: RenderTransform,
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();
const common = initCommonShape(props);

function render() {
    const consumedVars: { slot: string, vars: Variable[] }[] = [];
    const ret = r(h, props.data, props.transx, props.varsContainer, consumedVars, common.reflush);
    common.watchVars(consumedVars);
    return ret;
}
</script>

<template>
    <render></render>
</template>