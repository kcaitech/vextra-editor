<script setup lang="ts">
import { TextShape } from '@/data/shape';
import { h, defineProps, onMounted, onUnmounted, ref } from 'vue';

// https://zhuanlan.zhihu.com/p/338634062
const getCanvas = (() => {
    let canvas: HTMLCanvasElement | undefined;
    return () => {
        if (!canvas) canvas = document.createElement("canvas");
        return canvas;
    }
})();

function getTextWidth(text: string, font: string): number {
    // re-use canvas object for better performance
    const canvas = getCanvas();
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}

const props = defineProps<{ data: TextShape, boolop: number }>();
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
    let text = props.data.text;
    let pc = text.paraCount;
    let childs = [];
    let y = 0;
    for (let i = 0; i < pc; i++) {
        let para = text.getParaByIndex(i);
        let paraText = para.text;
        const sc = para.spansCount;
        let lineHeight = 0;

        for (let j = 0; j < sc; j++) {
            let span = para.getSpanByIndex(j);
            let size: number = span.fontSize || 0;
            lineHeight = Math.max(lineHeight, size);
        }
        y = y + lineHeight;
        let x = 0;
        let index = 0;
        for (let j = 0; j < sc;) {
            let span = para.getSpanByIndex(j);
            const text = paraText.substring(index, index + span.length);
            const font = "normal " + span.fontSize + "px " + span.fontName;
            childs.push(h('text', { x, y, style: { fill: span.color?.toRGBA(), font } }, text));
            j++;
            if (j < sc) {
                index = index + span.length;
                x = x + getTextWidth(text, font);
            }
        }
    }
    var frame = props.data.frame;
    return h('g', { transform: 'translate(' + frame.x + ',' + frame.y + ')' , reflush: reflush.value,}, childs);
}

</script>

<template>
    <render />
</template>