<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, Shape, TableCell, TableCellType, TableShape, Text, TableGridItem } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, ref, reactive, computed, shallowRef } from 'vue';
import HoverCell from './Table/HoverCell.vue';
import { genRectPath, throttle } from '../common';
import { Point } from "../SelectionView.vue";
import { ClientXY } from '@/context/selection';
import { getAxle } from '@/utils/common';
import BarsContainer from "./Bars/BarsContainer.SVG.vue";
import PointsContainer from "./Points/PointsContainer.SVG.vue";
import { useController } from './controller';
import TextInput from './Text/TextInput.vue';
import SelectView from "./Text/SelectView.vue";
import { useImagePicker } from './Table/loadimage';
import { v4 as uuid } from "uuid"
import { useI18n } from 'vue-i18n';
import { textState } from './Table/celltextstate';

type TextShape = Shape & { text: Text };

const props = defineProps<{
    context: Context,
    controllerFrame: Point[],
    rotate: number,
    matrix: number[],
    shape: TableShape | TableCell
}>();

let table: TableShape = props.shape instanceof TableShape ? props.shape : props.shape.parent as TableShape;

const matrix = new Matrix();
const update = throttle(_update, 5);
function _update() {
    const m2p = table.matrix2Root();
    matrix.reset(m2p);
    matrix.multiAtLeft(props.matrix);
    if (!submatrix.equals(matrix)) {
        submatrix.reset(matrix);
    }
    const frame = table.frame;
    const points = [
        { x: 0, y: 0 }, // left top
        { x: frame.width, y: 0 }, //right top
        { x: frame.width, y: frame.height }, // right bottom
        { x: 0, y: frame.height }, // left bottom
    ];

    const boundrect = points.map((point) => matrix.computeCoord(point.x, point.y));
    boundrectPath.value = genRectPath(boundrect);
    props.context.workspace.setCtrlPath(boundrectPath.value);
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

    if (editingCell.value) {
        editingCell.value = table.locateCell2(editingCell.value.cell);
    }
    if (hoveringCell.value) {
        hoveringCell.value = table.locateCell2(hoveringCell.value.cell);
    }
}

watch(() => props.matrix, () => {
    update();
})

watch(() => props.shape, (value, old) => {
    const curTable = value instanceof TableShape ? value : value.parent as TableShape;
    if (curTable.id !== table.id) {
        table.unwatch(update);
        curTable.watch(update);
        table = curTable;
        update();
    }
})

onMounted(() => {
    table.watch(update);
    update();
})

onUnmounted(() => {
    table.unwatch(update);
})

const editing = ref<boolean>(false);
const visible = ref<boolean>(true);
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
const submatrix = reactive(new Matrix());
const submatrixArray = computed(() => submatrix.toArray())

const axle = computed<ClientXY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});
// #region 绘制控件
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + (bounds.right - bounds.left) + " " + (bounds.bottom - bounds.top);
}

const editingCell = shallowRef<TableGridItem>();
const hoveringCell = shallowRef<TableGridItem>();

const editingCellMatrix = computed(() => {
    matrix.reset(submatrix.toArray());
    if (editingCell.value) {
        matrix.preTrans(editingCell.value.frame.x, editingCell.value.frame.y);
    }
    return matrix.toArray();
})

const hoveringCellMatrix = computed(() => {
    matrix.reset(submatrix.toArray());
    if (hoveringCell.value) {
        matrix.preTrans(hoveringCell.value.frame.x, hoveringCell.value.frame.y);
    }
    return matrix.toArray();
})

const { t } = useI18n();

let cellState: {
    onMouseDown: (e: MouseEvent) => void,
    onMouseEnter: (e: MouseEvent) => void,
    onMouseLeave: (e: MouseEvent) => void,
    dispose: (e: MouseEvent) => void,
    props: {
        shape: TableCell,
        matrix: number[],
        context: Context
    }
} | undefined;
function getCellState(cell: TableCell) {
    if (!cellState) {
        cellState = textState({
            shape: cell,
            matrix: editingCellMatrix.value,
            context: props.context
        }, t)
    }
    else {
        cellState.props.shape = cell;
        cellState.props.matrix = editingCellMatrix.value;
    }
    return cellState;
}

function isInCell(xy: { x: number, y: number }, cell: TableGridItem) {
    return xy.x > cell.frame.x && xy.y > cell.frame.y && (xy.x - cell.frame.x) < cell.frame.width && (xy.y - cell.frame.y) < cell.frame.height;
}

function onLoadImage(name: string, data: { buff: Uint8Array, base64: string }, cell: TableCell) {
    // const data = loadImage(name, buffer);
    const id = uuid();
    props.context.data.mediasMgr.add(id, data);
    const editor = props.context.editor4Table(table)
    editor.setCellContentImage(cell, id);
}
const pickImage = useImagePicker();

function mousedown(e: MouseEvent) {
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);

    // find cell
    const workspace = props.context.workspace;
    const { clientX, clientY } = e;
    const root = workspace.root;
    matrix.reset(submatrixArray.value);
    const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    if (editingCell.value && isInCell(xy, editingCell.value)) {
        getCellState(editingCell.value.cell).onMouseDown(e);
        return;
    }

    const cell = table.locateCell(xy.x, xy.y);
    if (!cell) return;
    if (cell.cell.cellType === TableCellType.Image) {
        pickImage((name: string, data: { buff: Uint8Array, base64: string }) => {
            onLoadImage(name, data, cell.cell);
        });
        e.stopPropagation();
        e.preventDefault();
        return;
    }
    if ((cell.cell.cellType ?? TableCellType.None) === TableCellType.None) {
        const editor = props.context.editor4Table(table as TableShape)
        editor.setCellContentText(cell.cell)
    }
    // editing cell
    props.context.selection.selectTableCell(cell.cell, cell.index.row, cell.index.col);
    editingCell.value = cell;
    getCellState(cell.cell).onMouseDown(e);
}

const { isDrag } = useController(props.context);
function mousemove(e: MouseEvent) {
    const isDragging = isDrag();
    if (isDragging) {
        visible.value = false; // 控件在移动过程中不可视
        return;
    }

    const workspace = props.context.workspace;
    const { clientX, clientY } = e;
    const root = workspace.root;

    matrix.reset(submatrixArray.value);

    const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    if (editingCell.value && isInCell(xy, editingCell.value)) {
        // getCellState(editingCell.value.cell).onMouseDown(e);
        return;
    }

    const cell = table.locateCell(xy.x, xy.y);
    if (cell && (!hoveringCell.value || cell.cell.id !== hoveringCell.value.cell.id)) {
        // hover cell
        hoveringCell.value = cell;
    }
}

function mouseup(e: MouseEvent) {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

function windowBlur() {
    // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

function isEditingText() {
    return editingCell.value && editingCell.value.cell.cellType === TableCellType.Text && editingCell.value.cell.text;
}

function showHoverCell() {
    return hoveringCell.value && (hoveringCell.value.cell.cellType ?? TableCellType.None) === TableCellType.None;
}

</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-area="controller"
        id="text-selection" xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
        :viewBox=genViewBox(bounds) :width="bounds.right - bounds.left" :height="bounds.bottom - bounds.top"
        :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }"
        @mousedown="mousedown" @mouseup="mouseup" @mousemove="mousemove" overflow="visible" @blur="windowBlur"
        :class="{ 'un-visible': !visible }">

        <!-- 插入图片icon -->
        <HoverCell v-if="showHoverCell()" :shape="hoveringCell!.cell" :matrix="hoveringCellMatrix" :context="props.context"
            :frame="hoveringCell!.frame"></HoverCell>

        <!-- 文本选区 -->
        <SelectView v-if="isEditingText()" :context="props.context" :shape="(editingCell!.cell as TextShape)"
            :matrix="editingCellMatrix"></SelectView>

        <path v-if="editing" :d="boundrectPath" fill="none" stroke='#865dff' stroke-width="1.5px"></path>
        <BarsContainer v-if="!editing" :context="props.context" :matrix="submatrixArray" :shape="table">
        </BarsContainer>
        <PointsContainer v-if="!editing" :context="props.context" :matrix="submatrixArray" :shape="table" :axle="axle">
        </PointsContainer>

    </svg>
    <TextInput v-if="isEditingText()" :context="props.context" :shape="(editingCell!.cell as TextShape)"
        :matrix="editingCellMatrix"></TextInput>
</template>
<style lang='scss' scoped>
.un-visible {
    opacity: 0;
}
</style>