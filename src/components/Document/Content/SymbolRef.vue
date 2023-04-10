<script setup lang="ts">
import { h, defineProps, onMounted, onUnmounted, ref, watch } from 'vue';
import comsMap from './comsmap'
import { render as r } from "@/render/symbolref"
import { SymbolRefShape } from '@kcdesign/data/data/shape';

const props = defineProps<{ data: SymbolRefShape }>();

const reflush = ref(0);
function watcher() {
    reflush.value++;
}
const stopWatch = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
})
onMounted(() => {
    props.data.loadSymbol();
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    stopWatch();
})
function render() {
    return r(h, props.data, comsMap, reflush.value !== 0 ? reflush.value : undefined);
}

</script>

<template>
    <render />
</template>

<style scoped>

</style>