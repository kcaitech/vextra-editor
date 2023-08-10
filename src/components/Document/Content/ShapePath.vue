
<script setup lang="ts">
import { PathShape } from '@kcdesign/data';
import { h, onMounted, onUnmounted, ref, watch } from 'vue';
import { renderPathShape as r } from "@kcdesign/data";
import { asyncLoadFillImages } from './common';

const props = defineProps<{ data: PathShape }>();
const reflush = ref(0);
let stopFillWatch = asyncLoadFillImages(props.data, reflush);
const watcher = () => {
    reflush.value++;
}
const stopWatch = watch(() => props.data, (value, old) => {
    stopFillWatch();
    stopFillWatch = asyncLoadFillImages(props.data, reflush);
    old.unwatch(watcher);
    value.watch(watcher);
})
onMounted(() => {
    props.data.watch(watcher);
})
onUnmounted(() => {
    stopFillWatch();
    props.data.unwatch(watcher);
    stopWatch();
})
function render() {
    return r(h, props.data, reflush.value !== 0 ? reflush.value : undefined);
}
</script>

<template>
    <render />
</template>