<script setup lang="ts">
import { h, defineProps, onMounted, onUnmounted, ref } from 'vue';
import { Shape } from "@/data/shape";
import { render as r } from "@/render/boolshape";

const props = defineProps<{ data: Shape, path: string }>();
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
    return r(h, props.data, props.path, reflush.value !== 0 ? reflush.value : undefined);
}

</script>

<template>
    <render />
</template>

<style scoped>

</style>