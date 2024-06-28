<script setup lang="ts">
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { GroupShapeView, Matrix, ShapeType, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, watchEffect } from 'vue';
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
    params: {
        visible: boolean
        frame: SelectorFrame
    }
    context: Context
}

const props = defineProps<Props>();
const selectedShapes: Map<string, ShapeView> = new Map();
let changed: boolean = false;

function select() {
    const { top, left, width, height } = props.params.frame;

    if (width === height && height === 0) {
        return
    }
    const pageMatirx = new Matrix(props.context.workspace.matrix.inverse);

    const selection = props.context.selection;

    const page = selection.selectedPage;
    if (!page) {
        return;
    }

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

function is_target_for_group(shape: GroupShapeView, points: [XY, XY, XY, XY, XY]): boolean {
    if (props.params.frame.includes) {
        return isTarget2(points, shape, true);
    }

    return deep(shape);

    function deep(shape: GroupShapeView) {
        const children = shape.childs;

        for (let i = 0, l = children.length; i < l; i++) {
            const s = children[i];
            if (s.type === ShapeType.Group) {
                if (deep(s as GroupShapeView)) {
                    return true;
                }
            }
            else if (isTarget2(points, s, false)) {
                return true;
            }
        }

        return false;
    }
}

// 加入
function finder(childs: ShapeView[], points: [XY, XY, XY, XY, XY]) {
    for (let ids = 0, len = childs.length; ids < len; ids++) {
        const shape = childs[ids];

        if (selectedShapes.get(shape.id) || shape.isLocked || !shape.isVisible) {
            continue;
        }

        let p = shape.parent;
        let f = false;
        while (p) {
            if (selectedShapes.get(p.id)) {
                f = true;
                console.log('有这回事情吗')
                break;
            }
            p = p.parent;
        }
        if (f) {
            continue;
        }

        if (shape.type === ShapeType.Artboard && shape.childs.length) {
            const _shape = shape as GroupShapeView;

            if (isTarget2(points, _shape, true)) {  // 容器要判定为真的条件是完全被选区覆盖
                private_set(_shape.id, _shape);

                for (let i = 0; i < _shape.childs.length; i++) {
                    private_delete(_shape.childs[i]);
                }
            }
            else {
                if (isTarget2(points, _shape)) {
                    finder(_shape.childs, points);
                }
            }
            continue;
        }

        if (shape.type === ShapeType.Group) {
            if (is_target_for_group(shape as GroupShapeView, points)) {
                private_set(shape.id, shape);
            }
            continue;
        }

        if (isTarget2(points, shape, props.params.frame.includes)) {
            private_set(shape.id, shape);
        }
    }
}

// 剔除
function remove(childs: Map<string, ShapeView>, points: [XY, XY, XY, XY, XY]) {
    childs.forEach((value, key) => {
        if (value.type === ShapeType.Artboard) {
            if (!isTarget2(points, value, true)) {
                private_delete(value);
            }
        } else if (value.type === ShapeType.Group) {
            if (!is_target_for_group(value as GroupShapeView, points)) {
                private_delete(value);
            }
        } else {
            if (!isTarget2(points, value, props.params.frame.includes)) {
                private_delete(value);
            }
        }
    })
}

function private_delete(shape: ShapeView) {
    selectedShapes.delete(shape.id);

    if (shape.type === ShapeType.Artboard) {
        for (let i = 0; i < shape.childs.length; i++) {
            private_delete(shape.childs[i])
        }
    }
    changed = true;
}

function private_set(key: string, value: ShapeView) {
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
    <div class="selector" v-if="props.params.visible"
        :style="{ top: `${props.params.frame.top}px`, left: `${props.params.frame.left}px`, width: `${props.params.frame.width}px`, height: `${props.params.frame.height}px` }">
    </div>
</template>
<style scoped lang="scss">
.selector {
    position: absolute;
    border: 1px solid var(--active-color);
    background-color: rgba($color: #1878f5, $alpha: 0.1);
}
</style>