<script setup lang="ts">
import { Context } from '@/context';
import { Asssit } from '@/context/assist';
import { ClientXY } from '@/context/selection';
import { onMounted, onUnmounted, reactive, ref } from 'vue';

interface Props {
    context: Context
}
const props = defineProps<Props>();
const assist = ref<boolean>(false);
const data = reactive<{ nodes: ClientXY[], lines: string[] }>({ nodes: [], lines: [] });
const { nodes, lines } = data;
function assist_watcher(t?: any) {
    if (t === Asssit.UPDATE_ASSIST) render();
}
function render() {
    let ns = props.context.assist.nodes;
    clear();
    if (ns.length) {
        const m = props.context.workspace.matrix;
        ns = ns.map(n => m.computeCoord(n.x, n.y))
        nodes.push(...ns);
        lines.push(gen_line(ns));
        assist.value = true;
    }
}
function clear() {
    nodes.length = 0;
    lines.length = 0;
    assist.value = false;
}
function gen_line(nodes: ClientXY[]) {
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
            <path v-for="(l, i) in lines" :d="l" stroke-width="1px" stroke="red" :key="i"></path>
        </g>
    </svg>
</template>
<style scoped lang="scss"></style>