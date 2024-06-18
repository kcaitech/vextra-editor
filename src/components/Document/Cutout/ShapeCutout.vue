<script setup lang="ts">
import { Matrix, PageView, CutoutShapeView, CutoutShape, ShapeView, ShapeType } from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { Context } from '@/context';
import renderCutout from './renderCutout.vue';
import { Selection } from '@/context/selection';
import { throttle } from 'lodash';

const props = defineProps<{
    context: Context
    data: PageView,
    matrix: Matrix,
    transform: number[],
}>()
const cutoutShapes = ref<CutoutShapeView[]>([]);
const reflush = ref(0);

const _getCutoutShape = () => {
    const page = props.context.selection.selectedPage;
    if (page) {
        cutoutShapes.value = Array.from(page.cutoutList);
        nextTick(() => {
            reflush.value++;
        })
    }
}
const getCutoutShape = throttle(_getCutoutShape, 200);
const watcher = (...args: any[]) => {
    if (args.includes('shape-frame')) return;
    getCutoutShape();
}
const stopWatch = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
})

const selected_watcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        watch_shapes();
        props.context.nextTick(props.data, () => {
            _getCutoutShape();
        })
        getCutoutShape();
    }else if (t === Selection.CHANGE_PAGE) {
        _getCutoutShape();
    }
}

const update_by_shapes = () => {
    reflush.value++;
}

const watchedShapes = new Map<string, ShapeView>(); // 图层监听
function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(update_by_shapes);
        watchedShapes.delete(k);
    })

    const selectedShapes = props.context.selection.selectedShapes;
    selectedShapes.forEach((v) => {
        v.watch(update_by_shapes);
        watchedShapes.set(v.id, v)
    });
}

onMounted(() => {
    watcher();
    watch_shapes();
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
        :data="(item as CutoutShapeView)" :matrix="matrix" :reflush="reflush"></component>
</template>

<style lang="scss" scoped></style>