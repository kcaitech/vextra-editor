<script setup lang='ts'>
import { onMounted, onUnmounted, ref, } from "vue";
import { Context } from "@/context";
import { Point } from "./SelectionView.vue";
import { ColVector3D, makeShapeTransform2By1, Matrix } from "@kcdesign/data";
import { Selection } from "@/context/selection";

interface Props {
    context: Context;
    controllerFrame: Point[];
}

const props = defineProps<Props>();
const outline = ref<Point[]>([]);

const getOutlines = (point?: Point[]) => {
    outline.value = [];
    const shapes = props.context.selection.selectedTidyUpShapes;
    if (!shapes.length) return;
    if (!point) {
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            const matrix = new Matrix();
            const matrix2 = new Matrix(props.context.workspace.matrix);
            matrix.reset(matrix2);
            const shape_root_m = shape.matrix2Root();
            const m = makeShapeTransform2By1(shape_root_m).clone();
            const clientTransform = makeShapeTransform2By1(matrix2);
            m.addTransform(clientTransform); //root到视图
            const { width, height } = shape.size;
            const { col0, col1, col2, col3 } = m.transform([
                ColVector3D.FromXY(0, 0),
                ColVector3D.FromXY(width, 0),
                ColVector3D.FromXY(width, height),
                ColVector3D.FromXY(0, height)
            ]);
            const lt = { x: col0.x, y: col0.y }
            const rt = { x: col1.x, y: col1.y }
            const rb = { x: col2.x, y: col2.y }
            const lb = { x: col3.x, y: col3.y }
            outline.value.push(lt, rt, rb, lb);
        }
    } else {
        outline.value = point;
    }
}
function selection_watcher(t: number | string, params?: any) {
    if (t === Selection.CHANGE_TIDY_UP_SHAPE) {
        getOutlines(params);
    }
}

onMounted(() => {
    props.context.selection.watch(selection_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
})
</script>
<template>
    <svg v-if="outline.length" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" data-area="controller" preserveAspectRatio="xMinYMin meet"
        viewBox="0 0 100 100" width="100" height="100" overflow="visible">
        <path
            :d="`M ${outline[0].x} ${outline[0].y} L ${outline[1].x} ${outline[1].y} L ${outline[2].x} ${outline[2].y} L ${outline[3].x} ${outline[3].y} Z`"
            fill="transparent" stroke="#1878F5" stroke-width="1"></path>
    </svg>
</template>
<style lang='scss' scoped>
.hidden {
    opacity: 0;
}

svg {
    position: absolute;
}
</style>