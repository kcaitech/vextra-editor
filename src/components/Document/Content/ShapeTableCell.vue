<script setup lang="ts">
import { ShapeFrame, TableCell, SymbolRefShape, SymbolShape } from '@kcdesign/data';
import { h, onMounted } from 'vue';
import { renderTableCell as r } from "@kcdesign/data";
import { IMAGE_DEFAULT, initCommonShape } from './common';

const props = defineProps<{
    data: TableCell, frame: ShapeFrame, 
    varsContainer?: (SymbolRefShape | SymbolShape)[],
    bubbleupdate: () => void
}>();

let __save_rowspan: number | undefined;
let __save_colspan: number | undefined;
let __save_cellid = "";

onMounted(() => {
    __save_rowspan = props.data.rowSpan;
    __save_colspan = props.data.colSpan;
    __save_cellid = props.data.id;
});

const common = initCommonShape(props, (...args: any[]) => {
    if (props.data.id !== __save_cellid) {
        __save_rowspan = props.data.rowSpan;
        __save_colspan = props.data.colSpan;
        __save_cellid = props.data.id;
    }
    else if (props.data.rowSpan !== __save_rowspan || props.data.colSpan !== __save_colspan) {
        props.bubbleupdate();
    }
    else if (args.indexOf('borders') >= 0) {
        props.bubbleupdate();
    }
});

function render() {
    const ret = r(h, props.data, props.frame, IMAGE_DEFAULT, props.varsContainer, common.reflush);
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