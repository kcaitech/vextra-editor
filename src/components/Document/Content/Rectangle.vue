<script setup lang="ts">
import { Shape } from '@kcdesign/data';
import { h, onMounted, onUnmounted, ref, watch } from 'vue';
import { render as r } from "@/render/rectangle";
import { asyncLoadFillImages } from './common';

const props = defineProps<{ data: Shape }>();
const reflush = ref(0);
let stopFillWatch = asyncLoadFillImages(props.data, reflush);
const watcher = () => {
    reflush.value++;
}
const stopWatch = watch(() => props.data, (value, old) => {
    stopFillWatch();
    stopFillWatch = asyncLoadFillImages(value, reflush);
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
    <render></render>
</template>

<style scoped>
/* rect {
    background-color: aqua;
} */
</style>