<script setup lang="ts">
import { TextShape } from '@/data/shape';
import { h, defineProps, onMounted, onUnmounted, ref } from 'vue';
import { render as r } from "@/render/text"

const props = defineProps<{ data: TextShape }>();
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
    return r(h, props.data, reflush.value !== 0 ? reflush.value : undefined);
}

</script>

<template>
    <render />
</template>