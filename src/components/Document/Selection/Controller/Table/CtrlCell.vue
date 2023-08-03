<script setup lang='ts'>
import { Context } from '@/context';
import { TableCell, TableShape, TableCellType, Shape, Text, Matrix } from '@kcdesign/data';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { throttle } from '../../common';
import { FilePicker } from '@/components/common/filepicker';
import { v4 as uuid } from "uuid"
import SelectView from "../Text/SelectView.vue";
import { noneState } from './cellnonestate';
import { textState } from './celltextstate';
import { imageState } from './cellimagestate';
import { loadImage } from './loadimage';
import { useI18n } from 'vue-i18n';

type TextShape = Shape & { text: Text };

const props = defineProps<{
    shape: TableCell,
    matrix: number[],
    context: Context
}>();

const emit = defineEmits<{
    (e: 'editCell', cell: TableCell): void
}>()

const editor = props.context.editor4Table(props.shape.parent as TableShape)
const submatrix = reactive(new Matrix());
const cellType = ref(TableCellType.None);

const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
const update = throttle(_update, 5);
function _update() {
    const matrix = props.shape.matrix2Parent();
    matrix.multiAtLeft(props.matrix);
    if (!submatrix.equals(matrix)) submatrix.reset(matrix)
    cellType.value = props.shape.cellType ?? TableCellType.None;

    const frame = props.shape.frame;
    const points = [
        { x: 0, y: 0 }, // left top
        { x: frame.width, y: 0 }, //right top
        { x: frame.width, y: frame.height }, // right bottom
        { x: 0, y: frame.height }, // left bottom
    ];

    const boundrect = points.map((point) => matrix.computeCoord(point.x, point.y));

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

function selectionWatcher(...args: any[]) {
    // if (args.indexOf(Selection.CHANGE_TEXT) >= 0) update();
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
    const selection = props.context.selection;
    props.shape.watch(update);
    selection.watch(selectionWatcher);
    update();
})

onUnmounted(() => {
    const selection = props.context.selection;
    props.shape.unwatch(update);
    selection.unwatch(selectionWatcher);
    if (filePicker) filePicker.unmount();
})

// const width = 0;//computed(() => props.rb.x - props.lt.x);
// const height = 0;//computed(() => props.rb.y - props.lt.y)

function onCellClick(e: MouseEvent) {
    if (props.shape.cellType === undefined || props.shape.cellType === TableCellType.None) {
        editor.setCellContentText(props.shape);
    }
    // props.context.selection.selectShape(props.shape);
    e.preventDefault();
    e.stopPropagation();
    emit("editCell", props.shape);
}

function onCellBlur(e: FocusEvent) {
    // 如果文本为空则删除

}
function onLoadImage(name: string, buffer: ArrayBuffer) {
    const data = loadImage(name, buffer);
    const id = uuid();
    props.context.data.mediasMgr.add(id, data);
    editor.setCellContentImage(props.shape, id);
}

let filePicker: FilePicker | undefined;
const accept = 'image/png, image/jpeg, image/gif, image/svg+xml, image/icns';
function onImageClick(e: MouseEvent) {
    if (!filePicker) filePicker = new FilePicker(accept, (file: File) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const buffer = e.target?.result;
            if (!buffer || !(buffer instanceof ArrayBuffer)) {
                console.log("read image fail")
                return;
            }
            const name = file.name;
            onLoadImage(name, buffer);
        }
        reader.readAsArrayBuffer(file);
    });
    filePicker.invoke();
    e.preventDefault();
    e.stopPropagation();
}

const imageIconSize = 20; // px
function showImageIcon() {
    const imageIconVisibleSize = imageIconSize << 1;
    return props.shape.frame.width > imageIconVisibleSize &&
        props.shape.frame.height > imageIconVisibleSize &&
        cellType.value === TableCellType.None;
}

function showTextInput() {
    return cellType.value === TableCellType.Text && props.shape.text;
}

const submatrixArray = computed(() => submatrix.toArray())

const { t } = useI18n();

let cellState = noneState(props, t);
function getCellState() {
    if (cellState.cellType === cellType.value) return cellState;
    cellState.dispose();
    if (cellType.value === TableCellType.Text) {
        cellState = textState(props, t);
    }
    else if (cellType.value === TableCellType.Image) {
        cellState = imageState(props, t);
    }
    else {
        cellState = noneState(props, t);
    }
    return cellState;
}

function onMouseDown(e: MouseEvent) {
    if (props.shape.cellType === undefined || props.shape.cellType === TableCellType.None) {
        editor.setCellContentText(props.shape);
    }
    emit("editCell", props.shape);
    getCellState().onMouseDown(e);
}

function onMouseEnter() {
    getCellState().onMouseEnter();
}
function onMouseLeave() {
    getCellState().onMouseLeave();
}

</script>
<template>
    <rect class="un-visible" :x="bounds.left" :y="bounds.top" :width="bounds.right - bounds.left"
        :height="bounds.bottom - bounds.top" @mousedown="onMouseDown" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    </rect>

    <g v-if="showImageIcon()"
        :transform="`translate(${bounds.left + (bounds.right - bounds.left - imageIconSize) / 2}, ${bounds.top + (bounds.bottom - bounds.top - imageIconSize) / 2})`">
        <rect class="un-visible" x=0 y=0 :width="`${imageIconSize}px`" :height="`${imageIconSize}px`" @click="onImageClick">
        </rect>
        <svg-icon class="cell-image" icon-class="pattern-image" :width="`${imageIconSize}px`"
            :height="`${imageIconSize}px`"></svg-icon>
    </g>

    <SelectView v-if="showTextInput()" :context="props.context" :shape="(props.shape as TextShape)"
        :matrix="submatrixArray"></SelectView>
</template>
<style lang='scss' scoped>
.table-cell {
    display: flex;
    justify-content: center;
    align-items: center;
}

.cell-image {
    width: 20px;
    height: 20px;

}

.un-visible {
    opacity: 0;
}
</style>