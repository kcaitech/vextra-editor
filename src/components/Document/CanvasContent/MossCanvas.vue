<script setup lang="ts">
// page view
import { onMounted, ref } from "vue";
import { Context } from "@/context";
import { Matrix, PageView } from "@kcdesign/data";


type Props = {
    context: Context;
}

const props = defineProps<Props>();

const canvas = ref<HTMLCanvasElement | null>(null)

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
    <canvas ref="canvas"/>
</template>
<style scoped lang="scss">
canvas {
    position: absolute;
    transform-origin: top left;
    width: 100%;
    height: 100%;
}
</style>