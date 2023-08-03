<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, Shape, TableCell, TableCellType, Text } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, ref, reactive, computed } from 'vue';
import CellView from './Table/CtrlCell.vue';
import { genRectPath, throttle } from '../common';
import { Point } from "../SelectionView.vue";
import { ClientXY } from '@/context/selection';
import { getAxle } from '@/utils/common';
import BarsContainer from "./Bars/BarsContainer.SVG.vue";
import PointsContainer from "./Points/PointsContainer.SVG.vue";
import { useController } from './controller';
import TextInput from './Text/TextInput.vue';

type TextShape = Shape & { text: Text };


const props = defineProps<{
    context: Context,
    controllerFrame: Point[],
    rotate: number,
    matrix: number[],
    shape: Shape
}>();

let editCell: TableCell | undefined;
const editCellId = ref(""); // 用于更新

function onEditCell(cell: TableCell) {
    editCellId.value = cell.id;
    editCell = cell;
    editing.value = true;
    console.log("editCell", editCell)
}

// let cells: { cell: TableCell, lt: { x: number, y: number }, rb: { x: number, y: number } }[] = [];
const matrix = new Matrix();
const update = throttle(_update, 5);
function _update() {
    const m2p = props.shape.matrix2Root();
    matrix.reset(m2p);
    matrix.multiAtLeft(props.matrix);
    if (!submatrix.equals(matrix)) submatrix.reset(matrix)
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
}

watch(() => props.matrix, () => {
    update();
})

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

const editing = ref<boolean>(false);
const visible = ref<boolean>(true);
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
// const { t } = useI18n();
// const matrix = new Matrix();
const submatrix = reactive(new Matrix());
// let viewBox = '';
const axle = computed<ClientXY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});
// #region 绘制控件
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + (bounds.right - bounds.left) + " " + (bounds.bottom - bounds.top);
}

function mousedown(e: MouseEvent) {
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}

const { isDrag } = useController(props.context);
function mousemove(e: MouseEvent) {
    const isDragging = isDrag();
    if (isDragging) {
        visible.value = false; // 控件在移动过程中不可视
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

const submatrixArray = computed(() => submatrix.toArray())


</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-area="controller"
        id="text-selection" xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
        :viewBox=genViewBox(bounds) :width="bounds.right - bounds.left" :height="bounds.bottom - bounds.top"
        :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }"
        :onmousedown="mousemove" :on-mouseup="mouseup" :on-mousemove="mousemove" overflow="visible"
        :class="{ 'un-visible': !visible }">

        <component v-for="c in props.shape.childs" :key="c.id" :is="CellView" :shape="c" :matrix="submatrixArray"
            @editCell="onEditCell" :context="context" />

        <path v-if="editing" :d="boundrectPath" fill="none" stroke='#865dff' stroke-width="1.5px"></path>
        <BarsContainer v-if="!editing" :context="props.context" :matrix="submatrixArray" :shape="props.shape">
        </BarsContainer>
        <PointsContainer v-if="!editing" :context="props.context" :matrix="submatrixArray" :shape="props.shape"
            :axle="axle">
        </PointsContainer>

    </svg>
    <TextInput v-if="editCellId.length > 0 && editCell && editCell.cellType === TableCellType.Text && editCell.text"
        :context="props.context" :shape="(editCell as TextShape)" :matrix="submatrixArray"></TextInput>
</template>
<style lang='scss' scoped>
.un-visible {
    opacity: 0;
}
</style>