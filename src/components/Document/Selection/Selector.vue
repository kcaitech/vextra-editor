/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { find4select, Matrix, ShapeFrame, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, watchEffect } from 'vue';
import { XY } from '@/context/selection';
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
function select() {
    const { top, left, width, height } = props.params.frame;
    if (width === height && height === 0) return;

    const selection = props.context.selection;
    const page = selection.selectedPage!;
    const m = new Matrix(props.context.workspace.matrix.inverse);
    m.multiAtLeft(page.matrix2Root().inverse.toMatrix());

    const p1: XY = m.computeCoord2(left, top);
    const p3: XY = m.computeCoord2(left + width, top + height);
    const rect = new ShapeFrame(p1.x, p1.y, p3.x - p1.x, p3.y - p1.y);

    let changed = false;
    const selected = find4select(selection.selectedPage!, rect, props.params.frame.includes);
    if (selected.length !== selectedShapes.size) {
        changed = true;
        selectedShapes.clear();
        selected.forEach(s => selectedShapes.set(s.id, s))
    } else {
        selected.forEach(s => {
            if (!selectedShapes.has(s.id)) {
                selectedShapes.set(s.id, s)
                changed = true;
            }
        })
        if (changed) {
            const cur = new Set(selected.map(s => s.id));
            const keys = Array.from(selectedShapes.keys());
            keys.forEach(k => {
                if (!cur.has(k)) selectedShapes.delete(k)
            });
        }
    }
    if (changed) selection.rangeSelectShape(Array.from(selectedShapes.values()));
}

function reset(t: number) {
    if (t === WorkSpace.SELECTING) selectedShapes.clear();
}
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
<div
    v-if="props.params.visible"
    class="selector"
    :style="{ top: `${props.params.frame.top}px`, left: `${props.params.frame.left}px`, width: `${props.params.frame.width}px`, height: `${props.params.frame.height}px`}"
/>
</template>
<style scoped lang="scss">
.selector {
    position: absolute;
    border: 1px solid var(--active-color);
    background-color: rgba($color: #1878f5, $alpha: 0.1);
}
</style>