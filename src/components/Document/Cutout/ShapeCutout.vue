<script setup lang="ts">
import { CutoutShape, Matrix, Page, Shape, ShapeType } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { Context } from '@/context';
import renderCutout from './renderCutout.vue';

const props = defineProps<{
    context: Context
    data: Page,
    matrix: Matrix,
    transform: number[],
}>()
const reflush = ref(0);
const cutoutShapes = ref<CutoutShape[]>([]);
const watcher = () => {
    reflush.value++;
    const shapes = props.data.childs;
    if (shapes.length > 0) {
        cutoutShapes.value = shapes.filter(v => v.type === ShapeType.Cutout) as CutoutShape[];
    } else {
        cutoutShapes.value = [];
    }
}
const stopWatch = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
})

onMounted(() => {
    watcher();
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    stopWatch();
})

</script>

<template>
    <component v-for="item in cutoutShapes" :key="item.id" :is="renderCutout" :context="context"
        :data="(item as CutoutShape)" :matrix="matrix"></component>
</template>

<style lang="scss" scoped></style>