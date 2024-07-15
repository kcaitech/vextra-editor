<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Context } from '@/context';
import { BasicArray, AsyncBorderThickness, GradientType, GroupShapeView, Shape, ShapeType, ShapeView, Stop, TableCell, TableCellView, TableShape, TableView, adapt2Shape, CornerType, BorderSideSetting, SideType, ImageScaleMode, PathShape, PathShapeView } from '@kcdesign/data';
import TypeHeader from '../TypeHeader.vue';
import BorderDetail from './BorderDetail.vue';
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { useI18n } from 'vue-i18n';
import { Color, Border, BorderStyle } from '@kcdesign/data';
import { FillType, BorderPosition } from '@kcdesign/data';
import { Reg_HEX } from "@/utils/RegExp";
import { message } from "@/utils/message";
import { toHex } from "@/utils/color";
import {
    get_borders,
    get_actions_add_boder,
    get_actions_border_color,
    get_actions_border_unify,
    get_actions_border_enabled,
    get_actions_border_delete,
    get_aciton_gradient,
    get_aciton_gradient_stop,
    get_actions_filltype,
    get_actions_border,
    get_borders_side,
    get_actions_image_scale_mode
} from '@/utils/shape_style';
import { v4 } from 'uuid';
import Apex from './Apex.vue';
import { TableSelection } from '@/context/tableselection';
import { Selection } from "@/context/selection";
import { flattenShapes } from '@/utils/cutout';
import { get_table_range, is_editing, hidden_selection } from '@/utils/content';
import { getShapesForStyle } from '@/utils/style';
import { genOptions } from '@/utils/common';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import {
    get_actions_border_thickness,
    get_actions_border_position,
    get_actions_border_style
} from '@/utils/shape_style'
import { getSideThickness } from "./index"

interface BorderItem {
    id: number
    border: Border
}

interface Props {
    context: Context
    shapes: ShapeView[]
    cellsTrigger: any[]
    trigger: any[]
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
const shapes = ref<ShapeView[]>();
const apex_view = ref<number>(0);
let table: TableShape;
let borderthickness_editor: AsyncBorderThickness | undefined = undefined;
let bordercellthickness_editor: AsyncBorderThickness | undefined = undefined;
const reflush_side = ref(0);
const reflush_apex = ref(0);

const position = ref<SelectItem>({ value: 0, content: t('attr.center') });
const positonOptionsSource: SelectSource[] = genOptions([
    [BorderPosition.Outer, t(`attr.${BorderPosition.Outer}`)],
    [BorderPosition.Center, t(`attr.${BorderPosition.Center}`)],
    [BorderPosition.Inner, t(`attr.${BorderPosition.Inner}`)],
]);
const isActived = ref(-1)
const borderThickness = ref<HTMLInputElement[] | undefined>();

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
    if ((args.includes('layout') || args.includes('borders'))) {
        updateData();
    }
    if (args.includes('pathsegs') && args.includes('points')) {
        layout();
        reflush_apex.value++;
    }
}

function updateData() {
    mixed.value = false;
    mixed_cell.value = false;
    const selecteds = props.context.selection.selectedShapes;
    if (selecteds.length < 1) return;
    borders.length = 0;
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
        const shapes = flattenShapes(selecteds).filter(s => s.type !== ShapeType.Group);
        const _bs = get_borders(shapes);
        if (_bs === 'mixed') {
            mixed.value = true;
        } else {
            borders.push(..._bs.reverse());
        }
    }
}

function addBorder() {
    const color = new Color(1, 0, 0, 0);
    const borderStyle = new BorderStyle(0, 0);
    const side = new BorderSideSetting(SideType.Normal, 1, 1, 1, 1);
    const border = new Border(new BasicArray(), v4(), true, FillType.SolidColor, color, BorderPosition.Inner, 1, borderStyle, CornerType.Miter, side);
    const selected = props.context.selection.selectedShapes;
    const s = selected[0];
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const table = props.context.tableSelection;
    if (selected.length === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        if (mixed_cell.value) {
            e.addBorder4Cell(border, range, true)
        } else {
            e.addBorder4Cell(border, range, false)
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
    const selected = props.context.selection.selectedShapes;
    const s = selected[0];
    const page = props.context.selection.selectedPage;
    const table = props.context.tableSelection;
    if (selected.length === 1 && s.type === ShapeType.Table && is_editing(table)) {
        const table = props.context.tableSelection;
        const e = props.context.editor4Table(s as TableView);
        const range = get_table_range(table);
        e.deleteBorder4Cell(_idx, range)
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
        e.setBorderEnable4Cell(_idx, isEnabled, range)
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
    hidden_selection(props.context);
}

function onAlphaChange(b: Border, idx: number) {
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
    const selected = shapes.value || props.context.selection.selectedShapes;
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
            e.setBorderColor4Cell(_idx, color, range)
        }
    } else {
        const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
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
        e.setBorderColor4Cell(_idx, color, range)
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

const selectColor = (e: FocusEvent) => {
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
    if (colorBorder.value) {
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
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
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
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
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
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
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
function togger_gradient_type(idx: number, type: GradientType, fillType: FillType) {
    const _idx = borders.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    if (fillType !== FillType.Gradient) {
        toggle_fill_type(idx, fillType);
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
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
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
function gradient_stop_delete(idx: number, index: any) {
    const _idx = borders.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
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
        e.setFillType4Cell(_idx, fillType, range);
    } else {
        const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_filltype(shapes, _idx, fillType);
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderType(actions);
        }
    }
}

function layout() {
    show_apex.value = false;
    const shapes = flattenShapes(props.shapes).filter(s => s.type !== ShapeType.Group);
    
    show_apex.value = line_end_point(shapes);
}

const line_end_point = (shapes: ShapeView[]) => {
    const segment = shapes.every(v => ((v instanceof PathShapeView) && ((v.segments.length === 1 && !v.segments[0].isClosed) || v.segments.length > 1)));
    const endpoint = shapes.every(v => (v.type === ShapeType.Line || v.type === ShapeType.Contact || segment));
    return endpoint;
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

function selection_watcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE) update_by_shapes();
}

const isGradient = () => {
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
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
const stop2 = watch(() => props.cellsTrigger, v => { // 监听选区单元格变化
    if (v.length > 0 && (v.includes('borders'))) updateData();
})
const stop3 = watch(() => props.trigger, v => { // 监听选区图层变化
    if (v.length > 0 && (v.includes('layout'))) updateData();
});
onMounted(() => {
    update_by_shapes();
    props.context.tableSelection.watch(table_selection_watcher);
    props.context.selection.watch(selection_watcher);
})
onUnmounted(() => {
    stop();
    stop2();
    stop3();
    props.context.tableSelection.unwatch(table_selection_watcher);
    props.context.selection.unwatch(selection_watcher);
    watchedShapes.forEach(v => {
        v.unwatch(watcher)
    });
})

function positionSelect(selected: SelectItem, id: number | undefined) {
    position.value = selected;
    const selecteds = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page || selecteds.length < 1) return;
    const shapes = getShapesForStyle(selecteds);
    const actions = get_actions_border_position(shapes, id!, selected.value as BorderPosition);
    if (actions && actions.length) {
        const editor = props.context.editor4Page(page);
        editor.setShapesBorderPosition(actions);
    }
}

const testEl = ref<HTMLElement>()
const testidx = ref<number>(0)
const pointX = ref<number>()
const pointY = ref<number>()
const showpoint = ref<boolean>(false)
const rotate = ref<boolean>()

async function onMouseDown(e: MouseEvent, index: number) {
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage;
    const table = props.context.tableSelection;
    pointX.value = e.clientX
    pointY.value = e.clientY
    testEl.value = borderThickness.value![index] as HTMLElement
    if (borderThickness.value && isNaN(Number(borderThickness.value[index].value))) return;
    if (testEl.value)
        testidx.value = index
    const el = e.target as HTMLElement
    if (!document.pointerLockElement) {
        await el.requestPointerLock({
            unadjustedMovement: true,
        });
    }
    e.stopPropagation()
    if (shapes.length === 1 && shapes[0].type === ShapeType.Table && is_editing(table)) {
        const table = props.context.tableSelection;
        const range = get_table_range(table);
        bordercellthickness_editor = props.context.editor4Table(shapes[0] as TableView).asyncBorderThickness4Cell(range);
        // bordercellthickness_editor.execute(Number(borders[index].border.thickness), borders.length - index - 1)
    } else {
        borderthickness_editor = props.context.editor.controller().asyncBorderThickness(shapes, page!)
        // borderthickness_editor.execute(Number(borders[index].border.thickness), borders.length - index - 1)
    }
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener("mousemove", onMouseMove, false);
    // document.addEventListener("pointerlockchange", lockChangeAlert, false);
    document.addEventListener("pointerlockchange", pointerLockChange, false);
    showpoint.value = true
}

const pointerLockChange = () => {
    if (!document.pointerLockElement) {
        onMouseUp();
    }
}

function lockChangeAlert() {
    if (document.pointerLockElement) {
        showpoint.value = true
        document.addEventListener("mousemove", onMouseMove, false);
    } else {
        showpoint.value = false
        document.removeEventListener("mousemove", onMouseMove, false);
    }
}

const selectBorderThicknes = (e: FocusEvent, index: number) => {
    isActived.value = index;
}


function updatePosition(movementX: number, movementY: number, isRotating: boolean) {
    if (pointX.value === undefined || pointY.value === undefined) return;
    const clientHeight = document.documentElement.clientHeight
    const clientWidth = document.documentElement.clientWidth
    rotate.value = isRotating
    pointX.value += movementX
    pointY.value += movementY
    pointX.value = pointX.value < 0 ? clientWidth : (pointX.value > clientWidth ? 0 : pointX.value)
    pointY.value = pointY.value < 0 ? clientHeight : (pointY.value > clientHeight ? 0 : pointY.value)
}

function onMouseMove(e: MouseEvent) {
    const isRotating = e.movementX > 0;
    updatePosition(e.movementX, e.movementY, isRotating)
    const index = testidx.value
    const id = borders.length - index - 1
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage;
    if (!page || shapes.length < 1) return;
    const shape = shapes[0];
    const table = props.context.tableSelection;
    if (borderThickness.value?.length) {
        let thickness = (getSideThickness(borders[index].border.sideSetting) || 0) + e.movementX;
        if (thickness > 300) thickness = 300;
        if (shapes.length === 1 && shape.type === ShapeType.Table && is_editing(table) && bordercellthickness_editor) {
            bordercellthickness_editor.execute(thickness < 0 ? 0 : thickness, id)
        } else {
            const actions = get_actions_border_thickness(shapes, id, thickness < 0 ? 0 : thickness);
            if (actions && actions.length && borderthickness_editor) {
                borderthickness_editor.execute(thickness < 0 ? 0 : thickness, id);
            }
        }
        reflush_side.value++;
    }
}

function onMouseUp() {
    document.exitPointerLock()
    showpoint.value = false

    document.removeEventListener("mousemove", onMouseMove, false);
    document.removeEventListener('mouseup', onMouseUp);
    if (borderthickness_editor) {
        borderthickness_editor.close();
        borderthickness_editor = undefined;
    }
    if (bordercellthickness_editor) {
        bordercellthickness_editor.close();
        bordercellthickness_editor = undefined
    }
    document.removeEventListener("pointerlockchange", pointerLockChange, false);
}

function setThickness(e: Event, id: number) {
    let thickness = Number((e.target as HTMLInputElement).value);
    (e.target as HTMLInputElement).blur();
    if (isNaN(thickness)) return;
    const selecteds = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page || selecteds.length < 1) return;
    if (thickness > 300) thickness = 300;
    const shape = selecteds[0];
    const table = props.context.tableSelection;
    if (selecteds.length === 1 && shape.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(shape as TableView);
        const range = get_table_range(table);
        e.setBorderThickness4Cell(id, thickness < 0 ? 0 : thickness, range)
    } else {
        const shapes = getShapesForStyle(selecteds);
        const t = thickness < 0 ? 0 : thickness;
        const actions = get_actions_border(shapes, id, t);
        if (actions && actions.length) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderThickness(actions);
        }
    }
    reflush_side.value++;
}

const thickness_value = (index: number, idx: number) => {
    if (typeof getSideThickness(borders[idx].border.sideSetting) === 'boolean') {
        return t('attr.mixed')
    } else {
        let result = [];
        const selected = props.context.selection.selectedShapes;
        const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            const borders = shape.getBorders();
            if (!borders.length) return 0;
            result.push(getSideThickness(borders[index].sideSetting));
        }
        const unique = new Set(result);
        if (unique.size === 1 && !unique.has(false)) {
            return Number(result[0]);
        } else {
            return t('attr.mixed')
        }
    }
}
const is_stroke_select = ref(false);
const strokeBlur = () => {
    isActived.value = -1;
    is_stroke_select.value = false;
}
const strokeClick = (e: Event) => {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_stroke_select.value) return;
    el.select();
    is_stroke_select.value = true;
}

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
        <div class="borders-container" v-else-if="!mixed && !mixed_cell && borders.length">
            <div class="border" v-for="(b, idx) in borders" :key="b.id">
                <div class="top">
                    <div :class="b.border.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible(idx)">
                        <svg-icon v-if="b.border.isEnabled" icon-class="select"></svg-icon>
                    </div>
                    <div class="color">
                        <ColorPicker :color="b.border.color" :context="props.context" :auto_to_right_line="true"
                            :locat="{ index: borders.length - idx - 1, type: 'borders' }" :op="b.border.isEnabled"
                            @change="(c: Color) => getColorFromPicker(c, idx)"
                            @gradient-reverse="() => gradient_reverse(idx)"
                            :gradient="isGradient() ? b.border.gradient : undefined" :fillType="b.border.fillType"
                            @gradient-rotate="() => gradient_rotate(idx)"
                            @gradient-add-stop="(p, c, id) => gradient_add_stop(idx, p, c, id)"
                            @gradient-type="(type, fill_type) => togger_gradient_type(idx, type, fill_type)"
                            @gradient-color-change="(c, index) => gradient_stop_color_change(idx, c, index)"
                            @gradient-stop-delete="(index) => gradient_stop_delete(idx, index)" />
                        <input ref="colorBorder" class="colorBorder" :class="{ showop: !b.border.isEnabled }"
                            :spellcheck="false" v-if="b.border.fillType !== FillType.Gradient || !isGradient()"
                            :value="(toHex(b.border.color)).slice(1)" @change="e => onColorChange(e, idx)"
                            @click="colorClick" @blur="is_color_select = false" @focus="selectColor($event)"
                            @input="colorInput($event)" />
                        <span class="colorBorder" :class="{ showop: !b.border.isEnabled }" style="line-height: 14px;"
                            v-else-if="b.border.fillType === FillType.Gradient && b.border.gradient && isGradient()">{{
            t(`color.${b.border.gradient.gradientType}`)
        }}</span>
                        <input ref="alphaBorder" :class="{ showop: !b.border.isEnabled }" class="alphaBorder"
                            style="text-align: center;" :value="filterAlpha(b.border) + '%'" @click="alphaClick"
                            @blur="is_alpha_select = false" @change="e => onAlphaChange(b.border, idx)"
                            @focus="selectAlpha" @input="alphaInput" />
                    </div>
                    <!-- <BorderDetail v-if="show_apex" :context="props.context" :shapes="props.shapes" :border="b.border"
                        :index="borders.length - idx - 1">
                    </BorderDetail> -->
                    <!--                <div class="extra-action">-->
                    <div class="delete" @click="deleteBorder(idx)">
                        <svg-icon icon-class="delete"></svg-icon>
                    </div>
                </div>
                <div class="bottom">
                    <!-- 边框位置 -->
                    <div style=" flex: calc(50% - 20px);"
                        :style="{ pointerEvents: [ShapeType.Table, ShapeType.Line].includes(props.shapes[0].type) ? 'none' : 'auto' }">
                        <Select class="select" :context="props.context" :shapes="props.shapes"
                            :source="positonOptionsSource"
                            :selected="positonOptionsSource.find(i => i.data.value === b.border.position)?.data"
                            @select="positionSelect" :index="borders.length - idx - 1"></Select>
                    </div>
                    <div class="thickness-container" style=" flex: calc(50% - 20px);"
                        :class="{ actived: isActived === idx }">
                        <svg-icon icon-class="thickness"
                            :class="{ cursor_pointer: typeof thickness_value(borders.length - idx - 1, idx) === 'string' }"
                            @mousedown.stop="onMouseDown($event, idx)"></svg-icon>
                        <input ref="borderThickness" type="text" :value="thickness_value(borders.length - idx - 1, idx)"
                            @change="setThickness($event, borders.length - idx - 1)" @blur="strokeBlur"
                            @click="strokeClick" @focus="selectBorderThicknes($event, idx)">
                    </div>
                    <BorderDetail :context="props.context" :shapes="props.shapes" :border="b.border"
                        :index="borders.length - idx - 1" :reflush_side="reflush_side">
                    </BorderDetail>
                </div>

            </div>
        </div>
        <Apex v-if="show_apex && !!borders.length" :context="props.context" :shapes="props.shapes" :view="apex_view"
            :trigger="props.trigger" :reflush_apex="reflush_apex">
        </Apex>
    </div>
    <teleport to="body">
        <div v-if="showpoint" class="point" :style="{ top: (pointY! - 10.5) + 'px', left: (pointX! - 10) + 'px' }">
        </div>
    </teleport>
</template>

<style scoped lang="scss">
.showop {
    opacity: 0.3;
}

.bounce-enter-active {
    animation: bounce-in 0.25s;
}

.bounce-leave-active {
    animation: bounce-in 0.25s reverse;
}

@keyframes bounce-in {
    0% {
        transform: scale(0);
    }

    50% {
        transform: scale(1.25);
    }

    100% {
        transform: scale(1);
    }
}

.point {
    position: absolute;
    width: 24px;
    height: 24px;
    background-image: url("@/assets/cursor/scale.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 32px;
    z-index: 10000;
}

.actived {
    border-color: #1878F5 !important;
}

.border-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
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
        padding: 6px 0;

        .border {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 6px;

            &:nth-child(n+2) {
                margin-top: 16px;
            }

            .top {
                display: flex;
                align-items: center;

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
                        width: calc(100% - 53px);
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

            .bottom {
                width: calc(100% - 19px);
                display: flex;
                align-items: center;
                height: 32px;
                gap: 6px;
                margin-left: 19px;

                >.select {
                    height: 100%;
                    width: 100px;
                }

                .thickness-container {
                    box-sizing: border-box;
                    padding: 8px 12px;
                    background-color: var(--input-background);
                    height: 32px;
                    border-radius: var(--default-radius);
                    border: 1px solid transparent;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    overflow: hidden;

                    >svg {
                        cursor: -webkit-image-set(url("@/assets/cursor/scale.png") 1.5x) 14 14, auto !important;
                        flex: 0 0 16px;
                        height: 16px;
                    }

                    .cursor_pointer {
                        cursor: default !important;
                    }

                    >input {
                        outline: none;
                        border: none;
                        padding: 0;
                        background-color: transparent;
                    }

                    input::selection {
                        color: #FFFFFF;
                        background: #1878F5;
                    }

                    input::-moz-selection {
                        color: #FFFFFF;
                        background: #1878F5;
                    }

                }
            }
        }
    }
}
</style>