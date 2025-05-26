/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from '@/context';
import { Assist, PageXY2 } from '@/context/assist';
import { ClientXY, PageXY } from '@/context/selection';
import { Matrix } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import Path from "@/components/Document/Toolbar/Buttons/Path.vue";

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
const data = reactive<Data>({
    nodesX: [],
    nodesY: [],
    lineX: '',
    lineY: '',
    exLineX: [],
    exLineY: [],
    exNodesX: [],
    exNodesY: []
});
let { lineX, nodesX, lineY, nodesY, exLineX, exLineY, exNodesX, exNodesY } = data;
let ax = 0;
let ay = 0;

function assist_watcher(t: number) {
    if (t === Assist.UPDATE_ASSIST) {
        render();
    } else if (t === Assist.MULTI_LINE_ASSIST) {
        renderMultiLine();
    } else if (t === Assist.CLEAR && assist.value) {
        clear();
    }
}

const highlightReferLine = ref<string[]>([]);

function renderHighlightReferLine() {
    const hr = highlightReferLine.value;
    hr.length = 0;

    const hx = props.context.assist.highlight_guide_x;
    if (hx.length) {
        hr.push(...hx);
    }
    const hy = props.context.assist.highlight_guide_y;
    if (hy.length) {
        hr.push(...hy);
    }
}

function renderMultiLine() {
    getExLineX();
    getExLineY();
    renderHighlightReferLine();
    assist.value = true;
}

function render() {
    // const s = Date.now();
    clear();
    const ns_x = minus_nodes_x(props.context.assist.nodes_x);
    const ns_y = minus_nodes_y(props.context.assist.nodes_y);
    if (ns_x.length) { // 绘制x轴线
        ax = ns_x[0].x;
        points_to_client(ns_x, props.context.workspace.matrix, nodesX);
        lineX = render_line_x(nodesX);
        assist.value = true;
    }
    if (ns_y.length) { // 绘制y轴线
        ay = ns_y[0].y;
        points_to_client(ns_y, props.context.workspace.matrix, nodesY);
        lineY = render_line_y(nodesY);
        assist.value = true;
    }
    renderHighlightReferLine();
    // console.log('初次确定辅助线(ms):', Date.now() - s);
}

function points_to_client(points: { x: number, y: number }[], matrix: Matrix, local: { x: number, y: number }[]) {
    for (let i = 0, len = points.length; i < len; i++) local[i] = matrix.computeCoord3(points[i]);
}

function getExLineX() {
    const xs = props.context.assist.multi_line_x;
    const xAxis = props.context.assist.xAxis;
    const m = props.context.workspace.matrix;
    for (let i = 0; i < xs.length; i++) {
        const _x = xs[i];
        let points = minus_nodes_x(xAxis.get(_x.x) || []);
        if (!points.length) {
            continue;
        }
        points = points.concat(_x.pre);
        const _points = [];
        for (let i = 0; i < points.length; i++) {
            _points.push(m.computeCoord3(points[i]));
        }
        exNodesX = exNodesX.concat(_points);
        exLineX = exLineX.concat(render_line_x(_points));
    }
}

function getExLineY() {
    const ys = props.context.assist.multi_line_y;
    const yAxis = props.context.assist.yAxis;
    const m = props.context.workspace.matrix;
    for (let i = 0; i < ys.length; i++) {
        const _y = ys[i];
        let points = minus_nodes_y(yAxis.get(_y.y) || []);
        if (!points.length) {
            continue;
        }
        points = points.concat(_y.pre);
        const _points = [];
        for (let i = 0; i < points.length; i++) {
            _points.push(m.computeCoord3(points[i]));
        }

        exNodesY = exNodesY.concat(_points);
        exLineY = exLineY.concat(render_line_y(_points));
    }
}

function clear() {
    ax = 0;
    ay = 0;
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

/**
 * @description 去除重复的点
 */
function minus_nodes_x(nodes: PageXY2[]): PageXY[] {
    const except = props.context.assist.except;
    let result: PageXY[] = [];
    for (let i = 0, len = nodes.length; i < len; i++) {
        const n = nodes[i];

        if (!except.get(n.id)) {
            result.push(n.p);
        }
    }
    return result;
}

function minus_nodes_y(nodes: PageXY2[]): PageXY[] {
    const except = props.context.assist.except;
    let result: PageXY[] = [];
    for (let i = 0, len = nodes.length; i < len; i++) {
        const n = nodes[i];

        if (!except.get(n.id)) {
            result.push(n.p);
        }
    }

    return result;
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
         xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" width="100"
         height="100" viewBox="0 0 100 100">
        <g id="node">
            <path d="M -2 -2 L 2 2 z" style="stroke-width: inherit; stroke: inherit;"/>
            <path d="M 2 -2 L -2 2 z" style="stroke-width: inherit; stroke: inherit;"/>
        </g>
        <g v-if="assist">
            <use v-for="(n, i) in nodesX" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node" :key="i"/>
            <use v-for="(n, i) in nodesY" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node" :key="i"/>
            <use v-for="(n, i) in exNodesX" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node" :key="i"/>
            <use v-for="(n, i) in exNodesY" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node" :key="i"/>
            <!--两条主线-->
            <path v-if="lineX" :d="lineX" class="a-path"/>
            <path v-if="lineY" :d="lineY" class="a-path"/>
            <!--多条副线-->
            <path v-for="(el, i) in exLineX" :d="el" :key="i" class="a-path"/>
            <path v-for="(el, i) in exLineY" :d="el" :key="i" class="a-path"/>
        </g>
        <g v-if="assist">
            <path v-for="(l, i) in highlightReferLine" :key="i" :d="l" class="highlight"/>
        </g>
    </svg>
</template>
<style scoped lang="scss">
svg {
    position: absolute;
    pointer-events: none;
}

use {
    stroke: #ff4400;
    stroke-width: 0.5px;
}

.a-path {
    stroke-width: 0.5px;
    stroke: #ff4400;
    fill: none;
}

.highlight {
    stroke-width: 0.8px;
    stroke: #ff0000;
    fill: none;
}
</style>