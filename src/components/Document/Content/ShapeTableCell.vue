<script setup lang="ts">
import { ShapeFrame, TableCell, RenderTransform, SymbolRefShape, SymbolShape, Variable } from '@kcdesign/data';
import { h } from 'vue';
import { renderTableCell as r } from "@kcdesign/data";
import { IMAGE_DEFAULT, initCommonShape } from './common';

const props = defineProps<{
    data: TableCell, frame: ShapeFrame, transx?: RenderTransform,
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();
const common = initCommonShape(props);

function render() {
    const consumedVars: { slot: string, vars: Variable[] }[] = [];
    const ret = r(h, props.data, props.frame, IMAGE_DEFAULT, props.transx, props.varsContainer, consumedVars, common.reflush);
    common.watchVars(consumedVars);
    return ret;
}
</script>

<template>
    <render></render>
</template>

<style scoped>
/* rect {
    background-color: aqua;
} */
</style>