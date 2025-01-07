<script lang="ts" setup>
import { ref, onMounted, onUnmounted, reactive, nextTick } from 'vue'
import { Context } from '@/context'
import { Matrix, Shape, ShapeView, TextShape } from "@kcdesign/data";
import { XYsBounding } from "@/utils/common";
import { genRectPath } from '../common'
import { WorkSpace } from '@/context/workspace'
import ShapeAvatar from './ShapeAvatar.vue';
// import { DocSelectionData } from "@/communication/modules/doc_selection_op"
import { TeamWork } from "@/context/teamwork";
import { Selection } from '@/context/selection';
import { getRandomColor } from '@/utils/color';
import { DocSelectionData } from '@/context/user';
interface Props {
    context: Context,
    params: {
        matrix: Matrix
        visible: boolean
    }
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
const multiSelect = ref<BorderPath[]>([]);
const usersSelectionList = ref<DocSelectionData[]>(props.context.selection.getUserSelection);
const matrix = new Matrix();
const shapes = ref<ShapeView[]>([]);
const submatrix = reactive(new Matrix());

const createShapeTracing = () => { // 描边 
    clear();
    const page = props.context.selection.selectedPage;
    if (!page) return;
    addSelectionColor(usersSelectionList.value.length);
    for (let i = 0; i < usersSelectionList.value.length; i++) {
        const hoveredShape: ShapeView | undefined = props.context.selection.hoveredShape;
        const selection: ShapeView[] = props.context.selection.selectedShapes;
        const userSelectInfo = usersSelectionList.value[i];
        if (page.id !== userSelectInfo.select_page_id) continue;
        const shapes: ShapeView[] = [];
        const len = userSelectInfo.select_shape_id_list.length;
        for (let i = 0; i < len; i++) {
            const shape = page.shapes.get(userSelectInfo.select_shape_id_list[i]);
            if (shape) shapes.push(shape);
        }
        if (shapes.length === 1) {
            if (hoveredShape && hoveredShape.id === shapes[0].id || selection.length > 0 && selection[0].id === shapes[0].id) continue;
            const s = selection.find(v => v.id === shapes[0].id);
            if (s) continue;
            const b = shapes[0].frame;
            let framePoint = [{ x: 0, y: 0 }, { x: b.width, y: 0 }, { x: b.width, y: b.height }, { x: 0, y: b.height }];
            const m = shapes[0].matrix2Root();
            m.multiAtLeft(matrix);
            framePoint = framePoint.map(p => m.computeCoord(p.x, p.y));
            const path = genRectPath(framePoint);
            const borPath = { path, color: userSelectColor[i] }
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
                const path = s.getPath().clone();
                path.transform(m);
                const borPath = { path: path.toString(), color: userSelectColor[i] }
                multiSelect.value.push(borPath);
            }
            const b = XYsBounding(points);
            const framePoint = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
            const borPath = { path: genRectPath(framePoint), color: userSelectColor[i] }
            tracingPath.value.push(borPath);
        }
    }
}

const clear = () => {
    tracingPath.value = [];
    selectPath.value = [];
    multiSelect.value = [];
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
    matrix.reset(props.params.matrix);
}

const workspaceUpdate = (t: number | string) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update_by_shapes();
        createShapeTracing();
    } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        update_by_shapes();
        createShapeTracing();
    }
}

const selectionWatcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        createShapeTracing();
    } else if (t === Selection.CHANGE_PAGE) {
        watchShapes();
    } else if (t === Selection.CHANGE_USER_STATE) {
        shapes.value = [];
        usersSelectionList.value = props.context.selection.getUserSelection;
        const page = props.context.selection.selectedPage;
        props.context.selection.getUserSelection.forEach(item => {
            for (let i = 0; i < item.select_shape_id_list.length; i++) {
                const shape = page!.shapes.get(item.select_shape_id_list[i]);
                if (shape) shapes.value.push(shape);
            }
            shapes.value = Array.from(new Set(shapes.value));
            update_by_shapes();
            createShapeTracing();
            watchShapes();
        })
    }
}
let throttle = true;
let timer: any = null;
const watcher = () => {
    if (throttle) {
        throttle = false;
        clear();
        setTimeout(() => {
            update_by_shapes();
            createShapeTracing();
        }, 10)
        timer = setTimeout(() => {
            throttle = true;
            clearTimeout(timer);
        }, 300)
    }
}

const watchedShapes = new Map();
function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    if (shapes.value) {
        shapes.value.forEach((v) => {
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

const addSelectionColor = (length: number) => {
    if (length < 11) return;
    for (let i = 10; i < length; i++) {
        userSelectColor.push(getRandomColor());
    }
}

onMounted(() => {
    watchShapes();
    update_by_shapes();
    createShapeTracing();
    props.context.workspace.watch(workspaceUpdate);
    props.context.selection.watch(selectionWatcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceUpdate);
    props.context.selection.unwatch(selectionWatcher);

})
</script>

<template>
    <svg v-if="props.params.visible" version="1.1" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xhtml="http://www.w3.org/1999/xhtml"
        preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100" :height="100" viewBox="0 0 100 100"
        style="position: absolute">
        <path v-for="(p, i) in tracingPath" :key="i" :d="p.path" fill="transparent" :stroke="p.color"
            stroke-width="1.5px" opacity="0.8"></path>
        <path v-for="(p, i) in multiSelect" :key="i" :d="p.path" fill="transparent" :stroke="p.color" stroke-width="1px"
            opacity="0.5"></path>
        <!-- <path v-for="(p, i) in selectPath" :key="i" :d="p.path" :fill="p.color" fill-opacity="0.5" stroke='none'></path> -->
    </svg>
    <ShapeAvatar v-if="props.params.visible" :context="props.context" :matrix="props.params.matrix"></ShapeAvatar>
</template>

<style lang="scss" scoped></style>