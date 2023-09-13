<script setup lang="ts">
import { OverrideShape, ShapeFrame, SymbolRefShape, TableCell } from '@kcdesign/data';
import { h } from 'vue';
import { renderTableCell as r } from "@kcdesign/data";
import { IMAGE_DEFAULT, initCommonShape } from './common';

const props = defineProps<{ data: TableCell, frame: ShapeFrame, overrides?: SymbolRefShape[] }>();
const common = initCommonShape(props);

function render() {
    const consumes: OverrideShape[] = [];
    const ret = r(h, props.data, props.frame, IMAGE_DEFAULT, props.overrides, consumes, common.reflush);
    common.updateComsumeOverride(consumes);
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