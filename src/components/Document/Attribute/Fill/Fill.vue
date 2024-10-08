<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Context } from '@/context';
import {
    BasicArray,
    Color,
    Fill,
    FillType,
    GradientType,
    ImageScaleMode,
    ShapeType,
    ShapeView,
    Stop, SymbolView,
    TableView
} from "@kcdesign/data";
import { Reg_HEX } from "@/utils/RegExp";
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { message } from "@/utils/message";
import {
    get_aciton_gradient,
    get_aciton_gradient_stop,
    get_actions_add_fill,
    get_actions_fill_color,
    get_actions_fill_delete,
    get_actions_fill_enabled,
    get_actions_fill_opacity,
    get_actions_fill_unify,
    get_actions_filltype,
    get_actions_image_ref,
    get_actions_image_scale_mode,
    get_fills
} from '@/utils/shape_style';
import { v4 } from 'uuid';
import { flattenShapes } from '@/utils/cutout';
import { get_table_range, hidden_selection, is_editing } from '@/utils/content';
import { getShapesForStyle } from '@/utils/style';
import { ImgFrame } from '@/context/atrribute';

interface FillItem {
    id: number,
    fill: Fill
}

interface Props {
    context: Context;
    shapes: ShapeView[];
    selectionChange: number;
    trigger: any[];
    tableSelectionChange: number;
    cellsTrigger: any[];
}

const props = defineProps<Props>();
const editor = computed(() => props.context.editor4Shape(props.shapes[0]));
const len = computed<number>(() => props.shapes.length);
const { t } = useI18n();
const fills: FillItem[] = reactive([]);
const alphaFill = ref<HTMLInputElement[]>();
const colorFill = ref<HTMLInputElement[]>();
const mixed = ref<boolean>(false);
const mixed_cell = ref(false);
const shapes = ref<ShapeView[]>();

function toHex(r: number, g: number, b: number) {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return hex(r) + hex(g) + hex(b);
}

function updateData() {
    fills.length = 0;
    mixed.value = false;
    mixed_cell.value = false;
    const selected = props.context.selection.selectedShapes;
    if (!selected.length) {
        return;
    }
    const tableSelection = props.context.tableSelection;

    if (
        selected.length === 1
        && selected[0].type === ShapeType.Table
        && (tableSelection.editingCell || tableSelection.tableRowStart > -1)
    ) {
        let cells = [];
        let might_is_mixed = false;

        if (tableSelection.tableRowStart > -1) {
            const _cs = tableSelection.getSelectedCells(true);
            for (let i = 0, len = _cs.length; i < len; i++) {
                const c = _cs[i];
                if (!c.cell) {
                    might_is_mixed = true;
                } else cells.push(c.cell);
            }
        } else if (tableSelection.editingCell) {
            cells.push(tableSelection.editingCell);
        }

        if (cells.length > 0) {
            const _fs = get_fills(cells);
            if (_fs === 'mixed') {
                mixed_cell.value = true;
            } else {
                if (_fs.length > 0 && might_is_mixed) {
                    mixed_cell.value = true;
                } else {
                    fills.push(..._fs.reverse());
                }
            }
        }
    } else {
        const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
        const _fs = get_fills(shapes);
        if (_fs === 'mixed') {
            mixed.value = true;
        } else {
            fills.push(..._fs.reverse());
        }
    }
}

function addFill(): void {
    const color = new Color(0.2, 0, 0, 0);
    const fill = new Fill(new BasicArray(), v4(), true, FillType.SolidColor, color);

    const selected = props.context.selection.selectedShapes;
    const shape = selected[0];

    const tableSelection = props.context.tableSelection;
    if (selected.length === 1
        && shape.type === ShapeType.Table
        && (tableSelection.editingCell || tableSelection.tableRowStart > -1)) {
        const editor = props.context.editor4Table(shape as TableView);
        const range = get_table_range(tableSelection);
        if (mixed_cell.value) {
            editor.addFill4Cell(fill, range, true);
        } else {
            editor.addFill4Cell(fill, range, false);
        }
    } else if (selected.length === 1
        && (shape.type === ShapeType.Artboard || shape instanceof SymbolView)
        && !shape.style.fills.length) {
        const page = props.context.selection.selectedPage!;
        const color = new Color(1, 255, 255, 255);
        const fill = new Fill(new BasicArray(), v4(), true, FillType.SolidColor, color);
        const actions = get_actions_add_fill(selected, fill);
        const editor = props.context.editor4Page(page);
        editor.shapesAddFill(actions);
    } else {
        const page = props.context.selection.selectedPage!;
        const shapes = getShapesForStyle(selected);
        if (mixed.value) {
            const actions = get_actions_fill_unify(shapes);
            const editor = props.context.editor4Page(page);
            editor.shapesFillsUnify(actions);
        } else {
            const actions = get_actions_add_fill(shapes, fill);
            const editor = props.context.editor4Page(page);
            editor.shapesAddFill(actions);
        }
    }

    hidden_selection(props.context);
}

function first() {
    if (fills.length === 0 && !mixed.value) {
        addFill();
    }
}

function deleteFill(idx: number) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const s = selected[0];
    const table = props.context.tableSelection;
    const page = props.context.selection.selectedPage;
    if (len.value === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        e.deleteFill4Cell(_idx, range)
    } else {
        const shapes = getShapesForStyle(selected);
        const actions = get_actions_fill_delete(shapes, _idx);
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.shapesDeleteFill(actions);
        }
    }
    hidden_selection(props.context);
}

function toggleVisible(idx: number) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const s = selected[0];
    const table = props.context.tableSelection;
    if (len.value === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        e.setFillEnable4Cell(_idx, !fills[idx].fill.isEnabled, range)

    } else {
        const shapes = getShapesForStyle(selected);
        const fills = shapes[0].getFills();
        const value = !fills[_idx].isEnabled;
        const actions = get_actions_fill_enabled(shapes, _idx, value);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillEnabled(actions);
        }
    }

    hidden_selection(props.context);
}

const colorValue = ref('');
const alphaValue = ref('');
const tableSelect = ref({
    editingCell: props.context.tableSelection.editingCell,
    tableRowStart: props.context.tableSelection.tableRowStart,
    tableRowEnd: props.context.tableSelection.tableRowEnd,
    tableColStart: props.context.tableSelection.tableColStart,
    tableColEnd: props.context.tableSelection.tableColEnd
});

function setColor(idx: number, clr: string, alpha: number) {
    const res = clr.match(Reg_HEX);
    if (!res) {
        message('danger', t('system.illegal_input'));
        return;
    }
    const selected = shapes.value || props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    const r = Number.parseInt(res[1], 16);
    const g = Number.parseInt(res[2], 16);
    const b = Number.parseInt(res[3], 16);
    const s = selected[0] as ShapeView;
    const _idx = fills.length - idx - 1;
    const tableSelection = props.context.tableSelection;

    if (selected.length === 1 && s.type === ShapeType.Table && is_editing(tableSelection)) {
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(tableSelection);
        const tablecells = (s as TableView).getVisibleCells(tableSelection.tableRowStart,
            tableSelection.tableRowEnd,
            tableSelection.tableColStart,
            tableSelection.tableColEnd);
        if (tablecells.length > 0 && tablecells[0].cell) {
            e.setFillColor4Cell(_idx, new Color(alpha, r, g, b), range)
        }
    } else {
        const s = getShapesForStyle(selected);
        const actions = get_actions_fill_color(s, _idx, new Color(alpha, r, g, b));
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillColor(actions);
        }
    }

    hidden_selection(props.context);
}
function setFillOpacity(idx: number, opacity: number) {
    const selected = shapes.value || props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    const _idx = fills.length - idx - 1;
    const s = getShapesForStyle(selected);
    const actions = get_actions_fill_opacity(s, _idx, opacity);
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapesFillOpacity(actions);
    }
    hidden_selection(props.context);
}

function onColorChange(e: Event, idx: number) {
    let value = colorValue.value;
    (e.target as HTMLInputElement).blur();
    if (value.slice(0, 1) !== '#') {
        value = "#" + value
    }
    if (value.length === 4) value = `#${value.slice(1).split('').map(i => `${i}${i}`).join('')}`;
    if (value.length === 2) value = `#${value.slice(1).split('').map(i => `${i}${i}${i}${i}${i}${i}`).join('')}`;
    if (Reg_HEX.test(value)) {
        const alpha = fills[idx].fill.color.alpha;
        setColor(idx, value, alpha);
    } else {
        message('danger', t('system.illegal_input'));
        if (!colorFill.value) {
            return;
        }
        return colorFill.value[idx].value = toHex(fills[idx].fill.color.red, fills[idx].fill.color.green, fills[idx].fill.color.blue);
    }
}

function onAlphaChange(e: Event, idx: number, fill: Fill) {
    let value: any = alphaValue.value;
    if (!alphaFill.value) return;
    (e.target as HTMLInputElement).blur();
    if (value?.slice(-1) === '%') {
        value = Number(value?.slice(0, -1))
        if (value >= 0) {
            if (value > 100) {
                value = 100
            }
            value = value.toFixed(2) / 100
            const color = fills[idx].fill.color;
            let clr = toHex(color.red, color.green, color.blue);
            if (clr.slice(0, 1) !== '#') {
                clr = "#" + clr
            }
            if (fill.fillType === FillType.SolidColor) {
                setColor(idx, clr, value);
            } else if (fill.fillType === FillType.Pattern) {
                setFillOpacity(idx, value);
            } else if (fill.gradient && fill.fillType === FillType.Gradient) {
                set_gradient_opacity(idx, value);
            }
        } else {
            alpha_message(idx, fill);
        }
    } else if (!isNaN(Number(value))) {
        if (value >= 0) {
            if (value > 100) {
                value = 100
            }
            value = Number((Number(value)).toFixed(2)) / 100
            const color = fills[idx].fill.color;
            let clr = toHex(color.red, color.green, color.blue);
            if (clr.slice(0, 1) !== '#') {
                clr = "#" + clr
            }
            if (fill.fillType === FillType.SolidColor) {
                setColor(idx, clr, value);
            } else if (fill.fillType === FillType.Pattern) {
                setFillOpacity(idx, value);
            } else if (fill.gradient && fill.fillType === FillType.Gradient) {
                set_gradient_opacity(idx, value);
            }
        } else {
            alpha_message(idx, fill);
        }
    } else {
        alpha_message(idx, fill);
    }
}

const alpha_message = (idx: number, fill: Fill) => {
    if (!alphaFill.value) return;
    message('danger', t('system.illegal_input'));
    let alpha = 1;
    if (fill.fillType === FillType.SolidColor) {
        alpha = fill.color.alpha * 100;
    } else  if (fill.fillType === FillType.Pattern) {
        const opacity = fill.contextSettings?.opacity || 1;
        alpha = opacity * 100;
    } else if (fill.gradient && fill.fillType === FillType.Gradient) {
        const opacity = fill.gradient.gradientOpacity;
        alpha = (opacity === undefined ? 1 : opacity) * 100;
    }
    alphaFill.value[idx].value = alpha + '%'
}

const set_gradient_opacity = (idx: number, opacity: number) => {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient_stop(shapes, _idx, opacity, 'fills');
    editor.setGradientOpacity(actions);
}

function getColorFromPicker(idx: number, color: Color) {
    const _idx = fills.length - idx - 1;
    const s = props.context.selection.selectedShapes[0];
    const page = props.context.selection.selectedPage;
    const table = props.context.tableSelection;
    if (len.value === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        e.setFillColor4Cell(_idx, color, range)
    } else {
        const selected = props.context.selection.selectedShapes;
        const shapes = getShapesForStyle(selected);
        const actions = get_actions_fill_color(shapes, _idx, color);
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillColor(actions);
        }
    }
    hidden_selection(props.context);
}

const selectColor = (e: FocusEvent) => {
    if (colorFill.value) {
        shapes.value = [...props.context.selection.selectedShapes];
        const table = props.context.tableSelection;
        tableSelect.value = {
            editingCell: table.editingCell,
            tableRowStart: table.tableRowStart,
            tableRowEnd: table.tableRowEnd,
            tableColStart: table.tableColStart,
            tableColEnd: table.tableColEnd
        }
    }
}
const is_color_select = ref(false);
const colorClick = (e: Event) => {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_color_select.value) return;
    el.select();
    is_color_select.value = true;
}
const colorInput = (e: Event) => {
    if (colorFill.value) {
        const value = (e.target as HTMLInputElement).value;
        colorValue.value = value;
    }
}
const is_alpha_select = ref(false);
const alphaClick = (e: Event) => {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_alpha_select.value) return;
    el.select();
    is_alpha_select.value = true;
}
const selectAlpha = (e: Event) => {
    if (alphaFill.value) {
        shapes.value = [...props.context.selection.selectedShapes];
        const table = props.context.tableSelection;
        tableSelect.value = {
            editingCell: table.editingCell,
            tableRowStart: table.tableRowStart,
            tableRowEnd: table.tableRowEnd,
            tableColStart: table.tableColStart,
            tableColEnd: table.tableColEnd
        }
    }
}
const alphaInput = (e: Event) => {
    if (alphaFill.value) {
        const value = (e.target as HTMLInputElement).value;
        alphaValue.value = value;
    }
}
const filterAlpha = (fill: Fill) => {
    let a: number = 100;
    if (fill.fillType === FillType.SolidColor) {
        a = fill.color.alpha * 100;
    } else if (fill.fillType === FillType.Pattern) {
        const opacity = fill.contextSettings?.opacity || 1;
        a = opacity * 100;
    } else if (fill.gradient) {
        const opacity = fill.gradient.gradientOpacity;
        a = (opacity === undefined ? 1 : opacity) * 100;
    }
    let alpha = Math.round(a * 100) / 100;
    if (Number.isInteger(alpha)) {
        return alpha.toFixed(0); // 返回整数形式
    } else if (Math.abs(alpha * 10 - Math.round(alpha * 10)) < Number.EPSILON) {
        return alpha.toFixed(1); // 保留一位小数
    } else {
        return alpha.toFixed(2); // 保留两位小数
    }
}

/**
 * @description 翻转渐变
 * @param idx
 */
function gradient_reverse(idx: number) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient(shapes, _idx, 'fills');
    editor.reverseShapesGradient(actions);
}

/**
 * @description 旋转渐变
 * @param idx
 */
function gradient_rotate(idx: number) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient(shapes, _idx, 'fills');
    editor.rotateShapesGradient(actions);
}

/**
 * @description 添加渐变节点
 * @param idx
 * @param position
 * @param color
 */
function gradient_add_stop(idx: number, position: number, color: Color, id: string) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const stop = new Stop(new BasicArray(), id, position, color);
    const actions = get_aciton_gradient_stop(shapes, _idx, stop, 'fills');
    editor.addShapesGradientStop(actions);
}

/**
 * @description 切换渐变类型
 * @param idx
 */
function togger_gradient_type(idx: number, type: GradientType, fillType: FillType) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    if (fillType !== FillType.Gradient) {
        toggle_fill_type(idx, fillType);
    } else {
        const actions = get_aciton_gradient_stop(shapes, _idx, type, 'fills');
        editor.toggerShapeGradientType(actions);
    }
}

/**
 * @description 修改节点颜色
 * @param idx
 * @param color
 */
function gradient_stop_color_change(idx: number, color: Color, index: number) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient_stop(shapes, _idx, { color, stop_i: index }, 'fills');
    editor.setShapesGradientStopColor(actions);
}

/**
 * @description 删除渐变节点
 * @param idx
 * @param index
 */
function gradient_stop_delete(idx: number, index: number) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient_stop(shapes, _idx, index, 'fills');
    editor.deleteShapesGradientStop(actions);
}

function toggle_fill_type(idx: number, fillType: FillType) {
    const _idx = fills.length - idx - 1;
    const s = props.context.selection.selectedShapes[0];
    const page = props.context.selection.selectedPage;
    const table = props.context.tableSelection;
    if (len.value === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        e.setFillType4Cell(_idx, fillType, range)
    } else {
        const selected = props.context.selection.selectedShapes;
        const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_filltype(shapes, _idx, fillType);
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillType(actions);
        }
    }
}

const changeMode = (idx: number, mode: ImageScaleMode) => {
    const _idx = fills.length - idx - 1;
    const page = props.context.selection.selectedPage;

    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const actions = get_actions_image_scale_mode(shapes, _idx, mode);
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapesFillImageScaleMode(actions);
    }
}

const getImageUrl = (fill: Fill) => {
    return fill.peekImage(true) || props.context.attr.defaultImage;
}

const setImageRef = (idx: number, urlRef: string, origin: ImgFrame, imageMgr: { buff: Uint8Array, base64: string }) => {
    const _idx = fills.length - idx - 1;
    const page = props.context.selection.selectedPage;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const actions = get_actions_image_ref(shapes, _idx, { urlRef, origin, imageMgr });
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapesFillImageRef(actions);
    }
}

const changeRotate = (idx: number, fill: Fill) => {
    let rotate = fill.rotation || 0;
    const _idx = fills.length - idx - 1;
    const page = props.context.selection.selectedPage;

    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const actions = get_actions_image_ref(shapes, _idx, (rotate + 90) % 360);
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapesFillImageRotate(actions);
    }
}

const changeScale = (idx: number, scale: number) => {
    const _idx = fills.length - idx - 1;
    const page = props.context.selection.selectedPage;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const actions = get_actions_image_ref(shapes, _idx, scale / 100);
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapesFillImageScale(actions);
    }
}

const closeMode = (idx: number) => {
    const _idx = fills.length - idx - 1;
    const shape = props.context.selection.selectedShapes[0];
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapesFillEdit(shape, _idx, false);
    }
}
// hooks
const stop2 = watch(() => props.selectionChange, updateData); // 监听选区变化
const stop3 = watch(() => props.trigger, v => { // 监听选区图层变化
    if (v.length > 0 && (v.includes('layout') || v.includes('fills'))) updateData();
});
const stop4 = watch(() => props.tableSelectionChange, updateData); // 监听表格选区变化
const stop5 = watch(() => props.cellsTrigger, v => { // 监听选区单元格变化
    if (v.length > 0 && (v.includes('layout') || v.includes('fills'))) updateData();
})

onMounted(updateData);

onUnmounted(() => {
    stop2();
    stop3();
    stop4();
    stop5();
})
</script>

<template>
    <div class="fill-panel">
        <TypeHeader :title="t('attr.fill')" class="mt-24" @click.stop="first" :active="!!fills.length">
            <template #tool>
                <div class="add" @click.stop="addFill">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
            </template>
        </TypeHeader>
        <div class="tips-wrap" v-if="mixed">
            <span class="mixed-tips">{{ t('attr.mixed_lang') }}</span>
        </div>
        <div class="tips-wrap" v-if="mixed_cell">
            <span class="mixed-tips">{{ t('attr.mixed_cell_lang') }}</span>
        </div>
        <div class="fills-container" v-else-if="!mixed && !mixed_cell && fills.length">
            <div class="fill" v-for="(f, idx) in fills" :key="f.id">
                <div :class="f.fill.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible(idx)">
                    <svg-icon v-if="f.fill.isEnabled" icon-class="select"></svg-icon>
                </div>
                <div class="color" v-if="f.fill">
                    <ColorPicker :color="f.fill.color" :context="props.context" :auto_to_right_line="true"
                        :locat="{ index: fills.length - idx - 1, type: 'fills' }" :gradient="f.fill.gradient"
                        :fillType="f.fill.fillType" :scale="f.fill.scale"
                        :image-scale-mode="(f.fill.imageScaleMode || ImageScaleMode.Fill)"
                        :imageUrl="getImageUrl(f.fill)" @change="c => getColorFromPicker(idx, c)"
                        :image-origin-frame="{ width: f.fill.originalImageWidth || 0, height: f.fill.originalImageHeight || 0 }"
                        :paintFilter="f.fill.paintFilter" @gradient-reverse="() => gradient_reverse(idx)"
                        @gradient-rotate="() => gradient_rotate(idx)"
                        @gradient-add-stop="(p, c, id) => gradient_add_stop(idx, p, c, id)"
                        @gradient-type="(type, fillType) => togger_gradient_type(idx, type, fillType)"
                        @gradient-color-change="(c, index) => gradient_stop_color_change(idx, c, index)"
                        @gradient-stop-delete="(index) => gradient_stop_delete(idx, index)"
                        @changeMode="(mode) => changeMode(idx, mode)"
                        @setImageRef="(url, origin, imageMgr) => setImageRef(idx, url, origin, imageMgr)"
                        @changeRotate="changeRotate(idx, f.fill)" @changeScale="(scale) => changeScale(idx, scale)"
                        @closeMode="closeMode(idx)">
                    </ColorPicker>
                    <input ref="colorFill" class="colorFill" v-if="f.fill.fillType === FillType.SolidColor"
                        :value="toHex(f.fill.color.red, f.fill.color.green, f.fill.color.blue)" :spellcheck="false"
                        @change="(e) => onColorChange(e, idx)" @focus="selectColor($event)" @click="colorClick"
                        @input="colorInput($event)" @blur="is_color_select = false"
                        :class="{ 'check': f.fill.isEnabled, 'nocheck': !f.fill.isEnabled }" />
                    <span class="colorFill" style="line-height: 14px;"
                        v-else-if="f.fill.fillType === FillType.Gradient && f.fill.gradient">{{
            t(`color.${f.fill.gradient.gradientType}`) }}</span>
                    <span class="colorFill" style="line-height: 14px;"
                        v-else-if="f.fill.fillType === FillType.Pattern">{{
            t(`pattern.image`) }}</span>
                    <input ref="alphaFill" class="alphaFill" :value="filterAlpha(f.fill) + '%'"
                        @change="(e) => onAlphaChange(e, idx, f.fill)" @focus="(e) => selectAlpha(e)"
                        @input="alphaInput" @click="alphaClick" @blur="is_alpha_select = false"
                        :class="{ 'check': f.fill.isEnabled, 'nocheck': !f.fill.isEnabled }" />
                </div>
                <!--                <div class="temporary"></div>-->
                <div class="delete" @click="deleteFill(idx)">
                    <svg-icon icon-class="delete"></svg-icon>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped lang="scss">
.fill-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .add {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-radius: var(--default-radius);
        transition: .2s;

        >svg {
            width: 16px;
            height: 16px;
        }
    }

    .add:hover {
        background-color: #F5F5F5;
        ;
    }

    .fills-container {
        padding: 6px 0;

        .fill {
            height: 32px;
            width: 100%;
            display: flex;
            flex-direction: row;
            // justify-content: space-between;
            align-items: center;
            margin-top: 6px;

            .visibility {
                flex: 0 0 14px;
                width: 14px;
                height: 14px;
                background-color: var(--active-color);
                box-sizing: border-box;
                color: #ffffff;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 4px;
                margin-right: 5px;

                >svg {
                    width: 60%;
                    height: 60%;
                }
            }

            .hidden {
                flex: 0 0 14px;
                width: 14px;
                height: 14px;
                background: #FFFFFF;
                border-radius: 4px;
                border: 1px solid #EBEBEB;
                box-sizing: border-box;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: 5px;
            }

            .color {
                flex: 1;
                background-color: var(--input-background);
                height: 32px;
                padding: 9px 8px;
                margin-right: 5px;
                border-radius: var(--default-radius);
                box-sizing: border-box;
                display: flex;
                align-items: center;

                .colorFill {
                    outline: none;
                    border: none;
                    background-color: transparent;
                    width: calc(100% - 53px);
                    height: 14px;
                    margin-left: 8px;
                    flex: 1;
                    font-size: 12px;
                    box-sizing: border-box;
                }

                .alphaFill {
                    outline: none;
                    border: none;
                    background-color: transparent;
                    width: 37px;
                    text-align: center;
                    font-size: 12px;
                    box-sizing: border-box;
                }

                input+input {
                    width: 45px;
                }

                .check {
                    color: #000000;
                }

                .nocheck {
                    color: rgba(0, 0, 0, 0.3);
                }
            }

            .temporary {
                flex: 0 0 28px;
                width: 28px;
                height: 28px;
            }

            .delete {
                flex: 0 0 28px;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 28px;
                height: 28px;
                border-radius: var(--default-radius);
                transition: .2s;

                >svg {
                    width: 16px;
                    height: 16px;
                }
            }

            .delete:hover {
                background-color: #F5F5F5;
            }
        }
    }

    .tips-wrap {
        padding: 12px 0;

        .mixed-tips {
            color: #737373;
            display: block;
            width: 218px;
            height: 14px;
            text-align: center;
            font-size: var(--font-default-fontsize);
        }
    }

}
</style>