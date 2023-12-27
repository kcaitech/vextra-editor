<script setup lang="ts">
import { CutoutShape, Matrix, Page, PageView, CutoutShapeView, ShapeType } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { Context } from '@/context';
import renderCutout from './renderCutout.vue';
import { Selection } from '@/context/selection';
import { reactive } from 'vue';

const props = defineProps<{
    context: Context
    data: PageView,
    matrix: Matrix,
    transform: number[],
}>()
let cutoutShapes: CutoutShapeView[] = reactive([]);
const watcher = () => {
    const page = props.context.selection.selectedPage;
    if (page) {
        const shapes = page.childs || [];
        cutoutShapes = shapes.filter(v => v.type === ShapeType.Cutout) as CutoutShapeView[];
    }
}
const stopWatch = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
})
const selected_watcher = (t: number) => {
    if (t === Selection.CHANGE_PAGE) {
        const page = props.context.selection.selectedPage;
        if (page) {
            const shapes = page.childs || [];
            cutoutShapes = shapes.filter(v => v.type === ShapeType.Cutout) as CutoutShapeView[];
        }
        
    }
}
onMounted(() => {
    watcher();
    props.data.watch(watcher);
    props.context.selection.watch(selected_watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    props.context.selection.unwatch(selected_watcher);
    stopWatch();
})

</script>

<template>
    <component v-for="item in cutoutShapes" :key="item.id" :is="renderCutout" :context="context"
        :data="(item as CutoutShapeView)" :matrix="matrix"></component>
</template>

<style lang="scss" scoped></style>