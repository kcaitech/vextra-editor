<script setup lang="ts">
import { ImageShape } from '@/data/data/shape';
import { defineProps, ref, onMounted, onUnmounted, h } from 'vue';
import { render as r } from "@/render/image"

const props = defineProps<{ data: ImageShape }>();
const url = ref('');
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
onMounted(() => {
    props.data.loadImage().then((val) => {
        url.value = val;
    })
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
})
const render = () => {
    return r(h, props.data, url.value, reflush.value !== 0 ? reflush.value : undefined);
}

</script>

<template>
    <render></render>
</template>