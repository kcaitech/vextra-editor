<script setup lang="ts">
import { Context } from '@/context';
import { Asssit, PageXY2 } from '@/context/assist';
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
enum Align {
    LT_X,
    RT_X,
    C_X,
    RB_X,
    LB_X,
    LT_Y,
    RT_Y,
    C_Y,
    RB_Y,
    LB_Y
}
const props = defineProps<Props>();
const assist = ref<boolean>(false);
const matrix = ref<Matrix>(props.context.workspace.matrix);
const data = reactive<Data>({ nodesX: [], nodesY: [], lineX: '', lineY: '' });
let { lineX, nodesX, lineY, nodesY } = data;
function assist_watcher(t: number, multi?: Align[]) {
    if (t === Asssit.UPDATE_ASSIST) render(multi);
}
function render(multi?: Align[]) {
    const s = Date.now();
    clear();
    const ns_x = minus_nodes_x(props.context.assist.nodes_x);
    const ns_y = minus_nodes_y(props.context.assist.nodes_y);
    if (ns_x.length) { // 绘制x轴线
        nodesX = ns_x.map(n => matrix.value.computeCoord(n.x, n.y));
        lineX = render_line_x(nodesX);
        assist.value = true;
    }
    if (ns_y.length) { // 绘制y轴线
        nodesY = ns_y.map(n => matrix.value.computeCoord(n.x, n.y));
        lineY = render_line_y(nodesY);
        assist.value = true;
    }
    if (multi) {
        console.log('多线');
    }
    const e = Date.now();
    // console.log('辅助线绘制用时(ms):', e - s);
}
function clear() {
    nodesX.length = 0;
    nodesY.length = 0;
    lineX = '';
    lineY = '';
    assist.value = false;
}
/**
 * @description 去除重复的点
 */
function minus_nodes_x(nodes: PageXY2[]): PageXY[] {
    const except = props.context.assist.except;
    let result: Map<number, PageXY> = new Map();
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!except.get(n.id)) result.set(n.p.y, n.p);
    }
    return Array.from(result.values());
}
function minus_nodes_y(nodes: PageXY2[]): PageXY[] {
    const except = props.context.assist.except;
    let result: Map<number, PageXY> = new Map();
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!except.get(n.id)) result.set(n.p.x, n.p);
    }
    return Array.from(result.values());
}
/**
 * @description 绘制x轴上的线
 */
function render_line_x(nodes: PageXY[]) {
    nodes = sort_nodes_x(nodes);
    let d = `M ${nodes[0].x} ${nodes[0].y}`
    for (let i = 1; i < nodes.length; i++) {
        const n = nodes[i];
        d += `L${n.x} ${n.y}`
    }
    d += 'z';
    return d;
}
/**
 * @description 绘制y轴上的线
 */
function render_line_y(nodes: PageXY[]) {
    nodes = sort_nodes_y(nodes);
    let d = `M ${nodes[0].x} ${nodes[0].y}`
    for (let i = 1; i < nodes.length; i++) {
        const n = nodes[i];
        d += `L${n.x} ${n.y}`
    }
    d += 'z';
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
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="position: absolute">
        <g id="node">
            <path d="M -2 -2 L 2 2 z" stroke-width="1px" stroke="#ff2200"></path>
            <path d="M 2 -2 L -2 2 z" stroke-width="1px" stroke="#ff2200"></path>
        </g>
        <g v-if="assist">
            <use v-for="(n, i) in nodesX" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node" :key="i"></use>
            <use v-for="(n, i) in nodesY" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node" :key="i"></use>
            <path v-if="lineX" :d="lineX" stroke-width="1px" stroke="#ff2200" fill="none"></path>
            <path v-if="lineY" :d="lineY" stroke-width="1px" stroke="#ff2200" fill="none"></path>
        </g>
    </svg>
</template>
<style scoped lang="scss"></style>