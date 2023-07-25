<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, TableCell, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, ref, onBeforeUpdate } from 'vue';
import CellView from './Table/CtrlCell.vue';
import { throttle } from '../common';
import { Point } from "../SelectionView.vue";

const props = defineProps<{
    context: Context,
    controllerFrame: Point[],
    rotate: number,
    matrix: number[],
    shape: Shape
}>();

const reflush = ref(0);
let cells: { cell: TableCell, lt: { x: number, y: number }, rb: { x: number, y: number } }[] = [];
const matrix = new Matrix();
const update = throttle(_update, 5);
function _update() {
    matrix.reset(props.matrix);
    matrix.multi(props.shape.matrix2Root());
    const childs = props.shape.childs as TableCell[];
    cells = childs.map((c) => {
        return {
            cell: c,
            lt: matrix.computeCoord(c.frame.x, c.frame.y),
            rb: matrix.computeCoord(c.frame.x + c.frame.width, c.frame.y + c.frame.height)
        }
    })
    reflush.value++;
}

watch(() => props.matrix, () => {
    update();
})

watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})

onMounted(() => {
    props.shape.watch(update);
    update();
})

onUnmounted(() => {
    props.shape.unwatch(update);
})

</script>
<template>
    <component v-for="c in cells" :key="c.cell.id" :is="CellView" :shape="c.cell" :matrix="props.matrix" :context="context"
        :lt="c.lt" :rb="c.rb" :reflush="reflush" />
</template>
<style lang='scss' scoped></style>