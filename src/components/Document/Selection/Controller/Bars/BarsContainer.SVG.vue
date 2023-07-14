<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, Shape } from '@kcdesign/data';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Selection } from '@/context/selection';
const props = defineProps<{
    matrix: number[],
    context: Context,
    shape: Shape
}>();

const matrix = new Matrix();
const paths = ref<string[]>([]);
function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}
function update_dot_path() {
    paths.value.length = 0;
    const frame = props.shape.frame;
    let apex = [{ x: 0, y: 0 }, { x: frame.width, y: 0 }, { x: frame.width, y: frame.height }, { x: 0, y: frame.height }];
    apex = apex.map(p => matrix.computeCoord(p.x, p.y));
    apex.push(apex[0]);
    for (let i = 0; i < apex.length - 1; i++) {
        paths.value.push(get_bar_path(apex[i], apex[i + 1]));
    }
}
function get_bar_path(s: { x: number, y: number }, e: { x: number, y: number }): string {
    return `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
}
function selection_watcher(t?: number) {
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
    props.context.selection.watch(selection_watcher);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
    props.context.selection.unwatch(selection_watcher);
})
</script>
<template>
    <g>
        <path :d="paths[0]" fill="none" stroke='#865dff' stroke-width="1.5px">
        </path>
        <path :d="paths[1]" fill="#ffffff" stroke='#865dff' stroke-width="1.5px">
        </path>
        <path :d="paths[2]" fill="#ffffff" stroke='#865dff' stroke-width="1.5px">
        </path>
        <path :d="paths[3]" fill="#ffffff" stroke='#865dff' stroke-width="1.5px">
        </path>
    </g>
</template>
<style lang='scss' scoped></style>