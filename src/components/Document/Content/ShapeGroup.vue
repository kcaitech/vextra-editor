<script setup lang="ts">
import { h, onMounted, onUnmounted, ref, watch } from 'vue';
import comsMap from './comsmap'
import { Shape, GroupShape } from "@kcdesign/data";
import { render as r } from "@/render/group";

const props = defineProps<{ data: GroupShape }>();
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
    const ret = r(h, props.data, comsMap, reflush.value !== 0 ? reflush.value : undefined);
    return ret;
}

</script>

<template>
    <render />
</template>
