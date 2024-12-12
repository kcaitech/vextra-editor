<script setup lang="ts">
// page view
import { onMounted, ref } from "vue";
import { Context } from "@/context";
import { Matrix, PageView } from "@kcdesign/data";

type Props = {
    context: Context;
    params: {
        data: PageView
        matrix: Matrix
        onRenderDone?: () => void,
        onContentVisible?: () => void,
    }
}

const props = defineProps<Props>();

const canvas = ref<HTMLCanvasElement | null>(null);
const width = ref<number>(1000);
const height = ref<number>(800);

function register() {
    if (canvas.value) {
        const dpr = window.devicePixelRatio || 1;
        canvas.value.width = width.value * dpr;
        canvas.value.height = height.value * dpr;
        canvas.value.style.width = `${width.value}px`;
        canvas.value.style.height = `${height.value}px`;
        const ctx = canvas.value.getContext("2d");
        if (ctx) {
            props.context.render.registerRenderCtx(ctx);
            props.params.data.m_ctx.m_canvas = ctx;

        }
        props.params.data.render();
    }
}

onMounted(() => {
    register();
    props.context.setOnLoaded(() => {
        props.context.render.renderCtx.clearRect(0, 0, width.value, height.value);

        props.params.data.m_ctx.setReLayout(props.params.data);
        props.params.data.m_ctx.setDirty(props.params.data);
        props.params.data.layout();
        props.params.data.render();
    })

    // dev config
    document.addEventListener("keydown", (e) => {
        if (e.repeat) return;
        if (e.code === "F5") {
            props.context.render.renderCtx.clearRect(0, 0, width.value, height.value);

            props.params.data.m_ctx.setReLayout(props.params.data);
            props.params.data.m_ctx.setDirty(props.params.data);
            props.params.data.layout();
            props.params.data.render();

            e.preventDefault();
        }
    })
});
</script>
<template>
    <canvas ref="canvas" :style="{transform:props.params.matrix.toString()}">
        The current browser does not support Canvas API
    </canvas>
</template>
<style scoped lang="scss">
canvas {
    position: absolute;
    transform-origin: top left;
}
</style>