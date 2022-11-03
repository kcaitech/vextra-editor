
<script setup lang="ts">
import { Shape } from '@/data/shape';
import { h, defineProps, onMounted, onUnmounted, ref } from 'vue';
import { render as fillR } from "@/render/fill";
import { render as borderR } from "@/render/border"
import { transform } from '@/render/basic';

const props = defineProps<{ data: Shape, boolop: number }>();
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

    // if (this.data.booleanOperation != BooleanOperation.None) {
    //     // todo 只画selection
    //     return;
    // }

    let frame = props.data.frame;
    let childs = [];
    let path = props.data.getPath(true);
    // fill
    childs.push(...fillR(props.data, path));
    // border
    childs.push(...borderR(props.data, path));

    if (childs.length == 0) {
        // todo
        return h('rect', { "fill-opacity": 1, stroke: 'none', 'stroke-width': 0, x: frame.x, y: frame.y, width: frame.width, height: frame.height,
        reflush: reflush.value });
    }
    // else if (childs.length == 1) {
    //     return transform(childs[0], h);
    // }
    else {
        return h("g", {reflush: reflush.value}, transform(childs, h));
    }
}
</script>

<template>
    <render />
</template>

<style scoped>
/* rect {
    background-color: aqua;
} */
</style>