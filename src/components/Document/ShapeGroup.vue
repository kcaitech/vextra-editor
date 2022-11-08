<script setup lang="ts">
import { h, defineProps, onMounted, onUnmounted, ref } from 'vue';
import comsMap from './comsmap'
import { GroupShape } from "../data/shape";
import { render as gR } from "@/render/group";
import { transform } from '@/render/basic';

const props = defineProps<{ data: GroupShape, boolop: number }>();
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
    return transform(gR(props.data, props.boolop, comsMap, reflush.value), h);
}

</script>

<template>
    <render />
</template>
