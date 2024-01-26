<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Context } from '@/context';
import { Color, Fill, FillType, GroupShapeView, Shape, ShapeType, ShapeView, TableCell, TableView, TableShape, Stop, GradientType, adapt2Shape } from "@kcdesign/data";
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
    get_actions_filltype,
    get_actions_fill_unify,
    get_fills
} from '@/utils/shape_style';
import { v4 } from 'uuid';
import { TableSelection } from '@/context/tableselection';
import { Selection } from "@/context/selection";
import { flattenShapes } from '@/utils/cutout';
import { get_table_range, is_editing } from '@/utils/content';

interface FillItem {
    id: number,
    fill: Fill
}

interface Props {
    context: Context
    shapes: ShapeView[]
}

const props = defineProps<Props>();
const editor = computed(() => props.context.editor4Shape(props.shapes[0]));
const len = computed<number>(() => props.shapes.length);
const { t } = useI18n();
const watchedShapes = new Map();
const fills: FillItem[] = reactive([]);
const alphaFill = ref<HTMLInputElement[]>();
const colorFill = ref<HTMLInputElement[]>();
const mixed = ref<boolean>(false);
const mixed_cell = ref(false);
const shapes = ref<ShapeView[]>([]);
let table: TableView;

function toHex(r: number, g: number, b: number) {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return hex(r) + hex(g) + hex(b);
}

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

function updateData() {
    fills.length = 0;
    mixed.value = false;
    mixed_cell.value = false;
    const selecteds = props.context.selection.selectedShapes;
    if (selecteds.length < 1)  return;
    const table = props.context.tableSelection;
    const shape = selecteds[0];
    if (selecteds.length === 1 && shape.type === ShapeType.Table && is_editing(table)) {
        const is_edting = table.editingCell;
        let cells = [], might_is_mixed = false;
        if (table.tableRowStart > -1) {
            const _cs = table.getSelectedCells(true);
            for (let i = 0, len = _cs.length; i < len; i++) {
                const c = _cs[i];
                if (!c.cell) might_is_mixed = true;
                else cells.push(c.cell);
            }
        } else if (is_edting) {
            cells.push(is_edting.cell);
        }
        if (cells.length > 0) {
            const _fs = get_fills(cells as Shape[]);
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
        const shapes = flattenShapes(selecteds).filter(s => s.type !== ShapeType.Group);
        const _fs = get_fills(shapes);
        if (_fs === 'mixed') {
            mixed.value = true;
        } else {
            fills.push(..._fs.reverse());
        }
    }
}

function watcher(...args: any[]) {
    if (args.length > 0 && (args.includes('style') || args.includes('variable'))) updateData();
}

function addFill(): void {
    const color = new Color(0.2, 0, 0, 0);
    const fill = new Fill(v4(), true, FillType.SolidColor, color);
    const selected = props.context.selection.selectedShapes;
    const s = selected[0];
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const table = props.context.tableSelection;
    if (len.value === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const editor = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        if (mixed_cell.value) {
            editor.addFill4Multi(fill, range);
        } else {
            editor.addFill(fill, range);
        }
    } else {
        const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
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
}

function first() {
    if (fills.length === 0 && !mixed.value) addFill();
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
        e.deleteFill(_idx, range)
    } else {
        const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_fill_delete(shapes, _idx);
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.shapesDeleteFill(actions);
        }
    }
}

function toggleVisible(idx: number) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const s = selected[0];
    const table = props.context.tableSelection;
    if (len.value === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        e.setFillEnable(_idx, !fills[idx].fill.isEnabled, range)

    } else {
        const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
        const fills = shapes[0].getFills();
        const value = !fills[_idx].isEnabled;
        const actions = get_actions_fill_enabled(shapes, _idx, value);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillEnabled(actions);
        }
    }
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
function setColor(idx: number, clr: string, alpha: number, isColor: boolean) {
    const res = clr.match(Reg_HEX);
    if (!res) {
        message('danger', t('system.illegal_input'));
        return;
    }
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    const r = Number.parseInt(res[1], 16);
    const g = Number.parseInt(res[2], 16);
    const b = Number.parseInt(res[3], 16);
    const s = selected[0] as ShapeView;
    const _idx = fills.length - idx - 1;
    const table = props.context.tableSelection;
    if (selected.length === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        const tablecells = (s as TableView).getVisibleCells(table.tableRowStart,
            table.tableRowEnd,
            table.tableColStart,
            table.tableColEnd);
        if (tablecells.length > 0 && tablecells[0].cell) {
            e.setFillColor(_idx, new Color(alpha, r, g, b), range)
        }
    } else {
        const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_fill_color(shapes, _idx, new Color(alpha, r, g, b));
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillColor(actions);
        }
    }
}

function onColorChange(idx: number, e: Event) {
    let value = colorValue.value;
    if (value.slice(0, 1) !== '#') {
        value = "#" + value
    }
    if (value.length === 4) value = `#${value.slice(1).split('').map(i => `${i}${i}`).join('')}`;
    if (value.length === 2) value = `#${value.slice(1).split('').map(i => `${i}${i}${i}${i}${i}${i}`).join('')}`;
    if (Reg_HEX.test(value)) {
        const alpha = fills[idx].fill.color.alpha;
        setColor(idx, value, alpha, true);
    } else {
        message('danger', t('system.illegal_input'));
        if (!colorFill.value) return;
        return colorFill.value[idx].value = toHex(fills[idx].fill.color.red, fills[idx].fill.color.green, fills[idx].fill.color.blue);
    }
}

function onAlphaChange(idx: number, e: Event) {
    let value: any = alphaValue.value;
    if (alphaFill.value) {
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
                setColor(idx, clr, value, false);
                return
            } else {
                message('danger', t('system.illegal_input'));
                return alphaFill.value[idx].value = (fills[idx].fill.color.alpha * 100) + '%'
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
                setColor(idx, clr, value, false);
                return
            } else {
                message('danger', t('system.illegal_input'));
                return alphaFill.value[idx].value = (fills[idx].fill.color.alpha * 100) + '%'
            }
        } else {
            message('danger', t('system.illegal_input'));
            return alphaFill.value[idx].value = (fills[idx].fill.color.alpha * 100) + '%'
        }
    }
}

function getColorFromPicker(idx: number, color: Color) {
    const _idx = fills.length - idx - 1;
    const s = props.context.selection.selectedShapes[0];
    const page = props.context.selection.selectedPage;
    const table = props.context.tableSelection;
    if (len.value === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        e.setFillColor(_idx, color, range)
    } else {
        const selected = props.context.selection.selectedShapes;
        const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_fill_color(shapes, _idx, color);
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillColor(actions);
        }
    }
}

const selectColor = (id: number) => {
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
        colorFill.value[id].select()
    }
}
const colorInput = (i: number) => {
    if (colorFill.value) {
        const value = colorFill.value[i].value;
        colorValue.value = value;
    }
}
const selectAlpha = (id: number) => {
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
        alphaFill.value[id].select()
    }
}
const alphaInput = (i: number) => {
    if (alphaFill.value) {
        const value = alphaFill.value[i].value;
        alphaValue.value = value;
    }
}
const filterAlpha = (a: number) => {
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
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient(selected, _idx, 'fills');
    editor.reverseShapesGradient(actions);
}
/**
 * @description 旋转渐变
 * @param idx 
 */
function gradient_rotate(idx: number) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient(selected, _idx, 'fills');
    editor.rotateShapesGradient(actions);
}
/**
 * @description 添加渐变节点
 * @param idx 
 * @param position 
 * @param color 
 */
function gradient_add_stop(idx: number, position: number, color: Color) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const stop = new Stop(position, color, v4());
    const actions = get_aciton_gradient_stop(selected, _idx, stop, 'fills');
    editor.addShapesGradientStop(actions);
}
/**
 * @description 切换渐变类型
 * @param idx 
 */
function togger_gradient_type(idx: number, type: GradientType | 'solid') {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    if (type === 'solid') {
        toggle_fill_type(idx, FillType.SolidColor);
    } else {
        const actions = get_aciton_gradient_stop(selected, _idx, type, 'fills');
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
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient_stop(selected, _idx, { color, stop_i: index }, 'fills');
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
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient_stop(selected, _idx, index, 'fills');
    editor.deleteShapesGradientStop(actions);
}
/**
 * @description 修改节点位置
 * @param idx 
 * @param position 
 */
function gradient_stop_position(idx: number, position: number, id: string) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_aciton_gradient_stop(selected, _idx, { position, id }, 'fills');
    editor.setShapesGradientStopPosition(actions);
}

function toggle_fill_type(idx: number, fillType: FillType) {
    const _idx = fills.length - idx - 1;
    const s = props.context.selection.selectedShapes[0];
    const page = props.context.selection.selectedPage;
    const table = props.context.tableSelection;
    if (len.value === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        e.setFillType(_idx, fillType, range)
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
function update_by_shapes() {
    watchShapes();
    updateData();
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

function selection_watcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) update_by_shapes();
}

// hooks
const stop = watch(() => props.shapes, (v) => shapes_watcher(v));

function table_selection_watcher(t: number) {
    if (t === TableSelection.CHANGE_TABLE_CELL) {
        updateData();
        cells_watcher();
    } else if (t === TableSelection.CHANGE_EDITING_CELL) {
        updateData();
        cells_watcher();
    }
}

onMounted(() => {
    update_by_shapes();
    props.context.tableSelection.watch(table_selection_watcher);
    props.context.selection.watch(selection_watcher);
})

onUnmounted(() => {
    stop();
    props.context.tableSelection.unwatch(table_selection_watcher);
    props.context.selection.unwatch(selection_watcher);
    watchedShapes.forEach(v => v.unwatch(watcher));
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
        <div class="fills-container" v-else-if="!mixed && !mixed_cell">
            <div class="fill" v-for="(f, idx) in fills" :key="f.id">
                <div :class="f.fill.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible(idx)">
                    <svg-icon v-if="f.fill.isEnabled" icon-class="select"></svg-icon>
                </div>
                <div class="color">
                    <ColorPicker :color="f.fill.color" :context="props.context" :auto_to_right_line="true"
                        :locat="{ index: idx, type: 'fills' }" @change="c => getColorFromPicker(idx, c)"
                        @gradient-reverse="() => gradient_reverse(idx)" :gradient="f.fill.gradient"
                        :fillType="f.fill.fillType" @gradient-rotate="() => gradient_rotate(idx)"
                        @gradient-add-stop="(p, c) => gradient_add_stop(idx, p, c)"
                        @gradient-type="(type) => togger_gradient_type(idx, type)"
                        @gradient-color-change="(c, index) => gradient_stop_color_change(idx, c, index)"
                        @gradient-stop-delete="(index) => gradient_stop_delete(idx, index)"
                        @gradient-stop-position="(position, index) => gradient_stop_position(idx, position, index)">
                    </ColorPicker>
                    <input ref="colorFill" class="colorFill"
                        :value="toHex(f.fill.color.red, f.fill.color.green, f.fill.color.blue)" :spellcheck="false"
                        @change="(e) => onColorChange(idx, e)" @focus="selectColor(idx)" @input="colorInput(idx)"
                        :class="{ 'check': f.fill.isEnabled, 'nocheck': !f.fill.isEnabled }" />
                    <input ref="alphaFill" class="alphaFill" :value="filterAlpha(f.fill.color.alpha * 100) + '%'"
                        @change="(e) => onAlphaChange(idx, e)" @focus="selectAlpha(idx)" @input="alphaInput(idx)"
                        :class="{ 'check': f.fill.isEnabled, 'nocheck': !f.fill.isEnabled }" />
                </div>
                <div style="width: 4px;"></div>
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
    padding: 12px 8px 18px 8px;
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

        >svg {
            width: 16px;
            height: 16px;
        }

        transition: .2s;
    }

    .add:hover {
        background-color: #F5F5F5;
        ;
    }

    .fills-container {
        .fill {
            height: 30px;
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-top: 4px;

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
            }

            .color {
                background-color: var(--input-background);
                height: 32px;
                width: 172px;
                padding: 9px 8px;
                margin-left: 5px;
                border-radius: var(--default-radius);
                box-sizing: border-box;
                display: flex;
                align-items: center;

                .colorFill {
                    outline: none;
                    border: none;
                    background-color: transparent;
                    width: 92px;
                    height: 14px;
                    margin-left: 8px;
                    flex: 1;
                    font-size: 12px;
                }

                .alphaFill {
                    outline: none;
                    border: none;
                    background-color: transparent;
                    width: 37px;
                    text-align: center;
                    font-size: 12px;
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

            .delete {
                flex: 0 0 28px;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 28px;
                height: 28px;
                border-radius: var(--default-radius);

                >svg {
                    width: 16px;
                    height: 16px;
                }

                transition: .2s;
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