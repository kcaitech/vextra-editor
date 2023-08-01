<script setup lang='ts'>
import { Context } from '@/context';
import { TableCell, TableShape, TableCellType } from '@kcdesign/data';
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { throttle } from '../../common';
import { FilePicker } from '@/components/common/filepicker';
const props = defineProps<{
    shape: TableCell,
    matrix: number[],
    context: Context,
    lt: { x: number, y: number },
    rb: { x: number, y: number }
}>();

const editor = props.context.editor4Table(props.shape.parent as TableShape)
let filePicker: FilePicker | undefined;
const accept = 'image/png, image/jpeg, image/gif, image/svg+xml, image/icns';
const update = throttle(_update, 5);
function _update() {

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

const width = computed(() => props.rb.x - props.lt.x);
const height = computed(() => props.rb.y - props.lt.y)
const imageIconVisibleSize = 20;

function onCellClick() {
    if (props.shape.cellType === undefined || props.shape.cellType === TableCellType.None) {
        editor.setCellContentText(props.shape);
    }
    props.context.selection.selectShape(props.shape);
}

function onCellBlur() {
    // 如果文本为空则删除

}

function onImageClick() {
    if (!filePicker) filePicker = new FilePicker(accept, (file: File) => {

    });
    filePicker.invoke();
}

</script>
<template>
    <div class="table-cell" :style="{
        transform: `translate(${lt.x}px,${lt.y}px)`,
        left: '0px', top: '0px', position: 'absolute',
        width: `${width}px`, height: `${height}px`
    }" @click="onCellClick" @blur="onCellBlur">
        <svg-icon class="cell-image"
            v-if="width > imageIconVisibleSize && height > imageIconVisibleSize && props.shape.child === undefined"
            icon-class="pattern-image" @click="onImageClick"></svg-icon>
    </div>
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
</style>