<script setup lang="ts">
import { ImageShape } from '@/data/shape';
import { computed } from '@vue/reactivity';
import { defineProps, ref, onMounted } from 'vue';

const props = defineProps<{ data: ImageShape, boolop: number }>();
const url = ref('');
const frame = computed(() => {
    return props.data.frame;
})

onMounted(() => {
    props.data.loadImage().then((val) => {
        url.value = val;
    })
})

</script>

<template>
    <image :xlink:href="url" :x="frame.x" :y="frame.y" :width="frame.width" :height="frame.height" />
</template>