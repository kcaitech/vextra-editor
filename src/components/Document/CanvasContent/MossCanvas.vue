<script setup lang="ts">
// page view
import { onMounted, ref } from "vue";
import { Context } from "@/context";
import { Matrix, PageView } from "@kcdesign/data";


type Props = {
    context: Context;
}

const props = defineProps<Props>();

const canvas = ref<HTMLCanvasElement | null>(null);
const width = ref<number>(300);
const height = ref<number>(150);

function register() {
    if (canvas.value) {
        const ctx = canvas.value.getContext("2d");
        if (ctx) props.context.render.registerRenderCtx(ctx);
    }
}

onMounted(() => {
    register();
});
</script>
<template>
    <canvas ref="canvas" :width="width" :height="height">The current browser does not support Canvas API</canvas>
</template>
<style scoped lang="scss">
canvas {
    position: absolute;
    transform-origin: top left;
}
</style>