<script setup lang="ts">
import { Context } from '@/context';
import { Assist } from '@/context/assist';
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { XYsBounding } from '@/utils/common';
import { ShapeView } from '@kcdesign/data';
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
const getIntersectShapes = () => {
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
        const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => m.computeCoord(p.x, p.y));
        points.push(...ps);
    }
    const b = XYsBounding(points);
    const h_shapes = props.context.assist.horIntersect(b.top, b.bottom); // 水平相交的图形
    const v_shapes = props.context.assist.verIntersect(b.left, b.right); // 垂直相交的图形
    const hor = getHorDistance(b, h_shapes);
    const ver = getVerDistance(b, v_shapes);
    spaceing_boxs.value = [...hor, ...ver];
}

const getBoxs = (box: Box, shapes: ShapeView[]) => {
    const matrix = props.context.workspace.matrix;
    const selected = props.context.selection.selectedShapes;
    const boxs: { b: Box, shape: ShapeView }[] = [{ b: box, shape: selected[0] }];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const m = shape.matrix2Root();
        m.multiAtLeft(matrix);
        const frame = shape.frame;
        const lt = m.computeCoord2(0, 0);
        const rb = m.computeCoord2(frame.width, frame.height);
        const _box: Box = {
            top: lt.y,
            bottom: rb.y,
            left: lt.x,
            right: rb.x
        }
        boxs.push({ b: _box, shape });
    }

    return boxs;
}

const getHorDistance = (box: Box, shapes: ShapeView[]) => {
    if (shapes.length < 2) return [];
    hor_spacings.clear();
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
                const space = Number((boxs[i + 1].b.left - b.b.right).toFixed(4));
                if (space > 0) {
                    const box = {
                        top: Math.min(boxs[i + 1].b.top, b.b.top),
                        bottom: Math.max(boxs[i + 1].b.bottom, b.b.bottom),
                        left: b.b.right,
                        right: boxs[i + 1].b.left
                    }
                    if (hor_spacings.has(space)) {  //水平方向有无当前间距？ 存入多个间距位置
                        const bounds = hor_spacings.get(space);
                        bounds!.push(box);
                        hor_spacings.set(space, bounds!);
                    } else {
                        hor_spacings.set(space, [box]);
                    }
                }
            }
        } else { // 移动shape右侧的间距和间距位置
            if (i + 1 < boxs.length) {
                const space = Number((boxs[i + 1].b.left - b.b.right).toFixed(4));
                if (space > 0) {
                    const box = {
                        top: Math.min(boxs[i + 1].b.top, b.b.top),
                        bottom: Math.max(boxs[i + 1].b.bottom, b.b.bottom),
                        left: b.b.right,
                        right: boxs[i + 1].b.left
                    }
                    if (hor_spacings.has(space)) {
                        const bounds = hor_spacings.get(space);
                        bounds!.push(box);
                        hor_spacings.set(space, bounds!);
                    } else {
                        hor_spacings.set(space, [box]);
                    }
                }
            }
        }
    }
    let before_bounds: Box[] = [];
    let after_bounds: Box[] = [];
    let before_spacings: Box | undefined; // 移动shape左侧间距位置
    let after_spacings: Box | undefined; // 移动shape右侧间距位置
    if (boxs[move_index - 1]) {
        for (let index = move_index - 1; index > -1; index--) {
            const space = boxs[move_index].b.left - boxs[index].b.right; // 移动shape与相邻shape之间的间距是否大于0？
            if (space > 0) {
                left_space = Number(space.toFixed(4));
                const box = {
                    top: boxs[move_index].b.top,
                    bottom: boxs[move_index].b.bottom,
                    left: boxs[index].b.right,
                    right: boxs[move_index].b.left
                }
                if (hor_spacings.has(left_space)) {
                    const b = hor_spacings.get(left_space);
                    if (b) {
                        const before_bound = b.filter(item => item.right < box.left);
                        before_bounds.push(...before_bound, box);  // 存入当前移动shape与之左侧shape之间相等的间距
                    }
                }
                before_spacings = box;
                break;
            }
        }
    }
    if (boxs[move_index + 1]) {
        for (let index = move_index + 1; index < boxs.length; index++) {
            const space = boxs[index].b.left - boxs[move_index].b.right;
            if (space > 0) {
                right_space = Number(space.toFixed(4));
                const box = {
                    top: boxs[move_index].b.top,
                    bottom: boxs[move_index].b.bottom,
                    left: boxs[move_index].b.right,
                    right: boxs[index].b.left
                }
                if (hor_spacings.has(right_space)) {
                    const b = hor_spacings.get(right_space);
                    if (b) {
                        const before_bound = b.filter(item => item.left > box.right);
                        after_bounds.push(...before_bound, box);
                    }
                }
                after_spacings = box;
                break;
            }
        }
    }
    if (right_space === left_space && (after_spacings && before_spacings)) { //移动shape左右间距相等时
        after_bounds.push(after_spacings!, before_spacings!);
    }
    const result = [...after_bounds, ...before_bounds];
    return result.length > 1 ? result : [];
}

const getVerDistance = (box: Box, shapes: ShapeView[]) => {
    if (shapes.length < 2) return [];
    ver_spacings.clear();
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
                const space = Number((boxs[i + 1].b.top - b.b.bottom).toFixed(4));
                if (space > 0) {
                    const box = {
                        top: b.b.bottom,
                        bottom: boxs[i + 1].b.top,
                        left: Math.min(boxs[i + 1].b.left, b.b.left),
                        right: Math.max(boxs[i + 1].b.right, b.b.right)
                    }
                    if (ver_spacings.has(space)) {
                        const bounds = ver_spacings.get(space);
                        bounds!.push(box);
                        ver_spacings.set(space, bounds!);
                    } else {
                        ver_spacings.set(space, [box]);
                    }
                }
            }
        } else {
            if (i + 1 < boxs.length) {
                const space = Number((boxs[i + 1].b.top - b.b.bottom).toFixed(4));
                if (space > 0) {
                    const box = {
                        top: b.b.bottom,
                        bottom: boxs[i + 1].b.top,
                        left: Math.min(boxs[i + 1].b.left, b.b.left),
                        right: Math.max(boxs[i + 1].b.right, b.b.right)
                    }
                    if (ver_spacings.has(space)) {
                        const bounds = ver_spacings.get(space);
                        bounds!.push(box);
                        ver_spacings.set(space, bounds!);
                    } else {
                        ver_spacings.set(space, [box]);
                    }
                }
            }
        }
    }
    let before_bounds: Box[] = [];
    let after_bounds: Box[] = [];
    let before_spacings: Box | undefined;
    let after_spacings: Box | undefined;
    if (boxs[move_index - 1]) {
        for (let index = move_index - 1; index > -1; index--) {
            const space = boxs[move_index].b.top - boxs[index].b.bottom;
            if (space > 0) {
                top_space = Number(space.toFixed(4));
                if (top_space > 0) {
                    const box = {
                        top: boxs[index].b.bottom,
                        bottom: boxs[move_index].b.top,
                        left: boxs[move_index].b.left,
                        right: boxs[move_index].b.right
                    }
                    if (ver_spacings.has(top_space)) {
                        const b = ver_spacings.get(top_space);
                        if (b) {
                            const before_bound = b.filter(item => item.bottom < box.top);
                            before_bounds.push(...before_bound, box);
                        }
                    }
                    after_spacings = box;
                    break;
                }
            }
        }
    }
    if (boxs[move_index + 1]) {
        for (let index = move_index + 1; index < boxs.length; index++) {
            const space = boxs[index].b.top - boxs[move_index].b.bottom;
            if (space > 0) {
                bottom_space = Number(space.toFixed(4));
                const box = {
                    top: boxs[move_index].b.bottom,
                    bottom: boxs[index].b.top,
                    left: boxs[move_index].b.left,
                    right: boxs[move_index].b.right
                }
                if (ver_spacings.has(bottom_space)) {
                    const b = ver_spacings.get(bottom_space);
                    if (b) {
                        const after_bound = b.filter(item => item.top > box.bottom);
                        after_bounds.push(...after_bound, box);
                    }
                }
                before_spacings = box;
                break;
            }
        }
    }
    if (bottom_space === top_space && (after_spacings && before_spacings)) {
        after_bounds.push(after_spacings!, before_spacings!);
    }
    const result = [...after_bounds, ...before_bounds];
    console.log(result, 'result');
    
    return result.length > 1 ? result : [];
}

const _update = () => {
    getIntersectShapes();
}

const selectedWatcher = (t: number) => {
    if (t === Selection.CHANGE_SHAPE) {
        watch_shapes();
    }
}
const workspaceUpdate = (t: number) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        getIntersectShapes();
    }
}

function clear() {
    hor_spacings.clear();
    ver_spacings.clear();
    spaceing_boxs.value = [];
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
        <rect v-for="(box, index) in spaceing_boxs" :key="index" :x="box.left" :y="box.top"
            :width="box.right - box.left" :height="box.bottom - box.top" fill="red" opacity="0.2"></rect>
    </svg>
</template>

<style scoped lang="scss"></style>