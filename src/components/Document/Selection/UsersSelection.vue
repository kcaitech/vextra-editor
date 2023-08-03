<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Context } from '@/context'
import { Matrix, Shape } from "@kcdesign/data";
import { Selection, UserSelection } from '@/context/selection'
import { XYsBounding } from "@/utils/common";
import { genRectPath } from './common'
import { WorkSpace } from '@/context/workspace'
interface Props {
    context: Context
    matrix: Matrix
}
const props = defineProps<Props>();
const tracingPath = ref<string[]>([]);
const isHover = ref<boolean>(false);
const usersSelectionList = ref<UserSelection[]>(props.context.selection.getUserSelection)
const matrix = new Matrix();

const createShapeTracing = () => { // 描边 
    tracingPath.value = []
    for (let i = 0; i < usersSelectionList.value.length; i++) {
        const hoveredShape: Shape | undefined = props.context.selection.hoveredShape;
        const userSelectInfo = usersSelectionList.value[i]
        const shapes = userSelectInfo.selectShapes
        const len = shapes.length
        if (len === 1) {
            const m = shapes[0].matrix2Root()
            m.multiAtLeft(matrix)
            const path = shapes[0].getPath()
            path.transform(m)
            tracingPath.value.push(path.toString())
        } else if (len > 1) {
            const points: { x: number, y: number }[] = [];
            for (let index = 0; index < shapes.length; index++) {
                const s = shapes[index];
                const m = s.matrix2Root()
                m.multiAtLeft(matrix)
                const f = s.frame
                const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => m.computeCoord(p.x, p.y));
                points.push(...ps);
            }
            const b = XYsBounding(points);
            const framePoint = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
            tracingPath.value.push(genRectPath(framePoint))
        }
    }
}

function update_by_shapes() {
    matrix.reset(props.matrix);
}

const selectionWatcher = (t?: any) => {
    if (t === Selection.CHANGE_USER_STATE) {
        usersSelectionList.value = props.context.selection.getUserSelection
        update_by_shapes()
        createShapeTracing()
    }
    if(t === Selection.CHANGE_SHAPE_HOVER) {
        createShapeTracing()
    }
}

const workspaceUpdate = (t: number) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        matrix.reset(props.matrix);
        createShapeTracing()
    }
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        matrix.reset(props.matrix);
        createShapeTracing();
    }
}

watch(() => props.matrix, update_by_shapes, { deep: true });

onMounted(() => {
    props.context.workspace.watch(workspaceUpdate)
    props.context.selection.watch(selectionWatcher)
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceUpdate)
    props.context.selection.unwatch(selectionWatcher)
})
</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="position: absolute">
        <path v-for="(p, i) in tracingPath" :key="i" :d="p" fill="transparent" stroke="#ac08b8" stroke-width="1.5px"
            opacity="0.6"></path>
    </svg>
</template>

<style lang="scss" scoped></style>