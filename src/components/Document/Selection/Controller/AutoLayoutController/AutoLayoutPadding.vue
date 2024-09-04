<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { ArtboradView, ColVector3D, Matrix, makeShapeTransform2By1 } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { WorkSpace } from '@/context/workspace';

type Box = {
    lt: Point,
    rt: Point,
    rb: Point,
    lb: Point
}

interface Props {
    context: Context
    paddintIndex: number
}

interface Point {
    x: number,
    y: number
}

const props = defineProps<Props>();
const paddingBox = ref<Box[]>([]);
const matrix = reactive(new Matrix());
const paddingRect = ref<SVGPathElement[]>([]);

function update() {
    update_padding_position();
}

const update_padding_position = () => {
    getPaddingPosition();
}

function getPaddingPosition() {
    paddingBox.value = [];
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length || shapes.length > 1) return;
    const shape = shapes[0] as ArtboradView;
    const { x, y, width, height } = shape.frame;
    const autoLayout = shape.autoLayout;
    if (!autoLayout) return;
    const matrix2 = new Matrix(props.context.workspace.matrix);
    matrix.reset(matrix2);
    const shape_root_m = shape.matrix2Root();
    const m = makeShapeTransform2By1(shape_root_m).clone();
    const clientTransform = makeShapeTransform2By1(matrix2);
    m.addTransform(clientTransform); //root到视图
    // 上边距
    const topPadding = m.transform([
        ColVector3D.FromXY(x, y),
        ColVector3D.FromXY(x + width, y),
        ColVector3D.FromXY(x + width, y + autoLayout.stackVerticalPadding),
        ColVector3D.FromXY(x, y + autoLayout.stackVerticalPadding)
    ]);
    const top: Box = { lt: topPadding.col0, rt: topPadding.col1, rb: topPadding.col2, lb: topPadding.col3 };
    // 右边距
    const rightPadding = m.transform([
        ColVector3D.FromXY(x + width - autoLayout.stackPaddingRight, y),
        ColVector3D.FromXY(x + width, y),
        ColVector3D.FromXY(x + width, y + height),
        ColVector3D.FromXY(x + width - autoLayout.stackPaddingRight, y + height)
    ]);
    const right: Box = { lt: rightPadding.col0, rt: rightPadding.col1, rb: rightPadding.col2, lb: rightPadding.col3 };
    // 下边距
    const bottomPadding = m.transform([
        ColVector3D.FromXY(x, y + height - autoLayout.stackPaddingBottom),
        ColVector3D.FromXY(x + width, y + height - autoLayout.stackPaddingBottom),
        ColVector3D.FromXY(x + width, y + height),
        ColVector3D.FromXY(x, y + height)
    ]);
    const bottom: Box = { lt: bottomPadding.col0, rt: bottomPadding.col1, rb: bottomPadding.col2, lb: bottomPadding.col3 };
    // 左边距
    const leftPadding = m.transform([
        ColVector3D.FromXY(x, y),
        ColVector3D.FromXY(x + autoLayout.stackHorizontalPadding, y),
        ColVector3D.FromXY(x + autoLayout.stackHorizontalPadding, y + height),
        ColVector3D.FromXY(x, y + height)
    ]);
    const left: Box = { lt: leftPadding.col0, rt: leftPadding.col1, rb: leftPadding.col2, lb: leftPadding.col3 };
    paddingBox.value.push(top, right, bottom, left);
}

const mouseenter = (e: MouseEvent, index: number) => {
    const el = paddingRect.value[index];
    if (props.context.workspace.transforming) {
        return;
    }
    if (el) el.style.fill = 'pink';
}

const mouseleave = (e: MouseEvent, index: number) => {
    const el = paddingRect.value[index];
    if (el && index !== props.paddintIndex) {
        el.style.fill = 'transparent';
    }
}

watch(() => props.paddintIndex, (v) => {
    if (props.context.workspace.transforming) {
        return;
    }
    if (props.paddintIndex > -1) {
        const el = paddingRect.value[props.paddintIndex];
        if (el) {
            el.style.fill = 'pink';
        }
    }
})

const watchedShapes = new Map();

function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection.selectedShapes;
    if (selection) {
        selection.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(update);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(update);
        watchedShapes.set(k, v);
    })
}

const workspaceWatcher = (t: number | string) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    }
}
const selectionWatcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        update();
        watchShapes();
    }
}
onMounted(() => {
    update();
    watchShapes();
    props.context.workspace.watch(workspaceWatcher);
    props.context.selection.watch(selectionWatcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceWatcher);
    props.context.selection.unwatch(selectionWatcher);
    watchedShapes.forEach((v, k) => {
        v.unwatch(update);
        watchedShapes.delete(k);
    })
})
</script>

<template>
    <g v-if="paddingBox.length">
        <path v-for="(box, index) in paddingBox" :key="index" class="padding-rect" ref="paddingRect"
            @mouseenter="(e) => mouseenter(e, index)" @mouseleave="(e) => mouseleave(e, index)"
            :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
    </g>
</template>

<style scoped lang="scss">
.padding-rect {
    fill: transparent;
    opacity: 0.5;
}
</style>