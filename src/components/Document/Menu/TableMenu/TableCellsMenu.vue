<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import TableContextAlgin from './TableContextAlgin.vue';
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { BasicArray, Color, Fill, FillType, Shape, ShapeType, TableCell, TableCellView, TableShape, TableView, Text } from '@kcdesign/data';
import { Context } from '@/context';
import { Delete } from '@element-plus/icons-vue'
import { getFormatFromBase64, useImagePicker } from '../../Selection/Controller/Table/loadimage';
import { v4 as uuid } from "uuid"
import { CellMenu } from '@/context/menu';
import { get_fills } from '@/utils/shape_style';
import { TableSelection } from '@/context/tableselection';
import { hidden_selection } from "@/utils/content";
interface Props {
    context: Context
    position: { x: number, y: number }
    cellMenu: CellMenu
    cells: TableCell[]
}

import text_left_icon from '@/assets/icons/svg/text-left.svg';
import text_center_icon from '@/assets/icons/svg/text-center.svg';
import text_right_icon from '@/assets/icons/svg/text-right.svg';
import text_justify_icon from '@/assets/icons/svg/text-justify.svg';
import align_top_icon from '@/assets/icons/svg/align-top.svg';
import align_bottom_icon from '@/assets/icons/svg/align-bottom.svg';
import align_middle_icon from '@/assets/icons/svg/align-middle.svg';

const horIcon = ref('text-left');
const verIcon = ref('align-top');

function getHorIcon() {
    switch (horIcon.value) {
        case 'text-left':
            return text_left_icon;
        case 'text-center':
            return text_center_icon;
        case 'text-right':
            return text_right_icon;
        case 'text-justify':
            return text_justify_icon;
        default:
            return text_left_icon;
    }
}

function getVerIcon() {
    switch (verIcon.value) {
        case 'align-top':
            return align_top_icon;
        case 'align-middle':
            return align_middle_icon;
        case 'align-bottom':
            return align_bottom_icon;
        default:
            return align_top_icon;
    }
}


const mixed_h = ref(false);
const mixed_v = ref(false);
const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'close'): void;
}>()
const isAlignMenu = ref('')
const color = ref<Color>(new Color(1, 255, 255, 255));
const singleChoice = ref<boolean>(false);
const showAlginMenu = (meun: string) => {
    isAlignMenu.value = meun
}

const hiddenAlginMenu = () => {
        isAlignMenu.value = ''
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
    const table = props.context.tableSelection;
    if (table && table.tableColEnd !== -1 && table.tableRowEnd !== -1) {
        const editor = props.context.editor4Table(shape as TableView)
        const fill = new Fill(new BasicArray(), uuid(), true, FillType.SolidColor, c);
        editor.addFill4Cell(fill, { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd }, true);
        hidden_selection(props.context);
    }
    nextTick(() => {
        getCellsFormat();
    })
}

const mergeCells = () => {
    const shape = props.context.selection.selectedShapes[0]
    const table = props.context.tableSelection;
    if (table && table.tableColEnd !== -1 && table.tableRowEnd !== -1) {
        const editor = props.context.editor4Table(shape as TableView)
        editor.mergeCells(table.tableRowStart, table.tableRowEnd, table.tableColStart, table.tableColEnd)
    }
    emit('close');
}

const pickImage = useImagePicker();
function onLoadImage(name: string, data: { buff: Uint8Array, base64: string }) {
    const format = getFormatFromBase64(data.base64);
    const ref = `${uuid()}.${format}`;
    const shape = props.context.selection.selectedShapes[0] as TableView
    props.context.data.mediasMgr.add(ref, data);
    const editor = props.context.editor4Table(shape)
    const table = props.context.tableSelection;
    if (table) {
        editor.setCellContentImage(table.tableRowStart, table.tableColStart, ref);
        props.context.net?.upload(ref, data.buff.buffer.slice(0));
        emit('close');
    }
}
const onPickImge = (e: MouseEvent) => {
    e.stopPropagation();
    pickImage((name: string, data: { buff: Uint8Array, base64: string }) => {
        onLoadImage(name, data);
    });
}

const insertColumn = (dir: string) => {
    const shape: TableView = props.context.selection.selectedShapes[0] as TableView;
    const table = props.context.tableSelection;
    if (table && table.tableColEnd !== -1 && table.tableRowEnd !== -1) {
        const layout = (shape as TableView).getLayout();
        const editor = props.context.editor4Table(shape as TableView);
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
    const table = props.context.tableSelection
    const editor = props.context.editor4Table(shape as TableView);
    if (!table) return;
    let result: any = 0;
    if (props.cellMenu === CellMenu.SelectRow) {
        result = editor.removeRow(table.tableRowStart, table.tableRowEnd);
    } else {
        result = editor.removeCol(table.tableColStart, table.tableColEnd);
    }
    if (result === 1) {
        props.context.selection.resetSelectShapes();
    }
    emit('close');
}

const selection_watcher = (t: number) => {
    if (t === TableSelection.CHANGE_TABLE_CELL) {
        handleCellMenu();
    }
}

const handleCellMenu = () => {
    const shape = props.context.selection.selectedShapes[0];
    if (shape && shape.type === ShapeType.Table) {
        const table = props.context.tableSelection;
        if (!table) return;
        if (table.tableRowStart === table.tableRowEnd && table.tableColStart === table.tableColEnd) {
            singleChoice.value = true;
        } else {
            singleChoice.value = false;
        }
        getCellsFormat();
    }
}

const getCellsFormat = () => {
    const table = props.context.tableSelection;
    if (!table || table.tableRowStart < 0 || table.tableColStart < 0) return;
    const cells = table.getSelectedCells(true).map(item => item.cell).filter(item => item) as TableCellView[];
    if (cells.length === 1) {
        const style = cells[0]!.style;
        if (style.fills[0]) {
            color.value = style.fills[0].color;
        } else {
            color.value = new Color(1, 255, 255, 255);
        }
    } else if (cells.length > 1) {
        const _fs = get_fills(cells);
        if (_fs === 'mixed' || !_fs.length) {
            color.value = new Color(1, 255, 255, 255);
        } else {
            color.value = _fs[0].fill.color;
        }
    }
    if (cells.length) {
        const formats: any[] = []; let format: any = {};
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (cell && cell.text) {
                const editor = props.context.editor4TextShape(cell);
                const forma = (cell.text as Text).getTextFormat(0, Infinity, editor.getCachedSpanAttr());
                formats.push(forma);
            }
        }
        if (formats.length === 0) return;
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

const table_watcher = (t: number) => {
    if (t === TableSelection.CHANGE_TABLE_CELL) {
        handleCellMenu();
    }
}

onMounted(() => {
    handleCellMenu();
    props.context.selection.watch(selection_watcher);
    props.context.tableSelection.watch(table_watcher);
})

onUnmounted(() => {
    props.context.menu.setCellMenuType(undefined);
    props.context.selection.unwatch(selection_watcher);
    props.context.tableSelection.unwatch(table_watcher);
    props.context.tableSelection.setTableMenuVisible(false);
})

import SvgIcon from '@/components/common/SvgIcon.vue';
import down_icon from '@/assets/icons/svg/down.svg';
import layer_image_icon from '@/assets/icons/svg/layer-image.svg';
</script>

<template>
    <div class="custom-popover"
        :style="{ top: `${props.position.y}px`, left: `${props.position.x}px`, transform: `translate(-50%, -124%)` }"
        @mousedown.stop>
        <div v-if="props.cellMenu === CellMenu.MultiSelect" class="popover-content">
            <div class="hor" @mouseenter="showAlginMenu('hor')" @mouseleave="hiddenAlginMenu"
                :class="{ selected_bgc: isAlignMenu === 'hor' }">
                <SvgIcon :icon="getHorIcon()"/>
                <div class="menu">
                    <SvgIcon :icon="down_icon"/>
                </div>
                <div class="bridge" style="width: 130px;" v-if="isAlignMenu === 'hor'"></div>
                <TableContextAlgin v-if="isAlignMenu === 'hor'" :context="context" :cells="[]" :menu="isAlignMenu"
                    :selectIcon="horIcon" @textAlginHor="textAlginHor">
                </TableContextAlgin>
            </div>
            <div class="divider"></div>
            <div class="ver" @mouseenter="showAlginMenu('ver')" @mouseleave="hiddenAlginMenu"
                :class="{ selected_bgc: isAlignMenu === 'ver' }">
                <SvgIcon :icon="getVerIcon()"/>
                <div class="menu">
                    <SvgIcon :icon="down_icon"/>
                </div>
                <div class="bridge" style="width: 100px;" v-if="isAlignMenu === 'ver'"></div>
                <TableContextAlgin v-if="isAlignMenu === 'ver'" :context="context" :cells="[]" :menu="isAlignMenu"
                    :selectIcon="verIcon" @textAlginVer="textAlginVer">
                </TableContextAlgin>
            </div>
            <div class="divider"></div>
            <div style="display: flex; align-items: center; justify-content: center;">
                <ColorPicker :context="props.context" :color="(color as Color)" :cell="true" :top="30"
                    @change="c => getColorFromPicker(c)"></ColorPicker>
            </div>
            <div @click.stop="mergeCells" v-if="!singleChoice && !(props.context.selection.tableshape?.isVirtualShape)">
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
                <SvgIcon :icon="layer_image_icon" style="stroke: black"/>
            </div>
        </div>
        <div v-if="props.cellMenu === CellMenu.SelectRow || props.cellMenu === CellMenu.selectCol"
            class="popover-content">
            <div style="display: flex; align-items: center; justify-content: center;">
                <ColorPicker :context="props.context" :color="(color as Color)" :cell="true" :top="30"
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
    </div>
</template>

<style scoped lang="scss">
.custom-popover {
    position: absolute;
    height: 36px;
    border-radius: 6px;
    background-color: #fff;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    z-index: 10000;

}

.popover-content {
    border: 1px solid #F0F0F0;
    border-radius: 6px;
    width: 100%;
    height: 100%;
    padding: 6px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;

    >div {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 24px;
        height: 24px;
        border-radius: 3px;

        &:hover {
            background-color: #F0F0F0;
        }

        >svg {
            width: 16px;
            height: 16px;
        }

        >div {
            height: 16px;

            >svg {
                width: 10px;
                height: 10px;
            }
        }
    }

    .hor {
        width: 36px;
        position: relative;
    }

    .ver {
        width: 36px;
        position: relative;
    }

    .divider {
        width: 16px;
        height: 100%;
        box-sizing: border-box;
        border-top: 4px solid #fff;
        border-bottom: 4px solid #fff;
        border-left: 7.5px solid #fff;
        border-right: 7.5px solid #fff;
        background-color: #EBEBEB;
    }

    .menu {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 4px;
        width: 10px;
        transition: 0.2s;
        opacity: 0.4;
    }

    .menu:hover {
        transform: translateY(2px);
    }
}

.selected_bgc {
    background-color: #F0F0F0;
}

.bridge {
    position: absolute;
    top: 22px;
    left: -7px;
    background-color: transparent;
    height: 10px;
}
</style>