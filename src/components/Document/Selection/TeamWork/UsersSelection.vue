<script lang="ts" setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { Context } from '@/context'
import { Matrix, Shape, TextShape } from "@kcdesign/data";
import { XYsBounding } from "@/utils/common";
import { genRectPath } from '../common'
import { WorkSpace } from '@/context/workspace'
import ShapeAvatar from './ShapeAvatar.vue';
import { DocSelectionData } from "@/communication/modules/doc_selection_op"
import { TeamWork } from "@/context/teamwork";
interface Props {
    context: Context
    matrix: Matrix
}

const userSelectColor = ['#FF7A05', '#FFAB05', '#E701FF', '#FF0172', '#00C9C5', '#0199FF', '#6FFFAC', '#36C45F', '#13D6F4', '#9112D1']
const props = defineProps<Props>();
type BorderPath = {
    path: string
    color: string
}
type TextFillPath = {
    path: string
    color: string
}
const tracingPath = ref<BorderPath[]>([]);
const selectPath = ref<TextFillPath[]>([]);
const usersSelectionList = ref<DocSelectionData[]>(props.context.teamwork.getUserSelection);
const matrix = new Matrix();
const submatrix = reactive(new Matrix());
const createShapeTracing = () => { // 描边 
    tracingPath.value = [];
    selectPath.value = [];
    const page = props.context.selection.selectedPage;
    if (!page) return;
    for (let i = 0; i < usersSelectionList.value.length; i++) {
        const hoveredShape: Shape | undefined = props.context.selection.hoveredShape;
        const selection: Shape[] = props.context.selection.selectedShapes;
        const userSelectInfo = usersSelectionList.value[i];
        if(page.id !== userSelectInfo.select_page_id) continue;
        const shapes: Shape[] = [];
        const len = userSelectInfo.select_shape_id_list.length;
        for (let i = 0; i < len; i++) {
            const shape = page.shapes.get(userSelectInfo.select_shape_id_list[i]);
            if (shape) shapes.push(shape);
        }
        if (shapes.length === 1) {
            if (hoveredShape && hoveredShape.id === shapes[0].id || selection.length > 0 && selection[0].id === shapes[0].id) continue
            const s = selection.find(v => v.id === shapes[0].id);
            if (s) continue;
            const m = shapes[0].matrix2Root();
            m.multiAtLeft(matrix);
            const path = shapes[0].getPath();
            path.transform(m);
            const borPath = {path: path.toString(), color: userSelectColor[i]}
            tracingPath.value.push(borPath);
            // if (shapes[0] instanceof TextShape) {
            //     const m2p = shapes[0].matrix2Root();
            //     submatrix.reset(m2p);
            //     submatrix.multiAtLeft(props.matrix);
            //     submatrix.reset(submatrix as Matrix)
            //     const path = shapes[0].text.locateRange(userSelectInfo.cursorStart, userSelectInfo.cursorEnd).map((point) => submatrix.computeCoord(point.x, point.y))
            //     const textPath = {path: genRectPath(path), color: userSelectColor[i]}
            //     selectPath.value.push(textPath)
            // }
        } else if (shapes.length > 1) {
            if (arraysOfObjectsWithIdAreEqual(shapes, selection)) continue;
            const points: { x: number, y: number }[] = [];
            for (let index = 0; index < shapes.length; index++) {
                const s = shapes[index];
                const m = s.matrix2Root();
                m.multiAtLeft(matrix);
                const f = s.frame;
                const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => m.computeCoord(p.x, p.y));
                points.push(...ps);
            }
            const b = XYsBounding(points);
            const framePoint = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
            const borPath = {path: genRectPath(framePoint), color: userSelectColor[i]}
            tracingPath.value.push(borPath);
        }
    }
}

function arraysOfObjectsWithIdAreEqual(arr1: any, arr2: any) {
    const idsSet1 = new Set(arr1.map((obj: any) => obj.id));
    const idsSet2 = new Set(arr2.map((obj: any) => obj.id));

    for (const id of idsSet1) {
        if (!idsSet2.has(id)) {
            return false;
        }
    }
    return true;
}

function update_by_shapes() {
    matrix.reset(props.matrix);
}

const selectionWatcher = (t?: any) => {
    if (t === TeamWork.CHANGE_USER_STATE) {
        usersSelectionList.value = props.context.teamwork.getUserSelection;
        update_by_shapes();
        createShapeTracing();
        watchShapes();
    }
}

const workspaceUpdate = (t: number) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update_by_shapes();
        createShapeTracing()
    } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        update_by_shapes();
        createShapeTracing();
    }
}

const watcher = () => {
    update_by_shapes();
    createShapeTracing();
}

const watchedShapes = new Map();
function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    const page = props.context.selection.selectedPage;
    const shapes: Shape[] = [];
    usersSelectionList.value.forEach(item  => {
        for (let i = 0; i < item.select_shape_id_list.length; i++) {
            const shape = page!.shapes.get(item.select_shape_id_list[i]);
            if (shape) shapes.push(shape);
        }
    })
    if (shapes) {
        shapes.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(watcher);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(watcher);
        watchedShapes.set(k, v);
    })
}

onMounted(() => {
    watchShapes();
    update_by_shapes();
    createShapeTracing();
    props.context.workspace.watch(workspaceUpdate);
    props.context.teamwork.watch(selectionWatcher)
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceUpdate);
    props.context.teamwork.unwatch(selectionWatcher)
})
</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="position: absolute">
        <path v-for="(p, i) in tracingPath" :key="i" :d="p.path" fill="transparent" :stroke="p.color" stroke-width="1.5px"
            opacity="0.8"></path>
        <!-- <path v-for="(p, i) in selectPath" :key="i" :d="p.path" :fill="p.color" fill-opacity="0.5" stroke='none'></path> -->
    </svg>
    <ShapeAvatar :context="props.context" :matrix="props.matrix"></ShapeAvatar>
</template>

<style lang="scss" scoped></style>