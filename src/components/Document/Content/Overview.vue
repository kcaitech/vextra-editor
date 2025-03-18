/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { Context } from '@/context';
import { Matrix } from '@kcdesign/data';
import { nextTick, onBeforeMount, ref, watch } from 'vue';
import Simple from './Simple.vue';
import { WorkSpace } from '@/context/workspace';
interface Props {
    context: Context
    matrix: number[]
}
const props = defineProps<Props>();
const matrix = new Matrix();
const fix_x = ref<number>(0), fix_y = ref<number>(0), fix_w = ref<number>(0), fix_h = ref<number>(0);
const page_origin = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const container_origin = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const page_el = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();
const show_locate = ref<boolean>(false);
const show_current = ref<boolean>(true);
const locate = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const locate_xy = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const current_xy = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const reflush = ref<number>(0);
const url = ref<string>('');
function init() {
    const selection = props.context.selection, workspace = props.context.workspace, root = workspace.root;
    const page = selection.selectedPage;
    if (!page) return;
    const f = page.frame, width = f.width, height = f.height;
    const max: number = width < height ? height : width;
    const max_side: 'h' | 'w' = width < height ? 'h' : 'w';
    const ratio = width / height;
    if (max_side === 'w') {
        fix_w.value = 300, fix_h.value = 300 / ratio;
        fix_y.value = (300 - fix_h.value) / 2, fix_x.value = 0;
    } else {
        fix_w.value = 300 * ratio, fix_h.value = 300;
        fix_x.value = (300 - fix_w.value) / 2, fix_y.value = 0;
    }
    const scale = 300 / max;
    matrix.trans(-f.x, -f.y);
    matrix.scale(scale);
    nextTick(() => {
        if (page_el.value) {
            const { x, y } = page_el.value.getBoundingClientRect();
            page_origin.value.x = x, page_origin.value.y = y;
        }
        if (container.value) {
            const { x, y } = container.value.getBoundingClientRect();
            container_origin.value.x = x, container_origin.value.y = y;
        }
        const m = new Matrix(workspace.matrix.inverse);
        m.multiAtLeft(matrix);
        const c_xy = m.computeCoord2(root.center.x, root.center.y);
        current_xy.value.x = c_xy.x + fix_x.value - 18, current_xy.value.y = c_xy.y + fix_y.value - 32;
        if (current_xy.value.x < -20 || current_xy.value.x > 300 || current_xy.value.y < -20 || current_xy.value.y > 300) {
            show_current.value = false;
        }
        url.value = localStorage.getItem('avatar') || '';
        reflush.value++;
    })
}
function update_current() {
    show_current.value = true;
    const workspace = props.context.workspace, root = workspace.root;
    const m = new Matrix(workspace.matrix.inverse);
    m.multiAtLeft(matrix);
    const c_xy = m.computeCoord2(root.center.x, root.center.y);
    current_xy.value.x = c_xy.x + fix_x.value - 18, current_xy.value.y = c_xy.y + fix_y.value - 32;
    if (current_xy.value.x < -20 || current_xy.value.x > 300 || current_xy.value.y < -40 || current_xy.value.y > 280) {
        show_current.value = false;
    }
}

function showL() {
    show_locate.value = true;
}
function hiddenL() {
    show_locate.value = false;
}
function updatelocate(e: MouseEvent) {
    const { clientX, clientY } = e;
    const xy = { x: clientX - container_origin.value.x, y: clientY - container_origin.value.y };
    locate_xy.value.x = Number((clientX - container_origin.value.x + 2).toFixed(2)), locate_xy.value.y = Number((clientY - container_origin.value.y + 2).toFixed(2));
    let m = new Matrix(matrix);
    m.trans(fix_x.value, fix_y.value);
    m = new Matrix(m.inverse);
    const xy2 = m.computeCoord2(xy.x, xy.y);
    locate.value.x = Math.ceil(xy2.x), locate.value.y = Math.ceil(xy2.y);
}
function trans(e: MouseEvent) {
    const xy = { x: e.clientX - container_origin.value.x, y: e.clientY - container_origin.value.y };
    let m = new Matrix(matrix);
    m.trans(fix_x.value, fix_y.value);
    const root = props.context.workspace.root, wm = props.context.workspace.matrix;
    m = new Matrix(m.inverse);
    m.multiAtLeft(wm);
    const xy2 = m.computeCoord2(xy.x, xy.y);
    const { x, y, bottom, right } = root;
    const contentViewCenter = { x: (right - x) / 2, y: (bottom - y) / 2 }; // 计算contentview中心点的位置
    const dx = contentViewCenter.x - xy2.x, dy = contentViewCenter.y - xy2.y;
    wm.trans(dx, dy);
    props.context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}
watch(() => props.matrix, update_current, { deep: true });
onBeforeMount(init);
</script>
<template>
    <div ref="container" class="container" @mousedown.stop="trans" @mouseenter="showL" @mouseleave="hiddenL"
        @mousemove="updatelocate">
        <div class="page" ref="page_el"
            :style="{ left: fix_x + 'px', top: fix_y + 'px', width: fix_w + 'px', height: fix_h + 'px' }">
            <Simple v-for="(s, i) in props.context.selection.selectedPage!.childs" :key="i" :matrix="matrix" :shape="s">
            </Simple>
        </div>
        <div class="name" :style="{ left: fix_x + 'px', top: fix_y - 18 + 'px' }">{{
            props.context.selection.selectedPage!.name || '' }}</div>
        <div v-if="show_locate" class="locate" :style="{ left: locate_xy.x + 'px', top: locate_xy.y + 'px' }">{{
            `${locate.x}, ${locate.y}` }}</div>
        <svg v-if="show_current" :reflush="reflush" class="current" viewBox="0 0 1024 1024" version="1.1"
            :style="{ left: current_xy.x + 'px', top: current_xy.y + 'px' }" xmlns="http://www.w3.org/2000/svg" width="32"
            height="32">
            <path
                d="M512 0C279.13 0 90.353 189.862 90.353 424.177c0 117.097 47.224 223.111 123.482 299.911L512 1024l298.164-299.912a424.117 424.117 0 0 0 123.483-299.911C933.647 189.862 744.869 0 512 0z m0 612.593a187.934 187.934 0 0 1-187.453-188.537A187.874 187.874 0 0 1 512 235.64a187.934 187.934 0 0 1 187.452 188.537A187.874 187.874 0 0 1 512 612.653z"
                fill="#1878f5"></path>
            <clipPath id="avatar">
                <path d="M512 360 v-290 a360 360 1 1 1 0 720 a 360 360 1 1 1 0 -720 z" clip-rule="evenodd"></path>
            </clippath>
            <image :xlink:href="url" width="720" height="720" x="150" y="60" clip-path="url(#avatar)"
                preserveAspectRatio="none meet"></image>
        </svg>
    </div>
</template>
<style scoped lang="scss">
.container {
    position: absolute;
    width: 300px;
    height: 300px;
    right: 15px;
    bottom: 15px;
    border: 1px solid #ccc;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    background-color: #fff;
    border-radius: 4px;
    cursor: crosshair;
    z-index: 9;

    .name {
        position: absolute;
        margin-left: 4px;
        color: var(--active-color);
        font-weight: 600;
        font-size: var(--font-default-fontsize);
    }

    .page {
        background-color: #efefef;
        position: absolute;
        box-sizing: border-box;
        border: 1px solid #ccc;
        overflow: hidden;
        box-sizing: border-box;
    }

    .locate {
        position: absolute;
        display: inline-block;
        white-space: nowrap;
        color: #efefef;
        padding: 0 4px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        background-color: var(--active-color);
        border-radius: var(--default-radius);
        font-size: var(--font-default-fontsize);
    }

    .current {
        position: absolute;
    }
}
</style>