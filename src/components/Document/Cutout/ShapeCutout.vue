<script setup lang="ts">
import { Matrix, PageView, CutoutShapeView, CutoutShape } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { Context } from '@/context';
import renderCutout from './renderCutout.vue';
import { Selection } from '@/context/selection';

const props = defineProps<{
    context: Context
    data: PageView,
    matrix: Matrix,
    transform: number[],
}>()
const cutoutShapes = ref<CutoutShape[]>([]);

const getCutoutShape = () => {
    const page = props.context.selection.selectedPage;
    if (page) {
        cutoutShapes.value = Array.from(page.data.cutouts.values());
    }
}
const watcher = (...args: any[]) => {
    if (args.includes('shape-frame')) return;
    getCutoutShape();
}
const stopWatch = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
})

const selected_watcher = (t: number) => {
    if (t === Selection.CHANGE_PAGE) {
        getCutoutShape();
    } else if (t === Selection.CHANGE_SHAPE) {
        getCutoutShape();
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
        :data="(item as CutoutShape)" :matrix="matrix"></component>
</template>

<style lang="scss" scoped></style>