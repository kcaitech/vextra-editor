<script setup lang='ts'>
import { Context } from '@/context';
import { TableCell, TableShape, TableCellType, Matrix, ShapeFrame, TableCellView, TableView } from '@kcdesign/data';
import { reactive, ref, watchEffect } from 'vue';
import { v4 as uuid } from "uuid"
import { useImagePicker } from './loadimage';

const props = defineProps<{
    shape: TableCellView,
    matrix: number[],
    context: Context,
    frame: ShapeFrame
}>();

const cellType = ref(TableCellType.None);
const matrix = new Matrix();
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox

function update() {
    matrix.reset(props.matrix);
    cellType.value = props.shape.cellType ?? TableCellType.None;

    const frame = props.frame;
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

watchEffect(update)

function onLoadImage(name: string, data: { buff: Uint8Array, base64: string }) {
    // const data = loadImage(name, buffer);
    const id = uuid();
    props.context.data.mediasMgr.add(id, data);
    const table = props.shape.parent as TableView;
    const editor = props.context.editor4Table(table);
    const idx = table.indexOfCell(props.shape);
    if (!idx) return;
    editor.setCellContentImage(idx.rowIdx, idx.colIdx, id);
}

const pickImage = useImagePicker();

function onImageClick(e: MouseEvent) {
    pickImage(onLoadImage);
    e.preventDefault();
    e.stopPropagation();
}

const imageIconSize = 20; // px
function showImageIcon() {
    const imageIconVisibleSize = imageIconSize << 1;
    return props.frame.width > imageIconVisibleSize &&
        props.frame.height > imageIconVisibleSize &&
        cellType.value === TableCellType.None;
}
import SvgIcon from '@/components/common/SvgIcon.vue';
import pattern_image_icon from '@/assets/icons/svg/pattern-image.svg';
</script>
<template>
    <g>
        <rect class="un-visible" :x="bounds.left" :y="bounds.top" :width="bounds.right - bounds.left" fill="none"
            stroke="green" :height="bounds.bottom - bounds.top">
        </rect>

        <g v-if="showImageIcon()"
            :transform="`translate(${bounds.left + (bounds.right - bounds.left - imageIconSize) / 2}, ${bounds.top + (bounds.bottom - bounds.top - imageIconSize) / 2})`">
            <rect :x="0" :y="0" :width="`${imageIconSize}px`" fill="none" stroke="green" :height="`${imageIconSize}px`" @mousedown="onImageClick"></rect>
            <SvgIcon class="cell-image" :icon="pattern_image_icon" :width="`${imageIconSize}px`" @mousedown="onImageClick"
                :height="`${imageIconSize}px`"/>
        </g>
    </g>
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