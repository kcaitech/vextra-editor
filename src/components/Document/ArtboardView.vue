<script setup lang="ts">
import { h, ref, defineProps, VNodeArrayChildren, onMounted, onUnmounted } from 'vue';
import comsMap from './comsmap'
import { renderGroupChilds as gR } from "@/render/group";
import { transform } from '@/render/basic';
import { Artboard } from '@/data/artboard';

const props = defineProps<{ data: Artboard, boolop: number }>();
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
    // name
    // border
    // background

    const childs: VNodeArrayChildren = [];
    // childs.push(h("text", {y: -5}, this.data.name));
    const frame = props.data.frame;
    // background
    if (props.data.hasBackgroundColor) {
        const color = props.data.backgroundColor;
        childs.push(h("rect", {
            x: 0, y: 0, width: frame.width, height: frame.height,
            fill: "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")",
            "fill-opacity": color ? color.alpha : 1,
            filter: "url(#artboard-shadow)"
        }))
    } else {
        childs.push(h("rect", { x: 0, y: 0, width: frame.width, height: frame.height, filter: "url(#artboard-shadow)" }))
    }
    childs.push(...transform(gR(props.data, props.boolop, comsMap), h) as VNodeArrayChildren);
    return h('g', { transform: 'translate(' + frame.x + ',' + frame.y + ')', class: "artboard", reflush: reflush.value }, childs);
}

</script>

<template>
    <render></render>
</template>

<style scoped>

</style>