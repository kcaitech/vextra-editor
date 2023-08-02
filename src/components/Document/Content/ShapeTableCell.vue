<script setup lang="ts">
import { TableCell } from '@kcdesign/data';
import { h, onMounted, onUnmounted, ref, watch } from 'vue';
import { renderTableCell as r } from "@kcdesign/data";
import { asyncLoadFillImages } from './common';

const props = defineProps<{ data: TableCell }>();
const reflush = ref(0);
const url = ref('');
let stopFillWatch = asyncLoadFillImages(props.data, reflush);
const watcher = () => {
    reflush.value++;
    if (props.data.isImageCell() && url.value.length === 0) props.data.loadImage().then((val) => {
        url.value = val;
    })
}
const stopWatch = watch(() => props.data, (value, old) => {
    stopFillWatch();
    stopFillWatch = asyncLoadFillImages(value, reflush);
    old.unwatch(watcher);
    value.watch(watcher);
})
onMounted(() => {
    if (props.data.isImageCell() && url.value.length === 0) props.data.loadImage().then((val) => {
        url.value = val;
    })
    props.data.watch(watcher);
})
onUnmounted(() => {
    stopFillWatch();
    props.data.unwatch(watcher);
    stopWatch();
})
function render() {
    return r(h, props.data, url.value, reflush.value !== 0 ? reflush.value : undefined);
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