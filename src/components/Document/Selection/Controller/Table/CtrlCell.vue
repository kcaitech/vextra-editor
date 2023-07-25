<script setup lang='ts'>
import { Context } from '@/context';
import { TableCell } from '@kcdesign/data';
import { onBeforeUpdate, onMounted, onUnmounted, watch } from 'vue';
import { throttle } from '../../common';
const props = defineProps<{
    shape: TableCell,
    matrix: number[],
    context: Context,
    lt: { x: number, y: number },
    rb: { x: number, y: number }
}>();

const update = throttle(_update, 5);
function _update() {

}

function selectionWatcher(...args: any[]) {
    // if (args.indexOf(Selection.CHANGE_TEXT) >= 0) update();
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
<template>
    <svg-icon icon-class="pattern-image" :width="`${rb.x - lt.x}px`" :height="`${rb.y - lt.y}px`" :style="{
        transform: `translate(${lt.x}px,${lt.y}px)`,
        left: '0px', top: '0px' , position: 'absolute' }"></svg-icon>
</template>
<style lang='scss' scoped></style>