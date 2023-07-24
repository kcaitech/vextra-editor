<script setup lang='ts'>
import { Context } from '@/context';
import { TableCell } from '@kcdesign/data';
import { onMounted, onUnmounted, watch } from 'vue';
import { Selection } from '@/context/selection';
import { throttle } from '../../common';
const props = defineProps<{
    shape: TableCell,
    matrix: number[],
    context: Context
}>();

const update = throttle(_update, 5);
function _update() {

}

function selectionWatcher(...args: any[]) {
    if (args.indexOf(Selection.CHANGE_TEXT) >= 0) update();
}

watch(() => props.matrix, () => {
    update();
})

watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})

onMounted(() => {
    const selection = props.context.selection;
    props.shape.watch(update);
    selection.watch(selectionWatcher);
    update();
})

onUnmounted(() => {
    const selection = props.context.selection;
    props.shape.unwatch(update);
    selection.unwatch(selectionWatcher);
})

</script>
<template></template>
<style lang='scss' scoped></style>