<script setup lang="ts">
import { h, defineProps, onMounted, onUnmounted, ref } from 'vue';
import { Shape } from "../data/shape";
import { render as fillR } from "@/render/fill";
import { render as borderR } from "@/render/border"
import { transform } from '@/render/basic';

const props = defineProps<{ data: Shape, boolop: number, path: string }>();
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

    // let frame = this.data.frame;
    let path = props.path;
    let childs = [];

    // fill
    childs.push(...fillR(props.data, path));

    // border
    childs.push(...borderR(props.data, path));

    // ----------------------------------------------------------
    // shadows todo

    if (childs.length == 0) {
        return h('path', {
            d: path,
            "fill-opacity": 1,
            fill: 'none',
            stroke: 'none',
            'stroke-width': 0,
            reflush: reflush.value
            // transform: "translate(" + frame.x + " " + frame.y + ")",
        });
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

</style>