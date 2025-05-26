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
import { Assist } from '@/context/assist';
import { ClientXY, PageXY } from '@/context/selection';
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
const data = reactive<Data>({
    nodesX: [],
    nodesY: [],
    lineX: '',
    lineY: '',
});
let { lineX, nodesX, lineY, nodesY } = data;

function assist_watcher(t: number) {
    if (t === Assist.UPDATE_ASSIST_PATH) {
        render();
    } else if (t === Assist.CLEAR && assist.value) {
        clear();
    }
}

function render() {
    clear();

    const nx = [...props.context.assist.nodesX2];
    const ny = [...props.context.assist.nodesY2];

    if (nx.length) {
        nodesX.push(...nx);
        lineX = render_line_x(nx);
        assist.value = true;
    }
    if (ny.length) {
        nodesY.push(...ny);
        lineY = render_line_y(ny);
        assist.value = true;
    }
}

function clear() {
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
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
         preserveAspectRatio="xMinYMin meet" overflow="visible" width="100" height="100" viewBox="0 0 100 100"
         style="position: absolute">
        <g id="node-path">
            <path d="M -2 -2 L 2 2 z" style="stroke-width: inherit; stroke: inherit;"/>
            <path d="M 2 -2 L -2 2 z" style="stroke-width: inherit; stroke: inherit;"/>
        </g>
        <g v-if="assist">
            <use v-for="(n, i) in nodesX" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node-path" :key="i"/>
            <use v-for="(n, i) in nodesY" :transform="`translate(${n.x}, ${n.y})`" xlink:href="#node-path" :key="i"/>
            <path v-if="lineX" :d="lineX" class="a-path"/>
            <path v-if="lineY" :d="lineY" class="a-path"/>
        </g>
    </svg>
</template>
<style scoped lang="scss">
svg {
    pointer-events: none;
}

use {
    stroke-width: 0.5px;
    stroke: #ff4400;
}

.a-path {
    stroke-width: 0.5px;
    stroke: #ff4400;
    fill: none;
}
</style>