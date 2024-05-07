<script setup lang="ts">
import { Context } from '@/context';
import { Asssit } from '@/context/assist';
import { ClientXY, PageXY } from '@/context/selection';
import { Matrix } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';

interface Props {
    context: Context
}

interface Data {
    nodesX: ClientXY[]
    nodesY: ClientXY[]
    lineX: string
    lineY: string
}

const props = defineProps<Props>();
const assist = ref<boolean>(false);
const matrix = ref<Matrix>(props.context.workspace.matrix);
const data = reactive<Data>({
    nodesX: [],
    nodesY: [],
    lineX: '',
    lineY: '',
});
let { lineX, nodesX, lineY, nodesY } = data;
let ax = 0, ay = 0;

function assist_watcher(t: number) {
    if (t === Asssit.UPDATE_ASSIST_PATH) {
        render();
    } else if (t === Asssit.CLEAR && assist.value) {
        clear();
    }
}

function render() {
    clear();
    const nodesX = [...props.context.assist.nodesX2];
    const nodesY = [...props.context.assist.nodesY2];
    if (nodesX.length) {
        lineX = render_line_x(nodesX);
        assist.value = true;
    }
    if (nodesY.length) {
        lineY = render_line_y(nodesY);
        assist.value = true;
    }

    console.log('lineX', lineX);
}

function clear() {
    ax = 0, ay = 0;
    nodesX.length = 0;
    nodesY.length = 0;
    lineX = '';
    lineY = '';
    assist.value = false;
}

/**
 * @description 绘制x轴上的线
 */
function render_line_x(nodes: PageXY[]) {
    nodes = sort_nodes_x(nodes);
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1, len = nodes.length; i < len; i++) {
        const n = nodes[i];
        d += `L${n.x} ${n.y}`
    }
    d += ' z';
    return d;
}

/**
 * @description 绘制y轴上的线
 */
function render_line_y(nodes: PageXY[]) {
    nodes = sort_nodes_y(nodes);
    let d = `M ${nodes[0].x} ${nodes[0].y}`
    for (let i = 1, len = nodes.length; i < len; i++) {
        const n = nodes[i];
        d += `L${n.x} ${n.y}`
    }
    d += ' z';
    return d;
}

/**
 * @description 给x轴上的点排序
 */
function sort_nodes_x(nodes: PageXY[]): PageXY[] {
    return nodes.sort((a, b) => {
        if (a.y > b.y) return -1;
        else if (a.y === b.y) return 0;
        else return 1;
    })
}

/**
 * @description 给y轴上的点排序
 */
function sort_nodes_y(nodes: PageXY[]): PageXY[] {
    return nodes.sort((a, b) => {
        if (a.x > b.x) return -1;
        else if (a.x === b.x) return 0;
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
         xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" width="4"
         height="4" viewBox="0 0 4 4" style="position: absolute">
        <g id="node">
            <path d="M -2 -2 L 2 2 z" style="stroke-width: inherit; stroke: inherit;"/>
            <path d="M 2 -2 L -2 2 z" style="stroke-width: inherit; stroke: inherit;"/>
        </g>
        <g v-if="assist">
            <use v-for="(n, i) in nodesX" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node" :key="i"/>
            <use v-for="(n, i) in nodesY" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node" :key="i"/>

            <path v-if="lineX" :d="lineX" class="a-path"/>
            <path v-if="lineY" :d="lineY" class="a-path"/>
        </g>
    </svg>
</template>
<style scoped lang="scss">
use {
    stroke-width: 1px;
    stroke: #ff2200;
}

.a-path {
    stroke-width: 1px;
    stroke: #ff2200;
    fill: none;
}
</style>