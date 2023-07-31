<script setup lang="ts">
import { Context } from '@/context';
import { Asssit } from '@/context/assist';
import { ClientXY } from '@/context/selection';
import { onMounted, onUnmounted, reactive, ref } from 'vue';

interface Props {
    context: Context
}
interface Data {
    nodes: ClientXY[]
    nodesX: ClientXY[]
    nodesY: ClientXY[]
    lines: string[]
    lineX: string
    lineY: string
}
const props = defineProps<Props>();
const assist = ref<boolean>(false);
const data = reactive<Data>({ nodes: [], nodesX: [], nodesY: [], lines: [], lineX: '', lineY: '' });
const { nodes, lines } = data;
let { lineX, lineY } = data;
function assist_watcher(t?: any) {
    if (t === Asssit.UPDATE_ASSIST) render();
}
function render() {
    // let ns = props.context.assist.nodes;
    // clear();
    // if (ns.length) {
    //     const m = props.context.workspace.matrix;
    //     ns = ns.map(n => m.computeCoord(n.x, n.y))
    //     nodes.push(...ns);
    //     lines.push(gen_line(ns));
    //     assist.value = true;
    // }
}
function clear() {
    nodes.length = 0;
    lines.length = 0;
    lineX = '';
    lineY = '';
    assist.value = false;
}
function gen_line(nodes: ClientXY[]) {
    nodes = sort_nodes_x(nodes);
    let d = 'M'
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (i === 0) {
            d += `${n.x} ${n.y}`
        } else {
            d += `L${n.x} ${n.y}`
        }
    }
    d += 'z';
    return d;
}
function sort_nodes_x(nodes: ClientXY[]): ClientXY[] {
    return nodes.sort((a, b) => {
        if (a.y > b.y) return -1;
        else if (a.y === b.y) return 0;
        else return 1;
    })
}
onMounted(() => {
    props.context.assist.watch(assist_watcher);
})
onUnmounted(() => {
    props.context.assist.unwatch(assist_watcher);
})
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="position: absolute">
        <g id="node">
            <path d="M -2 -2 L 2 2 z" stroke-width="1px" stroke="red"></path>
            <path d="M 2 -2 L -2 2 z" stroke-width="1px" stroke="red"></path>
        </g>
        <g v-if="assist">
            <use v-for="(n, i) in nodes" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node" :key="i"></use>
            <path v-for="(l, i) in lines" :d="l" stroke-width="1px" stroke="red" :key="i" fill="none"></path>
        </g>
    </svg>
</template>
<style scoped lang="scss"></style>