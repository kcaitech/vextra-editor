<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    x: number,
    y: number,
    direction: "hor" | "vert",
    strokes: number[] // 宽度或者高度
}>();
const emits = defineEmits<{
    (e: 'clickStroke', idx: number): void,
    (e: 'rightClickStroke', idx: number): void,
    (e: 'clickDot', idx: number): void
}>();

// const strokePos = computed(() => {
//     let total = 0;
//     return props.strokes.map((val) => {
//         const ret = total;
//         total += val;
//         return {pos: ret, w: val};
//     })
// });

// px // 实际上浏览器的px需要乘上dpr
const strokeThick = 20;
const strokeRadius = 10;
const dotRadius = 10;
const dotStrokeGap = 2;

function render() {

}

</script>

<template>
    <render />
</template>
<style lang='scss' scoped>

</style>