<script setup lang='ts'>
import { Context } from '@/context';
import { TableCell, TableShape, TableCellType } from '@kcdesign/data';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { throttle } from '../../common';
import { FilePicker } from '@/components/common/filepicker';
import { v4 as uuid } from "uuid"

const props = defineProps<{
    shape: TableCell,
    matrix: number[],
    context: Context,
    lt: { x: number, y: number },
    rb: { x: number, y: number }
}>();
const reflush = ref(0);
const editor = props.context.editor4Table(props.shape.parent as TableShape)
let filePicker: FilePicker | undefined;
const accept = 'image/png, image/jpeg, image/gif, image/svg+xml, image/icns';
const update = throttle(_update, 5);
function _update() {
    reflush.value++;
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

function onCellClick(e: MouseEvent) {
    if (props.shape.cellType === undefined || props.shape.cellType === TableCellType.None) {
        editor.setCellContentText(props.shape);
    }
    props.context.selection.selectShape(props.shape);
    e.preventDefault();
    e.stopPropagation();
}

function onCellBlur(e: FocusEvent) {
    // 如果文本为空则删除

}
function onLoadImage(name: string, buffer: ArrayBuffer) {
    const uInt8Array = new Uint8Array(buffer);
    let i = uInt8Array.length;
    const binaryString = new Array(i);
    while (i--) {
        binaryString[i] = String.fromCharCode(uInt8Array[i]);
    }
    const data = binaryString.join('');

    const base64 = window.btoa(data);

    let url = '';
    const ext = name.substring(name.lastIndexOf('.') + 1);
    if (ext == "png") {
        url = "data:image/png;base64," + base64;
    }
    else if (ext == "gif") {
        url = "data:image/gif;base64," + base64;
    }
    else {
        console.log("imageExt", ext);
    }

    const id = uuid();
    props.context.data.mediasMgr.add(id, { buff: uInt8Array, base64: url });
    editor.setCellContentImage(props.shape, id);
}

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

function showImageIcon() {
    return width.value > imageIconVisibleSize &&
        height.value > imageIconVisibleSize &&
        ((props.shape.cellType ?? TableCellType.None) === TableCellType.None)
}

</script>
<template>
    <div class="table-cell" :style="{
        transform: `translate(${lt.x}px,${lt.y}px)`,
        left: '0px', top: '0px', position: 'absolute',
        width: `${width}px`, height: `${height}px`
    }" @click="onCellClick" @blur="onCellBlur" :reflush="reflush">
        <svg-icon class="cell-image" v-if="showImageIcon()" icon-class="pattern-image" @click="onImageClick"></svg-icon>
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