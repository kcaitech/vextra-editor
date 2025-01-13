<script setup lang="ts">

import { onMounted, onUnmounted, ref, watch } from "vue";

const {params} = defineProps<{ params: { data: string } }>();
const src = ref<string>('');

function draw() {
    src.value = params.data;
}

onMounted(draw);
onUnmounted(watch(() => params, draw));
</script>
<template>
    <div style="width: 100%; height: 100%; background-color: #fff">
        <img :src="src" alt="fill-image" style="width: 100%; height: 100%;object-fit: contain;">
    </div>
</template>
