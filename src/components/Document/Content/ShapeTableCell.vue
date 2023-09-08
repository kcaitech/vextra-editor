<script setup lang="ts">
import { OverridesGetter, ShapeFrame, TableCell } from '@kcdesign/data';
import { h } from 'vue';
import { renderTableCell as r } from "@kcdesign/data";
import { initCommonShape } from './common';

const props = defineProps<{ data: TableCell, frame: ShapeFrame, overrides?: OverridesGetter }>();
const init = initCommonShape(props);

function render() {
    return r(h, props.data, props.frame, init.override, init.reflush);
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