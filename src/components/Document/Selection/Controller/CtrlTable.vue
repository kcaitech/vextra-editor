<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, Shape, TableCell, TableCellType, TableShape, Text, TableGridItem } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, ref, reactive, computed, shallowRef } from 'vue';
import { genRectPath } from '../common';
import { Point } from "../SelectionView.vue";
import { ClientXY, Selection } from '@/context/selection';
import { getAxle } from '@/utils/common';
import BarsContainer from "./Bars/BarsContainerForTable.vue";
import PointsContainer from "./Points/PointsContainerForTable.vue";
import { useController } from './controller2';
import TextInput from './Text/TextInput.vue';
import SelectView from "./Text/SelectView.vue";
import TableHeader from './Table/TableHeader.vue';
import TableSelectionView from './Table/TableSelectionView.vue';
import TableCellsMenu from '@/components/Document/Menu/TableMenu/TableCellsMenu.vue';
import { CellMenu } from '@/context/menu';
type TextShape = Shape & { text: Text };
const props = defineProps<{
    context: Context,
    controllerFrame: Point[],
    rotate: number,
    matrix: Matrix, // root->屏幕 变换矩阵
    shape: TableShape
}>();
const { tableSelection } = useController(props.context);
const matrix = new Matrix();
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
const submatrix = reactive(new Matrix());
const submatrixArray = computed(() => submatrix.toArray());
const cell_menu = ref<boolean>(false);
const cell_menu_type = ref<CellMenu>(CellMenu.MultiSelect);
const cell_menu_posi = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const axle = computed<ClientXY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});
const editingCell = shallowRef<TableGridItem & { cell: TableCell | undefined }>();

const editingCellMatrix = computed(() => {
    matrix.reset(submatrix.toArray());
    if (editingCell.value) {
        matrix.preTrans(editingCell.value.frame.x, editingCell.value.frame.y);
    }
    return matrix.toArray();
})
function update() {
    const m2p = props.shape.matrix2Root();
    matrix.reset(m2p);
    matrix.multiAtLeft(props.matrix); // table -> 屏幕
    if (!submatrix.equals(matrix)) {
        submatrix.reset(matrix);
    }
    const frame = props.shape.frame;
    const points = [
        { x: 0, y: 0 }, // left top
        { x: frame.width, y: 0 }, //right top
        { x: frame.width, y: frame.height }, // right bottom
        { x: 0, y: frame.height }, // left bottom
    ];
    const boundrect = points.map((point) => matrix.computeCoord(point.x, point.y));
    boundrectPath.value = genRectPath(boundrect);
    const p0 = boundrect[0];
    bounds.left = p0.x;
    bounds.top = p0.y;
    bounds.right = p0.x;
    bounds.bottom = p0.y;
    boundrect.reduce((bounds, point) => {
        if (point.x < bounds.left) bounds.left = point.x;
        else if (point.x > bounds.right) bounds.right = point.x;
        if (point.y < bounds.top) bounds.top = point.y;
        else if (point.y > bounds.bottom) bounds.bottom = point.y;
        return bounds;
    }, bounds)
    if (editingCell.value && editingCell.value.cell) {
        editingCell.value = props.shape.locateCell2(editingCell.value.cell);
    }
}
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + (bounds.right - bounds.left) + " " + (bounds.bottom - bounds.top);
}
function isEditingText() {
    return editingCell.value &&
        editingCell.value.cell &&
        editingCell.value.cell.cellType === TableCellType.Text &&
        editingCell.value.cell.text;
}
const closeCellMenu = () => {
    cell_menu.value = false;
}
function selection_watcher(t: number) {
    if (t === Selection.CHANGE_EDITING_CELL) {
        editingCell.value = tableSelection().editingCell;
    }
}
function init() {
    editingCell.value = undefined;
    update();
}
function update_menu_posi(x: number, y: number, cmt: CellMenu, cm: boolean) {
    cell_menu_posi.value.x = x, cell_menu_posi.value.y = y, cell_menu_type.value = cmt, cell_menu.value = cm;
}
watch(() => props.matrix, update, { deep: true })
watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.shape.watch(update);
    init();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.shape.unwatch(update);
})
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :viewBox=genViewBox(bounds)
        :width="bounds.right - bounds.left" :height="bounds.bottom - bounds.top"
        :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }"
        overflow="visible">
        <!-- 表格选区 -->
        <TableSelectionView :context="props.context" @get-menu="update_menu_posi"></TableSelectionView>
        <!-- 文本选区 -->
        <SelectView v-if="editingCell && editingCell.cell && editingCell.cell.cellType === TableCellType.Text"
            :context="props.context" :shape="(editingCell.cell as TextShape)" :matrix="editingCellMatrix"></SelectView>
        <!-- 列宽缩放 -->
        <BarsContainer :context="props.context" :matrix="submatrixArray" :shape="props.shape"
            :c-frame="props.controllerFrame">
        </BarsContainer>
        <!-- 表头 -->
        <TableHeader :context="props.context" :matrix="submatrixArray" :shape="props.shape" :c-frame="props.controllerFrame"
            @get-menu="update_menu_posi"></TableHeader>
        <!-- 表格拖拽 -->
        <PointsContainer :context="props.context" :matrix="submatrixArray" :shape="props.shape"
            :c-frame="props.controllerFrame" :axle="axle">
        </PointsContainer>
    </svg>
    <TextInput v-if="isEditingText()" :context="props.context" :shape="(editingCell!.cell as TextShape)"
        :matrix="editingCellMatrix"></TextInput>
    <TableCellsMenu :cells="[]" v-if="cell_menu" :context="props.context" @close="closeCellMenu"
        :position="{ x: cell_menu_posi.x, y: cell_menu_posi.y }" :cell-menu="cell_menu_type"></TableCellsMenu>
</template>
<style lang='scss' scoped></style>