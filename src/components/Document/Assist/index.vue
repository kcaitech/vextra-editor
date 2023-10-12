<script setup lang="ts">
import { Context } from '@/context';
import { Asssit, PageXY2 } from '@/context/assist';
import { ClientXY, PageXY } from '@/context/selection';
import { Matrix } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { get_p_form_pg_by_x, get_p_form_pg_by_y } from '@/utils/assist';
interface Props {
    context: Context
}
interface Data {
    nodesX: ClientXY[]
    nodesY: ClientXY[]
    lineX: string
    lineY: string
    exLineX: string[]
    exLineY: string[]
    exNodesX: ClientXY[]
    exNodesY: ClientXY[]
}
const props = defineProps<Props>();
const assist = ref<boolean>(false);
const matrix = ref<Matrix>(props.context.workspace.matrix);
const data = reactive<Data>({ nodesX: [], nodesY: [], lineX: '', lineY: '', exLineX: [], exLineY: [], exNodesX: [], exNodesY: [] });
let { lineX, nodesX, lineY, nodesY, exLineX, exLineY, exNodesX, exNodesY } = data;
let ax = 0, ay = 0;
function assist_watcher(t: number) {
    if (t === Asssit.UPDATE_ASSIST) render();
    if (t === Asssit.UPDATE_MAIN_LINE) update_main_line();
    if (t === Asssit.CLEAR && assist.value) clear();
}
function update_main_line() {
    // const s1 = Date.now();
    const cpg = props.context.assist.CPG;
    if (!cpg) return;
    clear4main_line();
    const ns_x = minus_nodes_x(props.context.assist.nodes_x);
    const ns_y = minus_nodes_y(props.context.assist.nodes_y);
    if (ns_x.length) { // 绘制x轴线
        ax = ns_x[0].x;
        nodesX = ns_x.concat(get_p_form_pg_by_x(cpg, ax)).map(n => matrix.value.computeCoord3(n));
        lineX = render_line_x(nodesX);
    }
    if (ns_y.length) { // 绘制y轴线
        ay = ns_y[0].y;
        nodesY = ns_y.concat(get_p_form_pg_by_y(cpg, ay)).map(n => matrix.value.computeCoord3(n));
        lineY = render_line_y(nodesY);
    }
    // console.log('更新主辅助线:', Date.now() - s1);
}
function render() {
    // const s = Date.now();
    clear();
    const ns_x = minus_nodes_x(props.context.assist.nodes_x);
    const ns_y = minus_nodes_y(props.context.assist.nodes_y);
    if (ns_x.length) { // 绘制x轴线
        ax = ns_x[0].x;
        nodesX = ns_x.map(n => matrix.value.computeCoord3(n));
        lineX = render_line_x(nodesX);
        assist.value = true;
    }
    if (ns_y.length) { // 绘制y轴线
        ay = ns_y[0].y;
        nodesY = ns_y.map(n => matrix.value.computeCoord3(n));
        lineY = render_line_y(nodesY);
        assist.value = true;
    }
    getExLineX();
    getExLineY();
    // console.log('初次确定辅助线(ms):', Date.now() - s);
}
function getExLineX() {
    const cpg = props.context.assist.CPG;
    if (!cpg) return;
    const xAxis = props.context.assist.xAxis;
    const { left, cx, right } = cpg;
    if (left !== undefined && Math.abs(left - ax) > 1) {
        let t = minus_nodes_x(xAxis.get(left) || []);
        if (t.length) {
            t = t.concat(get_p_form_pg_by_x(cpg, left));
            t = t.map(n => matrix.value.computeCoord3(n));
            if (t.length) {
                exNodesX.push(...t);
                exLineX.push(render_line_x(t));
            }
        }
    }
    if (cx !== undefined && Math.abs(cx - ax) > 1) {
        let t = minus_nodes_x(xAxis.get(cx) || []);
        if (t.length) {
            t = t.concat(get_p_form_pg_by_x(cpg, cx));
            t = t.map(n => matrix.value.computeCoord3(n));
            if (t.length) {
                exNodesX.push(...t);
                exLineX.push(render_line_x(t));
            }
        }

    }
    if (right !== undefined && Math.abs(right - ax) > 1) {
        let t = minus_nodes_x(xAxis.get(right) || []);
        if (t.length) {
            t = t.concat(get_p_form_pg_by_x(cpg, right));
            t = t.map(n => matrix.value.computeCoord3(n));
            if (t.length) {
                exNodesX.push(...t);
                exLineX.push(render_line_x(t));
            }
        }
    }
}
function getExLineY() {
    const cpg = props.context.assist.CPG;
    if (!cpg) return;
    const yAxis = props.context.assist.yAxis;
    const { top, cy, bottom } = cpg;
    if (top !== undefined && Math.abs(top - ay) > 1) {
        let t = minus_nodes_y(yAxis.get(top) || []);
        if (t.length) {
            t = t.concat(get_p_form_pg_by_y(cpg, top));
            t = t.map(n => matrix.value.computeCoord3(n));
            if (t.length) {
                exNodesY.push(...t);
                exLineY.push(render_line_y(t));
            }
        }
    }
    if (cy !== undefined && Math.abs(cy - ay) > 1) {
        let t = minus_nodes_y(yAxis.get(cy) || []);
        if (t.length) {
            t = t.concat(get_p_form_pg_by_y(cpg, cy));
            t = t.map(n => matrix.value.computeCoord3(n));
            if (t.length) {
                exNodesY.push(...t);
                exLineY.push(render_line_y(t));
            }
        }
    }
    if (bottom !== undefined && Math.abs(bottom - ay) > 1) {
        let t = minus_nodes_y(yAxis.get(bottom) || []);
        if (t.length) {
            t = t.concat(get_p_form_pg_by_y(cpg, bottom));
            t = t.map(n => matrix.value.computeCoord3(n));
            if (t.length) {
                exNodesY.push(...t);
                exLineY.push(render_line_y(t));
            }
        }
    }
}
function clear() {
    ax = 0, ay = 0;
    nodesX.length = 0;
    nodesY.length = 0;
    exNodesY.length = 0;
    exNodesX.length = 0;
    exLineX.length = 0;
    exLineY.length = 0;
    lineX = '';
    lineY = '';
    assist.value = false;
}
function clear4main_line() {
    ax = 0, ay = 0;
    nodesX.length = 0;
    nodesY.length = 0;
    lineX = '';
    lineY = '';
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
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="4"
        :height="4" viewBox="0 0 4 4" style="position: absolute">
        <g id="node">
            <path d="M -2 -2 L 2 2 z" style="stroke-width: inherit; stroke: inherit;" />
            <path d="M 2 -2 L -2 2 z" style="stroke-width: inherit; stroke: inherit;" />
        </g>
        <g v-if="assist">
            <use v-for="(n, i) in nodesX" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node" :key="i" />
            <use v-for="(n, i) in nodesY" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node" :key="i" />
            <use v-for="(n, i) in exNodesX" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node" :key="i" />
            <use v-for="(n, i) in exNodesY" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node" :key="i" />
            <path v-if="lineX" :d="lineX" class="a-path" />
            <path v-if="lineY" :d="lineY" class="a-path" />
            <path v-for="(el, i) in exLineX" :d="el" :key="i" class="a-path" />
            <path v-for="(el, i) in exLineY" :d="el" :key="i" class="a-path" />
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