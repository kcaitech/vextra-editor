<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import TableContextAlgin from './TableContextAlgin.vue';
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { Color, Fill, FillType, Shape, ShapeType, TableCell, TableShape, Text } from '@kcdesign/data';
import { Context } from '@/context';
import { Delete } from '@element-plus/icons-vue'
import { getFormatFromBase64, useImagePicker } from '../../Selection/Controller/Table/loadimage';
import { v4 as uuid } from "uuid"
import { CellMenu } from '@/context/menu';
import { Selection } from '@/context/selection';
import { get_fills } from '@/utils/shape_style';
interface Props {
    context: Context
    position: { x: number, y: number }
    cellMenu: CellMenu
    cells: TableCell[]
}
const horIcon = ref('text-left');
const verIcon = ref('align-top');
const mixed_h = ref(false);
const mixed_v = ref(false);
const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'close'): void;
}>()
const isAlignMenu = ref('')
const color = ref<Color>(new Color(1, 216, 216, 216));
const singleChoice = ref<boolean>(false);
const showAlginMenu = (meun: string) => {
    if (isAlignMenu.value) return isAlignMenu.value = '';
    isAlignMenu.value = meun
}
const textAlginHor = (svg: string) => {
    horIcon.value = svg;
    isAlignMenu.value = '';
}

const textAlginVer = (svg: string) => {
    verIcon.value = svg;
    isAlignMenu.value = '';
}

const getColorFromPicker = (c: Color) => {
    const shape = props.context.selection.selectedShapes[0]
    const table = props.context.selection.getTableSelection(shape as TableShape, props.context);
    if (table.tableColEnd !== -1 && table.tableRowEnd !== -1) {
        const editor = props.context.editor4Table(shape as TableShape)
        const fill = new Fill(uuid(), true, FillType.SolidColor, c);
        editor.addFill4Multi(fill, { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd });
    }
    color.value = c;
}

const mergeCells = () => {
    const shape = props.context.selection.selectedShapes[0]
    const table = props.context.selection.getTableSelection(shape as TableShape, props.context);
    if (table.tableColEnd !== -1 && table.tableRowEnd !== -1) {
        const editor = props.context.editor4Table(shape as TableShape)
        editor.mergeCells(table.tableRowStart, table.tableRowEnd, table.tableColStart, table.tableColEnd)
    }
    emit('close');
}

const pickImage = useImagePicker();
function onLoadImage(name: string, data: { buff: Uint8Array, base64: string }) {
    const format = getFormatFromBase64(data.base64);
    const ref = `${uuid()}.${format}`;
    const shape = props.context.selection.selectedShapes[0] as TableShape
    props.context.data.mediasMgr.add(ref, data);
    const editor = props.context.editor4Table(shape)
    const table = props.context.selection.getTableSelection(shape as TableShape, props.context);
    editor.setCellContentImage(table.tableRowStart, table.tableColStart, ref);
    props.context.communication.docResourceUpload.upload(ref, data.buff.buffer.slice(0));
    emit('close');
}
const onPickImge = (e: MouseEvent) => {
    e.stopPropagation();
    pickImage((name: string, data: { buff: Uint8Array, base64: string }) => {
        onLoadImage(name, data);
    });
}

const insertColumn = (dir: string) => {
    const shape: TableShape = props.context.selection.selectedShapes[0] as TableShape;
    const table = props.context.selection.getTableSelection(shape as TableShape, props.context);
    if (table.tableColEnd !== -1 && table.tableRowEnd !== -1) {
        const layout = (shape as TableShape).getLayout();
        const editor = props.context.editor4Table(shape as TableShape);
        const grid = layout.grid.get(table.tableRowStart, table.tableColStart);
        if (props.cellMenu === CellMenu.SelectRow && dir === 'lt') {
            if (table.tableRowEnd === table.tableRowStart) {
                editor.insertRow(table.tableRowStart, grid.frame.height);
            } else {
                editor.insertMultiRow(table.tableRowStart, grid.frame.height, (table.tableRowEnd - table.tableRowStart) + 1);
            }
        } else if (props.cellMenu === CellMenu.SelectRow && dir === 'rb') {
            const grid = layout.grid.get(table.tableRowEnd, table.tableColStart);
            if (table.tableRowEnd === table.tableRowStart) {
                editor.insertRow(table.tableRowEnd + 1, grid.frame.height);
            } else {
                editor.insertMultiRow(table.tableRowEnd + 1, grid.frame.height, (table.tableRowEnd - table.tableRowStart) + 1);
            }
        }
        else if (props.cellMenu === CellMenu.selectCol && dir === 'lt') {
            if (table.tableColStart === table.tableColEnd) {
                editor.insertCol(table.tableColStart, grid.frame.width);
            } else {
                editor.insertMultiCol(table.tableColStart, grid.frame.width, (table.tableColEnd - table.tableColStart) + 1);
            }
        }
        else if (props.cellMenu === CellMenu.selectCol && dir === 'rb') {
            const grid = layout.grid.get(table.tableRowStart, table.tableColEnd);
            if (table.tableColStart === table.tableColEnd) {
                editor.insertCol(table.tableColEnd + 1, grid.frame.width);
            } else {
                editor.insertMultiCol(table.tableColEnd + 1, grid.frame.width, (table.tableColEnd - table.tableColStart) + 1);
            }
        }
    }
    emit('close');
}

const deleteColumn = () => {
    const shape = props.context.selection.selectedShapes[0];
    const table = props.context.selection.getTableSelection(shape as TableShape, props.context);
    const editor = props.context.editor4Table(shape as TableShape);
    if (props.cellMenu === CellMenu.SelectRow) {
        editor.removeRow(table.tableRowStart, table.tableRowEnd);
    } else {
        editor.removeCol(table.tableColStart, table.tableColEnd);
    }
    emit('close');
}

const selection_watcher = (t: number) => {
    if (t === Selection.CHANGE_TABLE_CELL) {
        handleCellMenu();
    }
}

const handleCellMenu = () => {
    const shape = props.context.selection.selectedShapes[0];
    if (shape && shape.type === ShapeType.Table) {
        const table = props.context.selection.getTableSelection(shape as TableShape, props.context);
        if (table.tableRowStart === table.tableRowEnd && table.tableColStart === table.tableColEnd) {
            singleChoice.value = true;
        } else {
            singleChoice.value = false;
        }
        getCellsFormat();
    }
}

const getCellsFormat = () => {
    const shape = props.context.selection.selectedShapes[0];
    const table = props.context.selection.getTableSelection(shape as TableShape, props.context);
    if (table.tableRowStart < 0 || table.tableColStart < 0) return;
    const cells = table.getSelectedCells(true).map(item => item.cell).filter(item => item);
    if (cells.length === 1) {
        const style = cells[0]!.style;
        if (style.fills[0]) {
            color.value = style.fills[0].color;
        } else {
            color.value = new Color(1, 216, 216, 216);
        }
    } else if (cells.length > 1) {
        const _fs = get_fills(cells as Shape[]);
        if (_fs === 'mixed' || !_fs.length) {
            color.value = new Color(1, 216, 216, 216);
        } else {
            color.value = _fs[0].fill.color;
        }
    }
    if (cells.length) {
        const formats: any[] = []; let format: any = {};
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (cell && cell.text) {
                const editor = props.context.editor4TextShape(cell as any);
                const forma = (cell.text as Text).getTextFormat(0, Infinity, editor.getCachedSpanAttr());
                formats.push(forma);
            }
        }
        if (formats.length < 0) return;
        const referenceKeys = Object.keys(formats[0]);
        for (const key of referenceKeys) {
            const referenceValue = formats[0][key]; let foundEqual = true;
            for (let i = 1; i < formats.length; i++) {
                if (formats[i][key] !== referenceValue) {
                    foundEqual = false;
                    break;
                }
            }
            if (foundEqual) { format[key] = referenceValue; } else {
                format[key] = `unlikeness`;
            }
        }
        mixed_h.value = false; mixed_v.value = false;
        if (format.alignment === 'left') {
            horIcon.value = 'text-left';
        } else if (format.alignment === 'right') {
            horIcon.value = 'text-right';
        } else if (format.alignment === 'centered') {
            horIcon.value = 'text-center';
        } else if (format.alignment === 'justified') {
            horIcon.value = 'text-justify';
        } else { horIcon.value = 'text-left'; mixed_h.value = true }

        if (format.verAlign === 'top') {
            verIcon.value = 'align-top';
        } else if (format.verAlign === 'bottom') {
            verIcon.value = 'align-bottom';
        } else if (format.verAlign === 'middle') {
            verIcon.value = 'align-middle';
        } else { verIcon.value = 'align-top'; mixed_v.value = true }
    }
}

onMounted(() => {
    handleCellMenu();
    props.context.selection.watch(selection_watcher);
})

onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
})
</script>

<template>
    <div class="custom-popover"
        :style="{ top: `${props.position.y}px`, left: `${props.position.x}px`, transform: `translate(-50%, -124%)` }"
        @mousedown.stop>
        <div v-if="props.cellMenu === CellMenu.MultiSelect" class="popover-content">
            <div class="hor" :class="{ selected_bgc: !mixed_h }">
                <svg-icon :icon-class="horIcon"></svg-icon>
                <div class="menu" @click="showAlginMenu('hor')">
                    <svg-icon icon-class="down"></svg-icon>
                </div>
                <TableContextAlgin v-if="isAlignMenu === 'hor'" :context="context" :cells="[]" :menu="isAlignMenu"
                    @textAlginHor="textAlginHor">
                </TableContextAlgin>
            </div>
            <div class="ver" :class="{ selected_bgc: !mixed_v }">
                <svg-icon :icon-class="verIcon"></svg-icon>
                <div class="menu" @click="showAlginMenu('ver')">
                    <svg-icon icon-class="down"></svg-icon>
                </div>
                <TableContextAlgin v-if="isAlignMenu === 'ver'" :context="context" :cells="[]" :menu="isAlignMenu"
                    @textAlginVer="textAlginVer">
                </TableContextAlgin>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; padding: 2px;">
                <ColorPicker :context="props.context" :color="(color as Color)" :late="-270" :top="24"
                    @change="c => getColorFromPicker(c)"></ColorPicker>
            </div>
            <div style="padding: 2px;" @click.stop="mergeCells" v-if="!singleChoice">
                <svg width="16" height="16" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M7.35355 11.3536C7.54882 11.1583 7.54882 10.8417 7.35355 10.6464L4.17157 7.46447C3.97631 7.2692 3.65973 7.2692 3.46447 7.46447C3.2692 7.65973 3.2692 7.97631 3.46447 8.17157L6.29289 11L3.46447 13.8284C3.2692 14.0237 3.2692 14.3403 3.46447 14.5355C3.65973 14.7308 3.97631 14.7308 4.17157 14.5355L7.35355 11.3536ZM0 11.5H7V10.5H0V11.5Z"
                        fill="#6243ED" />
                    <path d="M8.5 1L0.5 1L0.5 21H8.5" stroke="black" />
                    <path
                        d="M12.1464 11.3536C11.9512 11.1583 11.9512 10.8417 12.1464 10.6464L15.3284 7.46447C15.5237 7.2692 15.8403 7.2692 16.0355 7.46447C16.2308 7.65973 16.2308 7.97631 16.0355 8.17157L13.2071 11L16.0355 13.8284C16.2308 14.0237 16.2308 14.3403 16.0355 14.5355C15.8403 14.7308 15.5237 14.7308 15.3284 14.5355L12.1464 11.3536ZM19.5 11.5H12.5V10.5H19.5V11.5Z"
                        fill="#6243ED" />
                    <path d="M12 1L20 1V21H12" stroke="black" />
                </svg>
            </div>
            <div style="padding: 2px;" v-if="singleChoice" @click="onPickImge">
                <svg-icon icon-class="picture"></svg-icon>
            </div>
        </div>
        <div v-if="props.cellMenu === CellMenu.SelectRow || props.cellMenu === CellMenu.selectCol" class="popover-content">
            <div style="display: flex; align-items: center; justify-content: center;">
                <ColorPicker :context="props.context" :color="(color as Color)" :late="-270" :top="24"
                    @change="c => getColorFromPicker(c)"></ColorPicker>
            </div>
            <div :style="{ transform: props.cellMenu === CellMenu.selectCol ? `rotate(180deg)` : `rotate(270deg)` }"
                @click="insertColumn('lt')">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="9" height="20" fill="#D8D8D8" />
                    <line x1="11" y1="9.5" x2="20" y2="9.5" stroke="black" />
                    <line x1="15.5" y1="5" x2="15.5" y2="14" stroke="black" />
                </svg>
            </div>
            <div :style="{ transform: props.cellMenu === CellMenu.selectCol ? `rotate(0deg)` : `rotate(90deg)` }"
                @click="insertColumn('rb')">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="9" height="20" fill="#D8D8D8" />
                    <line x1="11" y1="9.5" x2="20" y2="9.5" stroke="black" />
                    <line x1="15.5" y1="5" x2="15.5" y2="14" stroke="black" />
                </svg>
            </div>
            <div @click="deleteColumn">
                <Delete style="width: 1em; height: 1em" />
            </div>
        </div>
        <div class="tip"></div>
    </div>
</template>

<style scoped lang="scss">
.custom-popover {
    position: absolute;
    height: 32px;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;

    .tip {
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 8px;
        height: 8px;
        transform: translateX(-50%) translateY(50%) rotate(45deg);
        background-color: white;
        z-index: -1;
    }
}

.popover-content {
    width: 100%;
    height: 100%;
    padding: 0 5px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;

    >div {
        display: flex;
        border-radius: 4px;
        padding: 4px;
        margin: 2px;

        >svg {
            width: 16px;
            height: 16px;
        }

        >div {
            height: 16px;

            >svg {
                width: 8px;
                height: 8px;
            }
        }
    }

    .hor {
        position: relative;
    }

    .ver {
        position: relative;
    }

    .menu {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 10px;
        transition: 0.2s;
    }

    .menu:hover {
        transform: translateY(4px);
    }
}

.selected_bgc {
    background-color: var(--active-color) !important;
}
</style>