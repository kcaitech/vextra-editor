<script setup lang="ts">

import { onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps<{ params: { data: string }, opacity: number }>();
const src = ref<string>('');

function draw() {
    src.value = props.params.data;
}

onMounted(draw);
onUnmounted(watch(() => props.params, draw));
</script>
<template>
    <div style="width: 100%; height: 100%; background-color: transparent; position: absolute;">
        <img :src="src" alt="fill-image" :style="{width: '100%', height: '100%','object-fit': 'cover', opacity}">
    </div>
</template>
