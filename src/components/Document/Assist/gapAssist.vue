/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
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
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { XYsBounding } from '@/utils/common';
import { ArtboardView, Matrix, PathShapeView, ShapeType, ShapeView } from '@kcaitech/vextra-core';
import { onMounted, onUnmounted, ref } from 'vue';

interface Props {
    context: Context
}

type Box = {
    top: number,
    bottom: number,
    left: number,
    right: number
}
const props = defineProps<Props>();
const hor_spacings: Map<number, Box[]> = new Map();
const ver_spacings: Map<number, Box[]> = new Map();
const spaceing_boxs = ref<Box[]>([]);
const spaceing_ver_line = ref<Box[]>([]);
const spaceing_hor_line = ref<Box[]>([]);
let ss = ref<number[]>([])
const getIntersectShapes = () => {
    spaceing_ver_line.value = [];
    spaceing_hor_line.value = [];
    props.context.assist.setSpaceAdsorbX([]);
    props.context.assist.setSpaceAdsorbY([]);
    if (!props.context.workspace.transforming) {
        spaceing_boxs.value = [];
        return;
    }
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) return;
    const points: { x: number, y: number }[] = [];
    for (let index = 0; index < shapes.length; index++) {
        const s = shapes[index];
        const m = s.matrix2Root();
        m.multiAtLeft(props.context.workspace.matrix);
        const f = s.frame;
        const x = f.x;
        const y = f.y;
        let r = x + f.width;
        if(s.type === ShapeType.Line && !(s as PathShapeView).haveEdit) {
            r = x;
        }
        const b = y + f.height;
        const ps: { x: number, y: number }[] = [{ x, y }, { x: r, y }, { x: r, y: b }, { x, y: b }].map(p => m.computeCoord3(p));
        points.push(...ps);
    }
    const b = XYsBounding(points); // 选中图形在视图上的位置
    const parent_id = shapes[0].parent?.id || '';
    if ((shapes[0].parent as ArtboardView)?.autoLayout) return; // todo 为什么会存在没有parent的帧???
    const h_shapes = props.context.assist.horIntersect(b.top, b.bottom, parent_id); // 水平相交的图形
    const v_shapes = props.context.assist.verIntersect(b.left, b.right, parent_id); // 垂直相交的图形
    const hor = getHorGaps(b, h_shapes);
    const ver = getVerGaps(b, v_shapes);
    spaceing_boxs.value = [...hor, ...ver];
}

const getBoxs = (box: Box, shapes: ShapeView[]) => {  // 获取shape在视图上的位置
    const matrix = props.context.workspace.matrix;
    const selected = props.context.selection.selectedShapes;
    const boxs: { b: Box, shape: ShapeView }[] = [{ b: box, shape: selected[0] }];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const m = shape.matrix2Root();
        const points: { x: number, y: number }[] = [];
        m.multiAtLeft(matrix);
        const f = shape.frame;
        const x = f.x;
        const y = f.y;
        let r = x + f.width;
        if(shape.type === ShapeType.Line && !(shape as PathShapeView).haveEdit) {
            r = x;
        }
        const b = y + f.height;
        const ps: { x: number, y: number }[] = [{ x, y }, { x: r, y }, { x: r, y: b }, { x, y: b }].map(p => m.computeCoord3(p));
        points.push(...ps);
        const box = XYsBounding(points);
        const _box: Box = {
            top: box.top,
            bottom: box.bottom,
            left: box.left,
            right: box.right
        }
        boxs.push({ b: _box, shape });
    }
    return boxs;
}

const getHorGaps = (box: Box, shapes: ShapeView[]) => {
    if (shapes.length < 2) return [];
    hor_spacings.clear();
    let adsorbXs = [];
    const selected = props.context.selection.selectedShapes;
    const boxs = getBoxs(box, shapes);
    boxs.sort((a, b) => a.b.left - b.b.left); // 对水平相交的图形进行左到右排序
    const move_index = boxs.findIndex(item => item.shape === selected[0]); // 排序后移动shape的下标
    if (move_index === -1) return [];
    let left_space = 0; // 移动shape距离左侧shape的间距；
    let right_space = 0; // 移动shape距离右侧shape的间距；
    for (let i = 0; i < boxs.length; i++) {  // 从左到右获取shape之间的间距和间距位置
        const b = boxs[i];
        if (move_index === i) continue;
        if (move_index > i) { // 移动shape左侧的间距和间距位置
            if (i + 1 !== move_index) {
                const gap = Number((boxs[i + 1].b.left - b.b.right).toFixed(4));
                if (gap > 0) {
                    const box = {
                        top: Math.min(boxs[i + 1].b.top, b.b.top),
                        bottom: Math.max(boxs[i + 1].b.bottom, b.b.bottom),
                        left: b.b.right,
                        right: boxs[i + 1].b.left
                    }
                    if (hor_spacings.has(gap)) {  //水平方向有无当前间距？ 存入多个间距位置
                        const bounds = hor_spacings.get(gap);
                        bounds!.push(box);
                        hor_spacings.set(gap, bounds!);
                    } else {
                        hor_spacings.set(gap, [box]);
                    }
                }
            }
        } else { // 移动shape右侧的间距和间距位置
            if (i + 1 < boxs.length) {
                const gap = Number((boxs[i + 1].b.left - b.b.right).toFixed(4));
                if (gap > 0) {
                    const box = {
                        top: Math.min(boxs[i + 1].b.top, b.b.top),
                        bottom: Math.max(boxs[i + 1].b.bottom, b.b.bottom),
                        left: b.b.right,
                        right: boxs[i + 1].b.left
                    }
                    if (hor_spacings.has(gap)) {
                        const bounds = hor_spacings.get(gap);
                        bounds!.push(box);
                        hor_spacings.set(gap, bounds!);
                    } else {
                        hor_spacings.set(gap, [box]);
                    }
                }
            }
        }
    }
    let before = false;
    let after = false;
    let before_bounds: Box[] = [];
    let after_bounds: Box[] = [];
    let before_spacings: Box | undefined; // 移动shape左侧间距位置
    let after_spacings: Box | undefined; // 移动shape右侧间距位置

    if (boxs[move_index - 1]) {
        for (let index = move_index - 1; index > -1; index--) {
            const gap = boxs[move_index].b.left - boxs[index].b.right; // 移动shape与相邻shape之间的间距是否大于0？
            if (gap > 0) {
                left_space = Number(gap.toFixed(4));
                const box = {
                    top: boxs[move_index].b.top,
                    bottom: boxs[move_index].b.bottom,
                    left: boxs[index].b.right,
                    right: boxs[move_index].b.left
                }
                const adsorbx = getAdsorbX(box, (boxs[move_index].b.right - boxs[move_index].b.left) / 2, false); // 吸附位置
                adsorbXs.push(...adsorbx);
                for (const [key, value] of hor_spacings) {
                    if (Math.abs(key - left_space) < 2) { // 移动shape左侧有无相同间距
                        const before_bound = value.filter(item => item.right <= box.left);
                        if (before_bound.length) {
                            before_bounds.push(...before_bound, box);  // 存入当前移动shape与之左侧shape之间相等的间距
                            before = true;
                        }
                    }
                }
                before_spacings = box;
                break;
            }
        }
    }
    if (boxs[move_index + 1]) {
        for (let index = move_index + 1; index < boxs.length; index++) {
            const gap = boxs[index].b.left - boxs[move_index].b.right;
            if (gap > 0) {
                right_space = Number(gap.toFixed(4));
                const box = {
                    top: boxs[move_index].b.top,
                    bottom: boxs[move_index].b.bottom,
                    left: boxs[move_index].b.right,
                    right: boxs[index].b.left
                }
                const adsorbx = getAdsorbX(box, (boxs[move_index].b.right - boxs[move_index].b.left) / 2, true);
                adsorbXs.push(...adsorbx);
                for (const [key, value] of hor_spacings) {
                    if (Math.abs(key - right_space) < 2) { // 移动shape右侧有无相同间距
                        const before_bound = value.filter(item => item.left >= box.right);
                        if (before_bound.length) {
                            after_bounds.push(...before_bound, box);
                            after = true;
                        }
                    }
                }
                after_spacings = box;
                break;
            }
        }
    }
    if (after_spacings && before_spacings) {
        const center = (after_spacings.right + before_spacings.left) / 2
        adsorbXs.push(center);
    }
    if (Math.abs(right_space - left_space) < 2 && (after_spacings && before_spacings)) { //移动shape左右间距相等时
        after_bounds.push(after_spacings!, before_spacings!);
    }

    ss.value = adsorbXs
    const matrix = props.context.workspace.matrix;
    const m = new Matrix(matrix.inverse);
    adsorbXs = adsorbXs.map(item => {
        const { x } = m.computeCoord2(item, 0);
        return x;
    })
    props.context.assist.setSpaceAdsorbX(adsorbXs);
    const result = [...after_bounds, ...before_bounds];
    if (result.length > 1) {
        if (Math.abs(right_space - left_space) > 2) {
            if (after && after_spacings) spaceing_hor_line.value.push(after_spacings);
            if (before && before_spacings) spaceing_hor_line.value.push(before_spacings);
        } else {
            if (right_space > 0 && before_spacings) {
                spaceing_hor_line.value.push(before_spacings);
            }
        }
    }
    return result.length > 1 ? result : [];
}

const getVerGaps = (box: Box, shapes: ShapeView[]) => {
    if (shapes.length < 2) return [];
    ver_spacings.clear();
    let adsorbYs = [];
    const selected = props.context.selection.selectedShapes;
    const boxs = getBoxs(box, shapes);
    boxs.sort((a, b) => a.b.top - b.b.bottom);
    const move_index = boxs.findIndex(item => item.shape === selected[0]);
    if (move_index === -1) return [];
    let top_space = 0;
    let bottom_space = 0;

    for (let i = 0; i < boxs.length; i++) {
        const b = boxs[i];
        if (move_index === i) continue;
        if (move_index > i) {
            if (i + 1 !== move_index) {
                const gap = Number((boxs[i + 1].b.top - b.b.bottom).toFixed(4));
                if (gap > 0) {
                    const box = {
                        top: b.b.bottom,
                        bottom: boxs[i + 1].b.top,
                        left: Math.min(boxs[i + 1].b.left, b.b.left),
                        right: Math.max(boxs[i + 1].b.right, b.b.right)
                    }
                    if (ver_spacings.has(gap)) {
                        const bounds = ver_spacings.get(gap);
                        bounds!.push(box);
                        ver_spacings.set(gap, bounds!);
                    } else {
                        ver_spacings.set(gap, [box]);
                    }
                }
            }
        } else {
            if (i + 1 < boxs.length) {
                const gap = Number((boxs[i + 1].b.top - b.b.bottom).toFixed(4));
                if (gap > 0) {
                    const box = {
                        top: b.b.bottom,
                        bottom: boxs[i + 1].b.top,
                        left: Math.min(boxs[i + 1].b.left, b.b.left),
                        right: Math.max(boxs[i + 1].b.right, b.b.right)
                    }
                    if (ver_spacings.has(gap)) {
                        const bounds = ver_spacings.get(gap);
                        bounds!.push(box);
                        ver_spacings.set(gap, bounds!);
                    } else {
                        ver_spacings.set(gap, [box]);
                    }
                }
            }
        }
    }
    let before = false;
    let after = false;
    let before_bounds: Box[] = [];
    let after_bounds: Box[] = [];
    let before_spacings: Box | undefined;
    let after_spacings: Box | undefined;
    if (boxs[move_index - 1]) {
        for (let index = move_index - 1; index > -1; index--) {
            const gap = boxs[move_index].b.top - boxs[index].b.bottom;
            if (gap > 0) {
                top_space = Number(gap.toFixed(4));
                const box = {
                    top: boxs[index].b.bottom,
                    bottom: boxs[move_index].b.top,
                    left: boxs[move_index].b.left,
                    right: boxs[move_index].b.right
                }
                const adsorby = getAdsorbY(box, (boxs[move_index].b.bottom - boxs[move_index].b.top) / 2, false); // 吸附位置
                adsorbYs.push(...adsorby);
                for (const [key, value] of ver_spacings) {
                    if (Math.abs(key - top_space) < 2) {
                        const before_bound = value.filter(item => item.bottom <= box.top);
                        if (before_bound.length) {
                            before_bounds.push(...before_bound, box);
                            before = true;
                        }
                    }
                }
                before_spacings = box;
                break;
            }
        }
    }
    if (boxs[move_index + 1]) {
        for (let index = move_index + 1; index < boxs.length; index++) {
            const gap = boxs[index].b.top - boxs[move_index].b.bottom;
            if (gap > 0) {
                bottom_space = Number(gap.toFixed(4));
                const box = {
                    top: boxs[move_index].b.bottom,
                    bottom: boxs[index].b.top,
                    left: boxs[move_index].b.left,
                    right: boxs[move_index].b.right
                }
                const adsorby = getAdsorbY(box, (boxs[move_index].b.bottom - boxs[move_index].b.top) / 2, true); // 吸附位置
                adsorbYs.push(...adsorby);
                for (const [key, value] of ver_spacings) {
                    if (Math.abs(key - bottom_space) < 2) {
                        const after_bound = value.filter(item => item.top >= box.bottom);
                        if (after_bound.length) {
                            after_bounds.push(...after_bound, box);
                            after = true;
                        }
                    }
                }
                after_spacings = box;
                break;
            }
        }
    }
    if (after_spacings && before_spacings) {
        const center = (after_spacings.bottom + before_spacings.top) / 2
        adsorbYs.push(center);
    }
    if (Math.abs(top_space - bottom_space) < 2 && (after_spacings && before_spacings)) {
        after_bounds.push(after_spacings!, before_spacings!);
    }

    const matrix = props.context.workspace.matrix;
    const m = new Matrix(matrix.inverse);
    adsorbYs = adsorbYs.map(item => {
        const { y } = m.computeCoord2(0, item);
        return y;
    })
    props.context.assist.setSpaceAdsorbY(adsorbYs);
    const result = [...after_bounds, ...before_bounds];
    if (result.length > 1) {
        if (Math.abs(top_space - bottom_space) > 2) {
            if (after && after_spacings) spaceing_ver_line.value.push(after_spacings);
            if (before && before_spacings) spaceing_ver_line.value.push(before_spacings);
        } else {
            if (top_space > 0 && before_spacings) {
                spaceing_ver_line.value.push(before_spacings);
            }
        }
    }
    return result.length > 1 ? result : [];
}

const getAdsorbX = (box: Box, center: number, before: boolean) => {
    const spacings = [];
    for (const [key, value] of hor_spacings) {
        if (!before) {
            const before_bound = value.filter(item => item.right < box.left);
            if (before_bound.length) {
                spacings.push(box.left + key + center);
            }
        } else {
            const after_bound = value.filter(item => item.left > box.right);
            if (after_bound.length) {
                spacings.push(box.right - (key + center));
            }
        }
    }
    return spacings;
}

const getAdsorbY = (box: Box, center: number, before: boolean) => {
    const spacings = [];
    for (const [key, value] of ver_spacings) {
        if (!before) {
            const before_bound = value.filter(item => item.bottom < box.top);
            if (before_bound.length) {
                spacings.push(box.top + key + center);
            }
        } else {
            const after_bound = value.filter(item => item.top > box.bottom);
            if (after_bound.length) {
                spacings.push(box.bottom - (key + center));
            }
        }
    }
    return spacings;
}

const selectedWatcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        watch_shapes();
    }
}
const workspaceUpdate = (t: number | string) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        getIntersectShapes();
    }
}

function clear() {
    hor_spacings.clear();
    ver_spacings.clear();
    spaceing_boxs.value = [];
    spaceing_ver_line.value = [];
    spaceing_hor_line.value = [];
}

function assist_watcher(t: number) {
    if (t === Assist.CLEAR && spaceing_boxs.value.length) {
        if (props.context.workspace.transforming) return;
        clear();
    }
}

const watchedShapes = new Map<string, ShapeView>(); // 图层监听
function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(getIntersectShapes);
        watchedShapes.delete(k);
    })

    const selectedShapes = props.context.selection.selectedShapes;
    selectedShapes.forEach((v) => {
        v.watch(getIntersectShapes);
        watchedShapes.set(v.id, v)
    });
}

const filterAlpha = (a: number) => {
    const matrix = props.context.workspace.matrix;
    const m = new Matrix(matrix.inverse);
    const start = m.computeCoord2(0, 0);
    const { x } = m.computeCoord2(a, 0);
    let alpha = Math.round((x - start.x) * 100) / 100;
    if (Number.isInteger(alpha)) {
        return alpha.toFixed(0); // 返回整数形式
    } else if (Math.abs(alpha * 10 - Math.round(alpha * 10)) < Number.EPSILON) {
        return alpha.toFixed(1); // 保留一位小数
    } else {
        return alpha.toFixed(2); // 保留两位小数
    }
}

onMounted(() => {
    watch_shapes();
    props.context.workspace.watch(workspaceUpdate);
    props.context.selection.watch(selectedWatcher);
    props.context.assist.watch(assist_watcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceUpdate);
    props.context.selection.unwatch(selectedWatcher);
    props.context.assist.unwatch(assist_watcher);
})
</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" width="100"
        height="100" viewBox="0 0 100 100" style="position: absolute">
        <!-- 间距盒子 -->
        <rect v-for="(box, index) in spaceing_boxs" :key="index" :x="box.left" :y="box.top"
            :width="box.right - box.left" :height="box.bottom - box.top" fill="red" opacity="0.1"></rect>
        <!-- 水平间距线 -->
        <path v-for="(box, index) in spaceing_hor_line" :key="index"
            :d="`M ${box.left} ${(box.top + box.bottom) / 2} L ${box.right} ${(box.top + box.bottom) / 2} M ${box.left} ${((box.top + box.bottom) / 2) - 4} L ${box.left} ${((box.top + box.bottom) / 2) + 4} M ${box.right} ${((box.top + box.bottom) / 2) - 4} L ${box.right} ${((box.top + box.bottom) / 2) + 4}`"
            stroke="#ff2200"></path>
        <!-- 垂直间距线 -->
        <path v-for="(box, index) in spaceing_ver_line" :key="index"
            :d="`M ${(box.left + box.right) / 2} ${box.top} L ${(box.left + box.right) / 2} ${box.bottom} M ${((box.left + box.right) / 2) - 4} ${box.top} L ${((box.left + box.right) / 2) + 4} ${box.top} M ${((box.left + box.right) / 2) - 4} ${box.bottom} L ${((box.left + box.right) / 2) + 4} ${box.bottom}`"
            stroke="#ff2200"></path>
        <!-- 吸附线 -->
        <!-- <path v-for="(n, i) in ss" :key="i" :d="`M ${n} 0 L ${n} 1500`" stroke="#ff2200"></path> -->
    </svg>
    <!-- 水平间距大小 -->
    <template v-for="(item, index) in spaceing_hor_line" :key="index">
        <span class="size" v-if="+(item.right - item.left).toFixed(0) !== 0"
            :style="{ left: `${(item.left + item.right) / 2}px`, top: `${(item.top + item.bottom) / 2}px`, transform: `translate(-50%, 5px)` }">{{
            filterAlpha(item.right - item.left)
        }}</span>
    </template>
    <!-- 垂直间距大小 -->
    <template v-for="(item, index) in spaceing_ver_line" :key="index">
        <span class="size" v-if="+(item.right - item.left).toFixed(0) !== 0"
            :style="{ left: `${(item.left + item.right) / 2}px`, top: `${(item.top + item.bottom) / 2}px`, transform: `translate(5px, -50%)` }">{{
            filterAlpha(item.bottom - item.top)
        }}</span>
    </template>
</template>

<style scoped lang="scss">
.size {
    position: absolute;
    font-size: 12px;
    height: 25px;
    background-color: #ff2200;
    border-radius: 4px;
    color: #fff;
    padding: 0 5px;
    line-height: 2;
    z-index: 10000;
}
</style>