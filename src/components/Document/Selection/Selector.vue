<script setup lang="ts">
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { find4select, Matrix, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, watchEffect } from 'vue';
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

    if (width === height && height === 0) {
        return
    }
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (!page) {
        return;
    }
    const m = new Matrix(props.context.workspace.matrix);
    m.multiAtLeft(page.matrix2Root());
    const pageMatirx = new Matrix(m.inverse);

    const p1: XY = pageMatirx.computeCoord2(left, top); // lt
    const p2: XY = pageMatirx.computeCoord2(left + width, top); // rt
    const p3: XY = pageMatirx.computeCoord2(left + width, top + height); // rb
    const p4: XY = pageMatirx.computeCoord2(left, top + height); //lb

    let changed = false;
    const selected = find4select(page, [p1, p2, p3, p4], props.params.frame.includes);
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
            const cur = new Set(...selected.map(s => s.id))
            const keys = Array.from(selectedShapes.keys())
            keys.forEach(k => {
                if (!cur.has(k)) selectedShapes.delete(k)
            })
        }
    }
    if (changed) {
        selection.rangeSelectShape(Array.from(selectedShapes.values()));
    }
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