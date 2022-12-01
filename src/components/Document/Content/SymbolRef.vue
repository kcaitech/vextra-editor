<script setup lang="ts">
import { h, defineProps, onMounted, onUnmounted, ref } from 'vue';
import comsMap from './comsmap'
import { SymbolRef } from "@/data/shape";
import { render as r } from "@/render/symbolref"

const props = defineProps<{ data: SymbolRef, boolop: number }>();

const reflush = ref(0);
function watcher() {
    reflush.value++;
}
onMounted(() => {
    props.data.loadSymbol();
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
})
function render() {
    return r(h, props.data, comsMap, reflush.value);
}

</script>

<template>
    <render />
</template>

<style scoped>

</style>