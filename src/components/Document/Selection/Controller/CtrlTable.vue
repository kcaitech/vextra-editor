<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, Shape, TableCell, TableCellType, TableShape, Text, TableGridItem } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, ref, reactive, computed, shallowRef } from 'vue';
import { genRectPath } from '../common';
import { Point } from "../SelectionView.vue";
import { ClientXY } from '@/context/selection';
import { getAxle } from '@/utils/common';
import BarsContainer from "./Bars/BarsContainerForTable.vue";
import PointsContainer from "./Points/PointsContainerForTable.vue";
import { useController } from './controller2';
import TextInput from './Text/TextInput.vue';
import SelectView from "./Text/SelectView.vue";
import { useImagePicker } from './Table/loadimage';
import { v4 as uuid } from "uuid"
import { useI18n } from 'vue-i18n';
import { textState } from './Table/celltextstate';
import TableHeader from './Table/TableHeader.vue';

type TextShape = Shape & { text: Text };
const props = defineProps<{
    context: Context,
    controllerFrame: Point[],
    rotate: number,
    matrix: Matrix, // root->屏幕 变换矩阵
    shape: TableShape
}>();
const { t } = useI18n();
const matrix = new Matrix();
const visible = ref<boolean>(true);
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
const submatrix = reactive(new Matrix());
const submatrixArray = computed(() => submatrix.toArray());
const imageIconSize = 20; // px
const hoverCellBounds = computed(() => {
    if (!hoveringCell.value) return { x: 0, y: 0, w: 0, h: 0 };
    const frame = hoveringCell.value.frame;
    matrix.reset(submatrix.toArray());
    matrix.preTrans(frame.x, frame.y);
    const xy = matrix.computeCoord2(0, 0);
    const xy1 = matrix.computeCoord2(frame.width, frame.height);
    const x = xy.x;
    const y = xy.y;
    const w = xy1.x - x;
    const h = xy1.y - y;
    return { x, y, w, h }
})
const axle = computed<ClientXY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});
const editingCell = shallowRef<TableGridItem>();
const hoveringCell = shallowRef<TableGridItem>();

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
        editingCell.value = props.shape.locateCell2(editingCell.value.cell);
    }
    if (hoveringCell.value) {
        hoveringCell.value = props.shape.locateCell2(hoveringCell.value.cell);
    }
}
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + (bounds.right - bounds.left) + " " + (bounds.bottom - bounds.top);
}
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
    const id = uuid();
    props.context.data.mediasMgr.add(id, data);
    const editor = props.context.editor4Table(props.shape)
    editor.setCellContentImage(cell, id);
}
const pickImage = useImagePicker();

function mousedown(e: MouseEvent) {
    // document.addEventListener('mousemove', mousemove);
    // document.addEventListener('mouseup', mouseup);

    // // find cell
    // const workspace = props.context.workspace;
    // const { clientX, clientY } = e;
    // const root = workspace.root;
    // matrix.reset(submatrixArray.value);

    // const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    // if (editingCell.value && isInCell(xy, editingCell.value)) {
    //     getCellState(editingCell.value.cell).onMouseDown(e);
    //     return;
    // }
    // if (hoveringCell.value && isInCell(xy, hoveringCell.value) && showImageIcon()) {
    //     // 是否点击了图标
    //     const x = clientX - root.x;
    //     const y = clientY - root.y;
    //     const bounds = hoverCellBounds.value;
    //     const iconX = bounds.x + (bounds.w - imageIconSize) / 2;
    //     const iconY = bounds.y + (bounds.h - imageIconSize) / 2;

    //     if (x > iconX && y > iconY &&
    //         (x - iconX) < imageIconSize && (y - iconY) < imageIconSize) {
    //         const cell = hoveringCell.value.cell;
    //         pickImage((name: string, data: { buff: Uint8Array, base64: string }) => {
    //             onLoadImage(name, data, cell);
    //         });
    //         e.stopPropagation();
    //         e.preventDefault();
    //         return;
    //     }
    // }

    // const cell = props.shape.locateCell(xy.x, xy.y);
    // if (!cell) return;
    // if (cell.cell.cellType === TableCellType.Image) { // todo 应该是查看大图？
    //     pickImage((name: string, data: { buff: Uint8Array, base64: string }) => {
    //         onLoadImage(name, data, cell.cell);
    //     });
    //     e.stopPropagation();
    //     e.preventDefault();
    //     return;
    // }
    // if ((cell.cell.cellType ?? TableCellType.None) === TableCellType.None) {
    //     const editor = props.context.editor4Table(props.shape)
    //     editor.setCellContentText(cell.cell)
    // }
    // // editing cell
    // const selection = props.context.selection.getTableSelection(props.shape);
    // selection.selectTableCell(cell.cell, cell.index.row, cell.index.col);
    // editingCell.value = cell;
    // getCellState(cell.cell).onMouseDown(e);
}
// const { isDrag } = useController(props.context);
function mousemove(e: MouseEvent) {
    // const isDragging = isDrag();
    // if (isDragging) {
    //     visible.value = false; // 控件在移动过程中不可视
    //     return;
    // }

    // if (e.buttons > 0) {
    //     return;
    // }

    // const workspace = props.context.workspace;
    // const { clientX, clientY } = e;
    // const root = workspace.root;

    // matrix.reset(submatrixArray.value);

    // const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    // if (editingCell.value && isInCell(xy, editingCell.value)) {
    //     // getCellState(editingCell.value.cell).onMouseDown(e);
    //     return;
    // }

    // const cell = props.shape.locateCell(xy.x, xy.y);
    // if (cell && (!hoveringCell.value || cell.cell.id !== hoveringCell.value.cell.id)) {
    //     // hover cell
    //     hoveringCell.value = cell;
    // }
}

function mouseup(e: MouseEvent) {
    // document.removeEventListener('mousemove', mousemove);
    // document.removeEventListener('mouseup', mouseup);
}

function windowBlur() {
    // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}
function isEditingText() {
    return editingCell.value && editingCell.value.cell.cellType === TableCellType.Text && editingCell.value.cell.text;
}
function showImageIcon() {
    const imageIconVisibleSize = imageIconSize << 1;
    const bounds = hoverCellBounds.value;
    return hoveringCell.value &&
        (hoveringCell.value.cell.cellType ?? TableCellType.None) === TableCellType.None &&
        bounds.w > imageIconVisibleSize &&
        bounds.h > imageIconVisibleSize;
}
const imageIconTrans = () => {
    const bounds = hoverCellBounds.value;
    const x = bounds.x + (bounds.w - imageIconSize) / 2;
    const y = bounds.y + (bounds.h - imageIconSize) / 2;
    return `translate(${x}, ${y})`
}
watch(() => props.matrix, update, { deep: true })
watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})
onMounted(() => {
    props.shape.watch(update);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
})
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-area="controller"
        id="text-selection" xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
        :viewBox=genViewBox(bounds) :width="bounds.right - bounds.left" :height="bounds.bottom - bounds.top"
        :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }"
        @mousedown="mousedown" @mouseup="mouseup" @mousemove="mousemove" overflow="visible"
        :class="{ 'un-visible': !visible }">
        <!-- 插入图片icon -->
        <g v-if="showImageIcon()" :transform="imageIconTrans()">
            <svg-icon icon-class="pattern-image" :width="imageIconSize" :height="imageIconSize"></svg-icon>
        </g>
        <!-- 文本选区 -->
        <SelectView v-if="isEditingText()" :context="props.context" :shape="(editingCell!.cell as TextShape)"
            :matrix="editingCellMatrix"></SelectView>
        <BarsContainer :context="props.context" :matrix="submatrixArray" :shape="props.shape"
            :c-frame="props.controllerFrame">
        </BarsContainer>
        <TableHeader :context="props.context" :matrix="submatrixArray" :shape="props.shape"
            :c-frame="props.controllerFrame"></TableHeader>
        <PointsContainer :context="props.context" :matrix="submatrixArray" :shape="props.shape"
            :c-frame="props.controllerFrame" :axle="axle">
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