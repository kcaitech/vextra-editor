<script setup lang="ts">
import { TextShape } from '@kcdesign/data/data/shape';
import { h, defineProps, onMounted, onUnmounted, ref, watch } from 'vue';
import { render as r } from "@/render/text"

const props = defineProps<{ data: TextShape }>();
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
function render() {
    return r(h, props.data, reflush.value !== 0 ? reflush.value : undefined);
}

</script>

<template>
    <render />
</template>