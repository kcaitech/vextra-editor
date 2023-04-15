<script setup lang="ts">
import { h, ref, defineProps, onMounted, onUnmounted, watch } from 'vue';
import comsMap from './comsmap'
import { Artboard } from '@kcdesign/data/data/artboard';
import { render as r } from "@/render/artboard"

const props = defineProps<{ data: Artboard }>();
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
const stopWatch = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
})
onMounted(() => {
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    stopWatch();
})
const render = () => {
    return r(h, props.data, comsMap, reflush.value !== 0 ? reflush.value : undefined)
}

</script>

<template>
    <render></render>
</template>

<style scoped>

</style>