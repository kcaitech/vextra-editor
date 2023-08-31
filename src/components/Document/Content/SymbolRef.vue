<script setup lang="ts">
import { h, onMounted, onUnmounted, ref, watch } from 'vue';
import comsMap from './comsmap'
import { renderSymbolRef as r } from "@kcdesign/data"
import { SymbolRefShape } from '@kcdesign/data';

const props = defineProps<{ data: SymbolRefShape }>();
props.data.loadSymbol();

const reflush = ref(0);
function watcher() {
    reflush.value++;
}
const stopWatch = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
    value.loadSymbol();
})
onMounted(() => {
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