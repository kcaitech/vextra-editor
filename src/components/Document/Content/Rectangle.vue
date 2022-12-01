<script setup lang="ts">
import { Shape } from '@/data/shape';
import { h, defineProps, onMounted, onUnmounted, ref } from 'vue';
import { render as r } from "@/render/rectangle";

const props = defineProps<{ data: Shape, boolop: number }>();
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
onMounted(() => {
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
})
function render() {
    return r(h, props.data, reflush.value);
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