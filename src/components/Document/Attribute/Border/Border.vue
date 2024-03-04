<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Context } from '@/context';
import { BasicArray, GradientType, GroupShapeView, Shape, ShapeType, ShapeView, Stop, TableCell, TableCellView, TableShape, TableView, adapt2Shape } from '@kcdesign/data';
import TypeHeader from '../TypeHeader.vue';
import BorderDetail from './BorderDetail.vue';
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { useI18n } from 'vue-i18n';
import { Color, Border, BorderStyle } from '@kcdesign/data';
import { FillType, BorderPosition } from '@kcdesign/data';
import { Reg_HEX } from "@/utils/RegExp";
import { message } from "@/utils/message";
import { toHex } from "@/utils/color";
import { WorkSpace } from '@/context/workspace';
import {
    get_borders,
    get_actions_add_boder,
    get_actions_border_color,
    get_actions_border_unify,
    get_actions_border_enabled,
    get_actions_border_delete,
    get_aciton_gradient,
    get_aciton_gradient_stop,
    get_actions_filltype
} from '@/utils/shape_style';
import { v4 } from 'uuid';
import Apex from './Apex.vue';
import { TableSelection } from '@/context/tableselection';
import { Selection } from "@/context/selection";
import { flattenShapes } from '@/utils/cutout';
import { get_table_range, is_editing, hidden_selection } from '@/utils/content';
import { getShapesForStyle } from '@/utils/style';

interface BorderItem {
    id: number
    border: Border
}

interface Props {
    context: Context
    shapes: ShapeView[]
}

const { t } = useI18n();
const props = defineProps<Props>();
const data: { borders: BorderItem[] } = reactive({ borders: [] });
const { borders } = data;
const alphaBorder = ref<HTMLInputElement[]>();
const colorBorder = ref<HTMLInputElement[]>()
const mixed = ref<boolean>(false);
const mixed_cell = ref(false);
const editor = computed(() => props.context.editor4Shape((props.shapes[0])));
const watchedShapes = new Map();
const show_apex = ref<boolean>(false);
const shapes = ref<ShapeView[]>([]);
const apex_view = ref<number>(0);
let table: TableShape;

function watchShapes() {
    const needWatchShapes = new Map();
    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length > 0) {
        for (let i = 0, l = selectedShapes.length; i < l; i++) {
            const v = selectedShapes[i];
            if (v.isVirtualShape) {
                let p = v.parent;
                while (p) {
                    if (p.type === ShapeType.SymbolRef) {
                        needWatchShapes.set(p.id, p);
                        break;
                    }
                    p = p.parent;
                }
            }
            needWatchShapes.set(v.id, v);
        }
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(watcher);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(watcher);
        watchedShapes.set(k, v);
    })
}

function watcher(...args: any[]) {
    if ((args.includes('layout'))) [
        updateData()
    ]
}

function updateData() {
    borders.length = 0;
    mixed.value = false;
    mixed_cell.value = false;
    const selecteds = getShapesForStyle(props.context.selection.selectedShapes);
    const shape = selecteds[0];
    const table = props.context.tableSelection;
    if (selecteds.length === 1 && shape.type === ShapeType.Table && is_editing(table)) {
        const is_edting = table.editingCell;
        let cells: TableCellView[] = [], might_is_mixed = false;
        if (table.tableRowStart > -1) {
            const _cs = table.getSelectedCells(true);
            for (let i = 0, len = _cs.length; i < len; i++) {
                const c = _cs[i];
                if (!c.cell) might_is_mixed = true;
                else cells.push(c.cell);
            }
        } else if (is_edting) {
            cells.push(is_edting)
        }
        if (cells.length > 0) {
            const _bs = get_borders(cells);
            if (_bs === 'mixed') {
                mixed_cell.value = true;
            } else {
                if (_bs.length > 0 && might_is_mixed) {
                    mixed_cell.value = true;
                } else {
                    borders.push(..._bs.reverse());
                }
            }
        }
    } else {
        const shapes = flattenShapes(selecteds).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
        const _bs = get_borders(shapes);
        if (_bs === 'mixed') {
            mixed.value = true;
        } else {
            borders.push(..._bs.reverse());
        }
    }
}

function addBorder() {
    props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
    const color = new Color(1, 0, 0, 0);
    const borderStyle = new BorderStyle(0, 0);
    const border = new Border(new BasicArray(), v4(), true, FillType.SolidColor, color, BorderPosition.Outer, 1, borderStyle);
    const selected = props.context.selection.selectedShapes;
    const s = selected[0];
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const table = props.context.tableSelection;
    if (selected.length === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        if (mixed_cell.value) {
            e.addBorder4Multi(border, range)
        } else {
            e.addBorder(border, range)
        }
    } else {
        const shapes = getShapesForStyle(props.shapes);
        if (mixed.value) {
            const actions = get_actions_border_unify(shapes);
            const editor = props.context.editor4Page(page);
            editor.shapesBordersUnify(actions);
        } else {
            const actions = get_actions_add_boder(shapes, border);
            const editor = props.context.editor4Page(page);
            editor.shapesAddBorder(actions);
        }
    }
    hidden_selection(props.context);
}

function first() {
    if (borders.length === 0 && !mixed.value) addBorder();
}

function deleteBorder(idx: number) {
    const _idx = borders.length - idx - 1;
    props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
    const selected = props.context.selection.selectedShapes;
    const s = selected[0];
    const page = props.context.selection.selectedPage;
    const table = props.context.tableSelection;
    if (selected.length === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const table = props.context.tableSelection;
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        e.deleteBorder(_idx, range)
    } else {
        const shapes = getShapesForStyle(props.shapes);
        const actions = get_actions_border_delete(shapes, _idx);
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.shapesDeleteBorder(actions);
        }
    }
    hidden_selection(props.context);
}

function toggleVisible(idx: number) {
    props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
    const border = borders[idx].border;
    const isEnabled = !border.isEnabled;
    const _idx = borders.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const s = selected[0];
    const page = props.context.selection.selectedPage;
    const table = props.context.tableSelection;
    if (selected.length === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const table = props.context.tableSelection;
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        e.setBorderEnable(_idx, isEnabled, range)
    } else {
        const shapes = getShapesForStyle(props.shapes);
        const actions = get_actions_border_enabled(shapes, _idx, isEnabled);
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderEnabled(actions);
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
function onColorChange(e: Event, idx: number) {
    let value = colorValue.value;
    if (value.slice(0, 1) !== '#') {
        value = "#" + value
    }
    if (value.length === 4) value = `#${value.slice(1).split('').map(i => `${i}${i}`).join('')}`;
    if (value.length === 2) value = `#${value.slice(1).split('').map(i => `${i}${i}${i}${i}${i}${i}`).join('')}`;
    const hex = value.match(Reg_HEX);
    const border = borders[idx].border;
    if (!hex) {
        message('danger', t('system.illegal_input'));
        if (!colorBorder.value) return;
        return colorBorder.value[idx].value = (toHex(border.color)).slice(1)
    }
    const r = Number.parseInt(hex[1], 16);
    const g = Number.parseInt(hex[2], 16);
    const b = Number.parseInt(hex[3], 16);
    const alpha = border.color.alpha;
    const color = new Color(alpha, r, g, b);
    setColor(idx, color);
    props.context.workspace.notify(WorkSpace.CTRL_APPEAR);
    hidden_selection(props.context);
}

function onAlphaChange(b: Border, idx: number) {
    props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
    let alpha: any = alphaValue.value;
    if (!alphaBorder.value) return;
    if (alpha.slice(-1) === '%') {
        alpha = Number(alpha?.slice(0, -1))
        if (isNaN(alpha) || alpha < 0) {
            alpha_message(idx, b);
        }
        if (alpha > 100) {
            alpha = 100;
        }
        alpha = alpha.toFixed(2) / 100
        const border = borders[idx].border;
        const { red, green, blue } = border.color
        const color = new Color(alpha, red, green, blue);
        if (b.fillType === FillType.SolidColor) {
            setColor(idx, color);
        } else if (b.gradient && b.fillType === FillType.Gradient) {
            set_gradient_opacity(idx, alpha);
        }
    } else {
        if (!isNaN(Number(alpha)) && alpha >= 0) {
            if (alpha > 100) {
                alpha = 100
            }
            alpha = Number((Number(alpha)).toFixed(2)) / 100;
            const border = borders[idx].border;
            const { red, green, blue } = border.color
            const color = new Color(alpha, red, green, blue);
            if (b.fillType === FillType.SolidColor) {
                setColor(idx, color);
            } else if (b.gradient && b.fillType === FillType.Gradient) {
                set_gradient_opacity(idx, alpha);
            }
        } else {
            alpha_message(idx, b);
        }
    }
    hidden_selection(props.context);
}

function setColor(idx: number, color: Color) {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    const s = selected[0] as ShapeView;
    const _idx = borders.length - idx - 1;
    const table = props.context.tableSelection;
    if (selected.length === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        const tablecells = (s as TableView).getVisibleCells(table.tableRowStart,
            table.tableRowEnd,
            table.tableColStart,
            table.tableColEnd);
        if (tablecells.length > 0 && tablecells[0].cell) {
            e.setBorderColor(_idx, color, range)
        }
    } else {
        const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
        const actions = get_actions_border_color(shapes, _idx, color);
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderColor(actions);
        }
    }
}

const alpha_message = (idx: number, border: Border) => {
    if (!alphaBorder.value) return;
    message('danger', t('system.illegal_input'));
    let alpha = 1;
    if (border.fillType === FillType.SolidColor) {
        alpha = border.color.alpha * 100;
    } else if (border.gradient && border.fillType === FillType.Gradient) {
        const opacity = border.gradient.gradientOpacity;
        alpha = (opacity === undefined ? 1 : opacity) * 100;
    }
    alphaBorder.value[idx].value = alpha + '%'
}

const set_gradient_opacity = (idx: number, opacity: number) => {
    const _idx = borders.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = getShapesForStyle(props.shapes);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient_stop(shapes, _idx, opacity, 'borders');
    editor.setGradientOpacity(actions);
}

function getColorFromPicker(color: Color, idx: number) {
    const _idx = borders.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const s = selected[0];
    const page = props.context.selection.selectedPage;
    const table = props.context.tableSelection;
    if (selected.length === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        e.setBorderColor(_idx, color, range)
    } else {
        const shapes = getShapesForStyle(props.shapes);
        const actions = get_actions_border_color(shapes, _idx, color);
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderColor(actions);
        }
    }
    hidden_selection(props.context);
}

const selectColor = (i: number) => {
    if (colorBorder.value) {
        shapes.value = [...props.context.selection.selectedShapes];
        const table = props.context.tableSelection;
        tableSelect.value = {
            editingCell: table.editingCell,
            tableRowStart: table.tableRowStart,
            tableRowEnd: table.tableRowEnd,
            tableColStart: table.tableColStart,
            tableColEnd: table.tableColEnd
        }
        colorBorder.value[i].select()
    }
}
const colorInput = (i: number) => {
    if (colorBorder.value) {
        const value = colorBorder.value[i].value;
        colorValue.value = value;
    }
}
const selectAlpha = (e: Event) => {
    if (alphaBorder.value) {
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
    (e.target as HTMLInputElement).select();
}
const alphaInput = (e: Event) => {
    if (alphaBorder.value) {
        const value = (e.target as HTMLInputElement).value;
        alphaValue.value = value;
    }
}
const filterAlpha = (border: Border) => {
    let a: number = 100;
    if (border.fillType === FillType.SolidColor || !isGradient()) {
        a = border.color.alpha * 100;
    } else if (border.gradient && border.fillType === FillType.Gradient) {
        const opacity = border.gradient.gradientOpacity;
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
    const _idx = borders.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient(shapes, _idx, 'borders');
    editor.reverseShapesGradient(actions);
}
/**
 * @description 旋转渐变
 * @param idx 
 */
function gradient_rotate(idx: number) {
    const _idx = borders.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient(shapes, _idx, 'borders');
    editor.rotateShapesGradient(actions);
}
/**
 * @description 添加渐变节点
 * @param idx 
 * @param position 
 * @param color 
 */
function gradient_add_stop(idx: number, position: number, color: Color, id: string) {
    const _idx = borders.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const stop = new Stop(new BasicArray(), id, position, color);
    const actions = get_aciton_gradient_stop(shapes, _idx, stop, 'borders');
    editor.addShapesGradientStop(actions);
}
/**
 * @description 切换渐变类型
 * @param idx 
 */
function togger_gradient_type(idx: number, type: GradientType | 'solid') {
    const _idx = borders.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    if (type === 'solid') {
        toggle_fill_type(idx, FillType.SolidColor);
    } else {
        const actions = get_aciton_gradient_stop(shapes, _idx, type, 'borders');
        editor.toggerShapeGradientType(actions);
    }
}
/**
 * @description 修改节点颜色
 * @param idx 
 * @param color 
 */
function gradient_stop_color_change(idx: number, color: Color, index: number) {
    const _idx = borders.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient_stop(shapes, _idx, { color, stop_i: index }, 'borders');
    editor.setShapesGradientStopColor(actions);
}
/**
 * @description 删除渐变节点
 * @param idx 
 * @param index 
 */
function gradient_stop_delete(idx: number, index: number) {
    const _idx = borders.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient_stop(shapes, _idx, index, 'borders');
    editor.deleteShapesGradientStop(actions);
}

function toggle_fill_type(idx: number, fillType: FillType) {
    const _idx = borders.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const s = selected[0];
    const page = props.context.selection.selectedPage;
    const table = props.context.tableSelection;
    if (selected.length === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        e.setFillType(_idx, fillType, range)
    } else {
        const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
        const actions = get_actions_filltype(shapes, _idx, fillType);
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderType(actions);
        }
    }
}

function layout() {
    show_apex.value = false;
    if (props.shapes.length === 1) {
        const type = props.shapes[0].type;
        show_apex.value = (type === ShapeType.Line || type === ShapeType.Contact);
    }
}

function update_by_shapes() {
    watchShapes();
    updateData();
    layout();
}

function shapes_watcher(v: ShapeView[]) {
    update_by_shapes();
    watchCells.forEach((v) => v.unwatch(updateData));
    watchCells.clear();
    if (v.length === 1 && v[0].type === ShapeType.Table) {
        table?.unwatch(table_watcher);
        v[0].watch(table_watcher);
    } else {
        table?.unwatch(table_watcher);
    }
}

function table_watcher() {
    cells_watcher();
}

let watchCells: Map<string, TableCell> = new Map();

function cells_watcher() {
    const table_selection = props.context.tableSelection;
    const is_edting = table_selection.editingCell;
    if (table_selection.tableRowStart > -1 || is_edting) {
        let cells: any[] = [];
        if (is_edting) {
            cells.push(is_edting);
        } else {
            cells = table_selection.getSelectedCells(true);
        }
        const needWatch: Map<string, TableCell> = new Map();
        for (let i = 0, len = cells.length; i < len; i++) {
            let c = cells[i];
            if (c.cell) {
                needWatch.set(c.cell.id, c.cell);
                c.cell.watch(updateData);
            }
        }
        watchCells.forEach((v, k) => {
            if (!needWatch.get(k)) v.unwatch(updateData);
        })
        watchCells = needWatch;
    }
}

function table_selection_watcher(t: number) {
    if (t === TableSelection.CHANGE_TABLE_CELL) {
        updateData();
        cells_watcher();
    } else if (t === TableSelection.CHANGE_EDITING_CELL) {
        updateData();
        cells_watcher();
    }
}

function selection_watcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) update_by_shapes();
}

const isGradient = () => {
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
    let ret = false;
    shapes.forEach(s => {
        if (s.type !== ShapeType.Contact) {
            ret = true;
        }
    })
    return ret;
}

// hooks
const stop = watch(() => props.shapes, (v) => shapes_watcher(v));
onMounted(() => {
    update_by_shapes();
    props.context.tableSelection.watch(table_selection_watcher);
    props.context.selection.watch(selection_watcher);
})
onUnmounted(() => {
    stop();
    props.context.tableSelection.unwatch(table_selection_watcher);
    props.context.selection.unwatch(selection_watcher);
    watchedShapes.forEach(v => {
        v.unwatch(watcher)
    });
})
</script>

<template>
    <div class="border-panel">
        <TypeHeader :title="t('attr.border')" class="mt-24" @click.stop="first" :active="!!borders.length">
            <template #tool>
                <div class="add" @click.stop="addBorder">
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
        <div class="borders-container" v-else-if="!mixed && !mixed_cell">
            <div class="border" v-for="(b, idx) in borders" :key="b.id">
                <div :class="b.border.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible(idx)">
                    <svg-icon v-if="b.border.isEnabled" icon-class="select"></svg-icon>
                </div>
                <div class="color">
                    <ColorPicker :color="b.border.color" :context="props.context" :auto_to_right_line="true"
                        :locat="{ index: borders.length - idx - 1, type: 'borders' }" @change="(c: Color) => getColorFromPicker(c, idx)"
                        @gradient-reverse="() => gradient_reverse(idx)" :gradient="isGradient() ? b.border.gradient : undefined"
                        :fillType="b.border.fillType" @gradient-rotate="() => gradient_rotate(idx)"
                        @gradient-add-stop="(p, c, id) => gradient_add_stop(idx, p, c, id)"
                        @gradient-type="(type) => togger_gradient_type(idx, type)"
                        @gradient-color-change="(c, index) => gradient_stop_color_change(idx, c, index)"
                        @gradient-stop-delete="(index) => gradient_stop_delete(idx, index)" />
                    <input ref="colorBorder" class="colorBorder" :spellcheck="false"
                        v-if="b.border.fillType !== FillType.Gradient || !isGradient()" :value="(toHex(b.border.color)).slice(1)"
                        @change="e => onColorChange(e, idx)" @focus="selectColor(idx)" @input="colorInput(idx)"
                        :class="{ 'check': b.border.isEnabled, 'nocheck': !b.border.isEnabled }" />
                    <span class="colorBorder" style="line-height: 14px;"
                        v-else-if="b.border.fillType === FillType.Gradient && b.border.gradient && isGradient()">{{
                            t(`color.${b.border.gradient.gradientType}`) }}</span>
                    <input ref="alphaBorder" class="alphaBorder" style="text-align: center;"
                        :value="filterAlpha(b.border) + '%'" @change="e => onAlphaChange(b.border, idx)"
                        @focus="selectAlpha" @input="alphaInput"
                        :class="{ 'check': b.border.isEnabled, 'nocheck': !b.border.isEnabled }" />
                </div>
                <!--                <div class="extra-action">-->
                <BorderDetail :context="props.context" :shapes="props.shapes" :border="b.border"
                    :index="borders.length - idx - 1">
                </BorderDetail>
                <div class="delete" @click="deleteBorder(idx)">
                    <svg-icon icon-class="delete"></svg-icon>
                </div>
                <!--                </div>-->
            </div>
        </div>
        <Apex v-if="show_apex && !!borders.length" :context="props.context" :shapes="props.shapes" :view="apex_view">
        </Apex>
    </div>
</template>

<style scoped lang="scss">
.border-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px 18px 8px;
    box-sizing: border-box;
    //border-top: 1px solid #F0F0F0;
    border-bottom: 1px solid #F0F0F0;

    .add {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: .2s;
        box-sizing: border-box;
        border-radius: var(--default-radius);

        >svg {
            width: 16px;
            height: 16px;
        }
    }

    .add:hover {
        background-color: #F5F5F5;
    }

    .tips-wrap {
        padding: 12px 0;

        .mixed-tips {
            display: block;
            width: 218px;
            height: 14px;
            text-align: center;
            font-size: var(--font-default-fontsize);
            color: #737373;
        }
    }

    .borders-container {
        .border {
            height: 30px;
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-top: 4px;

            .visibility {
                flex: 0 0 14px;
                height: 14px;
                width: 14px;
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
                height: 14px;
                width: 14px;
                background: #FFFFFF;
                border-radius: 4px;
                border: 1px solid #EBEBEB;
                box-sizing: border-box;
                margin-right: 5px;
            }

            .color {
                flex: 1;
                background-color: var(--input-background);
                height: 32px;
                padding: 9px 8px;
                //margin-left: -11px;
                border-radius: var(--default-radius);
                box-sizing: border-box;
                display: flex;
                align-items: center;
                margin-right: 5px;

                .colorBorder {
                    outline: none;
                    border: none;
                    background-color: transparent;
                    width: 70px;
                    height: 14px;
                    margin-left: 8px;
                    flex: 1;
                    font-size: 12px;
                    box-sizing: border-box;
                }

                .alphaBorder {
                    outline: none;
                    border: none;
                    background-color: transparent;
                    width: 37px;
                    //margin-left: 20%;
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

            //.extra-action {
            //    display: flex;
            //    align-items: center;
            //    justify-content: center;
            //    margin-left: 2px;

            .delete {
                flex: 0 0 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                transition: 0.2s;
                border-radius: var(--default-radius);
                >svg {
                    width: 16px;
                    height: 16px;
                }
            }

            .delete:hover {
                background-color: #F5F5F5;
                ;
            }

            //}
        }
    }
}
</style>