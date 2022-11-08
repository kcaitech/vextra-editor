<script setup lang="ts">
import { ImageShape } from '@/data/shape';
import { computed } from '@vue/reactivity';
import { defineProps, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{ data: ImageShape, boolop: number }>();
const url = ref('');
const frame = computed(() => {
    return props.data.frame;
})
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

</script>

<template>
    <image :xlink:href="url" :x="frame.x" :y="frame.y" :width="frame.width" :height="frame.height" :reflush="reflush" />
</template>