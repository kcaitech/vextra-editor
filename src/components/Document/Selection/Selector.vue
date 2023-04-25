<script setup lang="ts">
import { Context } from '@/context';
import { GroupShape, Shape } from '@kcdesign/data/data/shape';
import { defineProps, watchEffect } from 'vue';
export interface SelectorFrame {
    top: number,
    left: number,
    width: number,
    height: number
}
interface Props {
    selectorFrame: SelectorFrame,
    context: Context
}
const props = defineProps<Props>();
function select() {
    const pageMatirx = props.context.workspace.matrix;
    const page = props.context.selection.selectedPage;
    const shapes: Shape[] = [];
    if (page) {
        const { top, left, width, height } = props.selectorFrame
        const x1 = pageMatirx.inverseCoord(left, top)
        const x2 = pageMatirx.inverseCoord(left + width, top + height);
        deep(page.childs, x1.y, x2.y, x1.x, x2.x);
        const __shapes: Shape[] = [];
        shapes.forEach(i => {
            if (!__shapes.includes(i)) {
                __shapes.push(i);
            }
        })
        if (shapes.length !== props.context.selection.selectedShapes.length) {
            props.context.selection.rangeSelectShape(shapes);
        }
    }

    function deep(childs: Shape[], t: number, b: number, l: number, r: number) {
        for (let i = 0; i < childs.length; i++) {
            const m = childs[i].matrix2Page();
            const frame = childs[i].frame;
            let points: [number, number][] = [
                [0, 0],
                [frame.width, 0],
                [frame.width, frame.height],
                [0, frame.height],
            ];
            points = points.map(p => {
                const { x, y } = m.computeCoord(p[0], p[1]);
                return [x, y]
            })
            points.forEach(p => {
                if (p[0] >= l && p[0] <= r && p[1] <= b && p[1] >= t) {
                    shapes.push(childs[i]);
                }
            })
            if ((childs[i] as GroupShape)?.childs?.length) {
                deep((childs[i] as GroupShape).childs, t, b, l, r);
            }
        }
    }
}
watchEffect(select)
</script>
<template>
    <div class="selector"
        :style="{ top: `${props.selectorFrame.top}px`, left: `${props.selectorFrame.left}px`, width: `${props.selectorFrame.width}px`, height: `${props.selectorFrame.height}px` }">
    </div>
</template>
<style scoped lang="scss">
.selector {
    position: absolute;
    border: 1px solid orange;
    background-color: rgba($color: orange, $alpha: 0.05);
}
</style>