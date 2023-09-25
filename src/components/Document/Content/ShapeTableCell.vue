<script setup lang="ts">
import { ShapeFrame, TableCell } from '@kcdesign/data';
import { h } from 'vue';
import { renderTableCell as r } from "@kcdesign/data";
import { IMAGE_DEFAULT, initCommonShape } from './common';

const props = defineProps<{ data: TableCell, frame: ShapeFrame }>();
const common = initCommonShape(props);

function render() {
    const ret = r(h, props.data, props.frame, IMAGE_DEFAULT, common.reflush);
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