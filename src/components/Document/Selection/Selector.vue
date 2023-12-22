<script setup lang="ts">
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { GroupShape, Matrix, Shape, ShapeType } from '@kcdesign/data';
import { watchEffect, onMounted, onUnmounted } from 'vue';
import { XY } from '@/context/selection';
import { isTarget2 } from '@/utils/common';

export interface SelectorFrame {
    top: number
    left: number
    width: number
    height: number
    includes: boolean
}

interface Props {
    selectorFrame: SelectorFrame
    context: Context
}

const props = defineProps<Props>();
const selectedShapes: Map<string, Shape> = new Map();
let changed: boolean = false;

function select() {
    const pageMatirx = new Matrix(props.context.workspace.matrix.inverse);
    const page = props.context.selection.selectedPage;
    const selection = props.context.selection;
    if (!page) {
        return;
    }

    const { top, left, width, height } = props.selectorFrame;
    const p1: XY = pageMatirx.computeCoord2(left, top); // lt
    const p2: XY = pageMatirx.computeCoord2(left + width, top); // rt
    const p3: XY = pageMatirx.computeCoord2(left + width, top + height); // rb
    const p4: XY = pageMatirx.computeCoord2(left, top + height); //lb
    const ps: [XY, XY, XY, XY, XY] = [p1, p2, p3, p4, p1]; // 5个点方便闭合循环
    changed = false;

    if (selectedShapes.size) {
        remove(selectedShapes, ps); // 先剔除已经不再框选区的图形
    }

    finder(page.childs, ps); // 再寻找框选区外的图形

    if (changed) {
        selection.rangeSelectShape(Array.from(selectedShapes.values()));
    }
}

// 加入
function finder(childs: Shape[], Points: [XY, XY, XY, XY, XY]) {
    for (let ids = 0, len = childs.length; ids < len; ids++) {
        const shape = childs[ids];

        if (selectedShapes.get(shape.id) || shape.isLocked || !shape.isVisible) {
            continue;
        }

        if (shape.type === ShapeType.Artboard) { // 容器要判定为真的条件是完全被选区覆盖
            const _shape = shape as GroupShape;
            if (isTarget2(Points, shape, true)) {
                private_set(shape.id, shape);
                for (let i = 0; i < _shape.childs.length; i++) {
                    private_delete(_shape.childs[i].id);
                }
            } else {
                finder(_shape.childs, Points);
            }
            continue;
        }

        if (isTarget2(Points, shape, props.selectorFrame.includes)) {
            private_set(shape.id, shape);
        }
    }
}

// 剔除
function remove(childs: Map<string, Shape>, Points: [XY, XY, XY, XY, XY]) {
    childs.forEach((value, key) => {
        if (value.type === ShapeType.Artboard) {
            if (!isTarget2(Points, value, true)) {
                private_delete(key);
            }
        } else {
            if (!isTarget2(Points, value, props.selectorFrame.includes)) {
                private_delete(key);
            }
        }
    })
}

function private_delete(key: string) {
    selectedShapes.delete(key);
    changed = true;
}

function private_set(key: string, value: Shape) {
    selectedShapes.set(key, value);
    changed = true;
}

function reset(t?: number) {
    if (t === WorkSpace.SELECTING) selectedShapes.clear();
}

// hooks
onMounted(() => {
    props.context.workspace.watch(reset);
    selectedShapes.clear();
})
onUnmounted(() => {
    props.context.workspace.unwatch(reset);
})
watchEffect(select);
</script>
<template>
    <div class="selector"
        :style="{ top: `${props.selectorFrame.top}px`, left: `${props.selectorFrame.left}px`, width: `${props.selectorFrame.width}px`, height: `${props.selectorFrame.height}px` }">
    </div>
</template>
<style scoped lang="scss">
.selector {
    position: absolute;
    border: 1px solid var(--active-color);
    background-color: rgba($color: #1878f5, $alpha: 0.1);
}
</style>