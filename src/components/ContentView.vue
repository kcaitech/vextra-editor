<script setup lang="ts">
import { Matrix } from '@/basic/matrix';
import { Context } from '@/context';
import { Page } from '@/data/page';
import { reactive, defineProps } from 'vue';
import PageView from './PageView.vue';

const props = defineProps<{context: Context, page: Page}>();
const matrix = reactive(new Matrix());

function onMouseWheel(e: WheelEvent) {
    const offsetX = e.offsetX;
    const offsetY = e.offsetY;
    const { x, y } = matrix.computeCoord(offsetX, offsetY);
    matrix.trans(-x, -y);
    const scale_delta = 1.05;
    const scale_delta_ = 1 / scale_delta;
    matrix.scale(Math.sign(e.deltaY) <= 0 ? scale_delta : scale_delta_);
    matrix.trans(x, y);
}

</script>

<template>
<div @wheel.passive="onMouseWheel">
    <PageView :context="props.context" :data="(props.page as Page)" :matrix="matrix.toString()"></PageView>
</div>
</template>

<style scoped>
div {
    background-color: var(--center-content-bg-color);
}
</style>