<script setup lang="ts">
import { ImageShape } from '@kcdesign/data';
import { ref, onMounted, onUnmounted, h, watch } from 'vue';
import { renderImage as r } from "@kcdesign/data"

const props = defineProps<{ data: ImageShape }>();
const url = ref('');
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
const stopWatch = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
})
onMounted(() => {
    props.data.loadImage().then((val) => {
        console.log('val', val);
        url.value = val;
    })
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    stopWatch();
})
const render = () => {
    return r(h, props.data, url.value, reflush.value !== 0 ? reflush.value : undefined);
}

</script>

<template>
    <render></render>
</template>