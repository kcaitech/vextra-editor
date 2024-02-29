<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Context } from '@/context';
import { BasicArray, GroupShapeView, Shape, ShapeType, ShapeView, TableCell, TableCellView, TableShape, TableView, adapt2Shape } from '@kcdesign/data';
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
    get_actions_border_delete
} from '@/utils/shape_style';
import { v4 } from 'uuid';
import Apex from './Apex.vue';
import { TableSelection } from '@/context/tableselection';
import { Selection } from "@/context/selection";
import { flattenShapes } from '@/utils/cutout';
import { hidden_selection } from '@/utils/content';
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
const len = computed<number>(() => props.shapes.length);
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
    if ((args.includes('style') || args.includes('variables'))) [
        updateData()
    ]
}

function updateData() {
    borders.length = 0;
    mixed.value = false;
    mixed_cell.value = false;
    const selecteds = getShapesForStyle(props.context.selection.selectedShapes);
    const shape = selecteds[0];
    if (selecteds.length === 1 && (shape.type !== ShapeType.Group || (shape as GroupShapeView).data.isBoolOpShape)) {
        const table = props.context.tableSelection;
        const is_edting = table.editingCell;
        if (shape.type === ShapeType.Table && (table.tableRowStart > -1 || is_edting)) {
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
            const _borders = shape.getBorders();
            for (let i = 0, l = _borders.length; i < l; i++) {
                const border = _borders[i];
                const b: BorderItem = {
                    id: i,
                    border: border
                }
                borders.unshift(b);
            }
        }
    } else if (selecteds.length > 1) {
        const _bs = get_borders(selecteds);
        if (_bs === 'mixed') {
            mixed.value = true;
        } else {
            borders.push(..._bs.reverse());
        }
    } else if (selecteds.length === 1 && shape.type === ShapeType.Group && !(shape as GroupShapeView).data.isBoolOpShape) {
        const childs = (shape).childs;
        const shapes = flattenShapes(childs).filter(s => s.type !== ShapeType.Group);
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
    if (len.value === 1 && (props.shapes[0].type !== ShapeType.Group || (props.shapes[0] as GroupShapeView).data.isBoolOpShape)) {
        const shape = props.shapes[0] as TableView;
        if (shape.type === ShapeType.Table) {
            const table = props.context.tableSelection;
            const e = props.context.editor4Table(shape);
            const is_edting = table.editingCell;
            if (table.tableRowStart > -1 || table.tableColStart > -1 || is_edting) {
                let range
                if (is_edting) {
                    range = {
                        rowStart: is_edting.index.row,
                        rowEnd: is_edting.index.row,
                        colStart: is_edting.index.col,
                        colEnd: is_edting.index.col
                    };
                } else {
                    range = {
                        rowStart: table.tableRowStart,
                        rowEnd: table.tableRowEnd,
                        colStart: table.tableColStart,
                        colEnd: table.tableColEnd
                    };
                }
                if (mixed_cell.value) {
                    e.addBorder4Multi(border, range)
                } else {
                    e.addBorder(border, range)
                }
            } else {
                editor.value.addBorder(border);
            }
        } else {
            editor.value.addBorder(border);
        }
    } else if (len.value > 1) {
        if (mixed.value) {
            const shapes = getShapesForStyle(props.shapes);
            const actions = get_actions_border_unify(shapes);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesBordersUnify(actions);
            }
        } else {
            const shapes = getShapesForStyle(props.shapes);
            const actions = get_actions_add_boder(shapes, border);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesAddBorder(actions);
            }
        }
    } else if (len.value === 1 && props.shapes[0].type === ShapeType.Group && !(props.shapes[0] as GroupShapeView).data.isBoolOpShape) {
        const childs = (props.shapes[0]).childs;
        const shapes = flattenShapes(childs).filter(s => s.type !== ShapeType.Group);
        if (mixed.value) {
            const actions = get_actions_border_unify(shapes);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesBordersUnify(actions);
            }
        } else {
            const actions = get_actions_add_boder(shapes, border);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesAddBorder(actions);
            }
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
    const shape = props.shapes[0];
    if (len.value === 1 && (shape.type !== ShapeType.Group || (shape as GroupShapeView).data.isBoolOpShape)) {
        const table = props.context.tableSelection;
        if (shape.type === ShapeType.Table) {
            const e = props.context.editor4Table(shape as TableView);
            const is_edting = table.editingCell;
            if (table.tableRowStart > -1 || table.tableColStart > -1 || is_edting) {
                let range
                if (is_edting) {
                    range = {
                        rowStart: is_edting.index.row,
                        rowEnd: is_edting.index.row,
                        colStart: is_edting.index.col,
                        colEnd: is_edting.index.col
                    };
                } else {
                    range = {
                        rowStart: table.tableRowStart,
                        rowEnd: table.tableRowEnd,
                        colStart: table.tableColStart,
                        colEnd: table.tableColEnd
                    };
                }
                e.deleteBorder(_idx, range)
            } else {
                editor.value.deleteBorder(_idx);
            }
        } else {
            editor.value.deleteBorder(_idx);
        }
    } else if (len.value > 1) {
        const shapes = getShapesForStyle(props.shapes);
        const actions = get_actions_border_delete(shapes, _idx);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.shapesDeleteBorder(actions);
        }
    } else if (len.value === 1 && shape.type === ShapeType.Group && !(shape as GroupShapeView).data.isBoolOpShape) {
        const childs = (shape).childs;
        const shapes = flattenShapes(childs).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_border_delete(shapes, _idx);
        const page = props.context.selection.selectedPage;
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
    const shape = props.shapes[0];
    if (len.value === 1 && (shape.type !== ShapeType.Group || (shape as GroupShapeView).data.isBoolOpShape)) {
        if (shape.type === ShapeType.Table) {
            const table = props.context.tableSelection;
            const e = props.context.editor4Table(shape as TableView);
            const is_edting = table.editingCell;
            if (table.tableRowStart > -1 || table.tableColStart > -1 || is_edting) {
                let range
                if (is_edting) {
                    range = {
                        rowStart: is_edting.index.row,
                        rowEnd: is_edting.index.row,
                        colStart: is_edting.index.col,
                        colEnd: is_edting.index.col
                    };
                } else {
                    range = {
                        rowStart: table.tableRowStart,
                        rowEnd: table.tableRowEnd,
                        colStart: table.tableColStart,
                        colEnd: table.tableColEnd
                    };
                }
                e.setBorderEnable(_idx, isEnabled, range)
            } else {
                editor.value.setBorderEnable(_idx, isEnabled);
            }
        } else {
            editor.value.setBorderEnable(_idx, isEnabled);
        }
    } else if (len.value > 1) {
        const shapes = getShapesForStyle(props.shapes);
        const actions = get_actions_border_enabled(shapes, _idx, isEnabled);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderEnabled(actions);
        }
    } else if (len.value === 1 && shape.type === ShapeType.Group && !(shape as GroupShapeView).data.isBoolOpShape) {
        const childs = (shape).childs;
        const shapes = flattenShapes(childs).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_border_enabled(shapes, _idx, isEnabled);
        const page = props.context.selection.selectedPage;
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
    props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
    let value = colorValue.value;
    if (value.slice(0, 1) !== '#') {
        value = "#" + value
    }
    if (value.length === 4) value = `#${value.slice(1).split('').map(i => `${i}${i}`).join('')}`;
    if (value.length === 2) value = `#${value.slice(1).split('').map(i => `${i}${i}${i}${i}${i}${i}`).join('')}`;
    const hex = value.match(Reg_HEX);
    const shape = shapes.value[0] as ShapeView;
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
    const _idx = borders.length - idx - 1;
    const editor = props.context.editor4Shape((shape))
    if (shapes.value.length === 1 && (shape.type !== ShapeType.Group || (shape as GroupShapeView).data.isBoolOpShape)) {
        if (shape.type === ShapeType.Table) {
            const e = props.context.editor4Table(shape as TableView);
            const is_edting = tableSelect.value.editingCell;
            if (tableSelect.value.tableRowStart > -1 || tableSelect.value.tableColStart > -1 || is_edting) {
                let range
                if (is_edting) {
                    range = {
                        rowStart: is_edting.index.row,
                        rowEnd: is_edting.index.row,
                        colStart: is_edting.index.col,
                        colEnd: is_edting.index.col
                    };
                } else {
                    range = {
                        rowStart: tableSelect.value.tableRowStart,
                        rowEnd: tableSelect.value.tableRowEnd,
                        colStart: tableSelect.value.tableColStart,
                        colEnd: tableSelect.value.tableColEnd
                    };
                }
                const tablecells = (shape as TableView).getVisibleCells(tableSelect.value.tableRowStart,
                    tableSelect.value.tableRowEnd,
                    tableSelect.value.tableColStart,
                    tableSelect.value.tableColEnd);
                if (tablecells.length > 0 && tablecells[0].cell) {
                    e.setBorderColor(_idx, color, range)
                }
            } else {
                editor.setBorderColor(_idx, color);
            }
        } else {
            editor.setBorderColor(_idx, color);
        }
    } else if (shapes.value.length > 1) {
        const actions = get_actions_border_color(shapes.value as ShapeView[], _idx, color);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderColor(actions);
        }
    } else if (shapes.value.length === 1 && shape.type === ShapeType.Group && !(shape as GroupShapeView).data.isBoolOpShape) {
        const childs = shape.childs as ShapeView[];
        const shapes = flattenShapes(childs).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_border_color(shapes, _idx, color);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderColor(actions);
        }
    }
    hidden_selection(props.context);
}

function onAlphaChange(e: Event, idx: number) {
    props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
    let alpha: any = alphaValue.value;
    const shape = shapes.value[0] as ShapeView;
    if (alphaBorder.value) {
        if (alpha.slice(-1) === '%') {
            alpha = Number(alpha?.slice(0, -1))
            if (isNaN(alpha) || alpha < 0) {
                message('danger', t('system.illegal_input'));
                return alphaBorder.value[idx].value = (borders[idx].border.color.alpha * 100) + '%';
            }
            if (alpha > 100) {
                alpha = 100;
            }
            alpha = alpha.toFixed(2) / 100
            const shape = shapes.value[0] as ShapeView;
            const border = borders[idx].border;
            const { red, green, blue } = border.color
            const color = new Color(alpha, red, green, blue);
            const _idx = borders.length - idx - 1;
            const editor = props.context.editor4Shape((shape))
            if (shapes.value.length === 1 && (shape.type !== ShapeType.Group || (shape as GroupShapeView).data.isBoolOpShape)) {
                if (shape.type === ShapeType.Table) {
                    const e = props.context.editor4Table(shape as TableView);
                    const is_edting = tableSelect.value.editingCell;
                    if (tableSelect.value.tableRowStart > -1 || tableSelect.value.tableColStart > -1 || is_edting) {
                        let range
                        if (is_edting) {
                            range = {
                                rowStart: is_edting.index.row,
                                rowEnd: is_edting.index.row,
                                colStart: is_edting.index.col,
                                colEnd: is_edting.index.col
                            };
                        } else {
                            range = {
                                rowStart: tableSelect.value.tableRowStart,
                                rowEnd: tableSelect.value.tableRowEnd,
                                colStart: tableSelect.value.tableColStart,
                                colEnd: tableSelect.value.tableColEnd
                            };
                        }
                        const tablecells = (shape as TableView).getVisibleCells(tableSelect.value.tableRowStart,
                            tableSelect.value.tableRowEnd,
                            tableSelect.value.tableColStart,
                            tableSelect.value.tableColEnd);
                        if (tablecells.length > 0 && tablecells[0].cell) {
                            e.setBorderColor(_idx, color, range)
                        }
                    } else {
                        editor.setBorderColor(_idx, color);
                    }
                } else {
                    editor.setBorderColor(_idx, color);
                }
            } else if (shapes.value.length > 1) {
                const actions = get_actions_border_color(props.shapes, _idx, color);
                const page = props.context.selection.selectedPage;
                if (page) {
                    const editor = props.context.editor4Page(page);
                    editor.setShapesBorderColor(actions);
                }
            } else if (shapes.value.length === 1 && shape.type === ShapeType.Group && !(shape as GroupShapeView).data.isBoolOpShape) {
                const childs = (shape).childs as ShapeView[];
                const shapes = flattenShapes(childs).filter(s => s.type !== ShapeType.Group);
                const actions = get_actions_border_color(shapes, _idx, color);
                const page = props.context.selection.selectedPage;
                if (page) {
                    const editor = props.context.editor4Page(page);
                    editor.setShapesBorderColor(actions);
                }
            }
        } else {
            if (!isNaN(Number(alpha)) && alpha >= 0) {
                if (alpha > 100) {
                    alpha = 100
                }
                alpha = Number((Number(alpha)).toFixed(2)) / 100
                const shape = shapes.value[0] as ShapeView;
                const border = borders[idx].border;
                const { red, green, blue } = border.color
                const color = new Color(alpha, red, green, blue);
                const _idx = borders.length - idx - 1;
                const editor = props.context.editor4Shape((shape))
                if (shapes.value.length === 1 && (shape.type !== ShapeType.Group || (shape as GroupShapeView).data.isBoolOpShape)) {
                    if (shape.type === ShapeType.Table) {
                        const e = props.context.editor4Table(shape as TableView);
                        const is_edting = tableSelect.value.editingCell;
                        if (tableSelect.value.tableRowStart > -1 || tableSelect.value.tableColStart > -1 || is_edting) {
                            let range
                            if (is_edting) {
                                range = {
                                    rowStart: is_edting.index.row,
                                    rowEnd: is_edting.index.row,
                                    colStart: is_edting.index.col,
                                    colEnd: is_edting.index.col
                                };
                            } else {
                                range = {
                                    rowStart: tableSelect.value.tableRowStart,
                                    rowEnd: tableSelect.value.tableRowEnd,
                                    colStart: tableSelect.value.tableColStart,
                                    colEnd: tableSelect.value.tableColEnd
                                };
                            }
                            const tablecells = (shape as TableView).getVisibleCells(tableSelect.value.tableRowStart,
                                tableSelect.value.tableRowEnd,
                                tableSelect.value.tableColStart,
                                tableSelect.value.tableColEnd);
                            if (tablecells.length > 0 && tablecells[0].cell) {
                                e.setBorderColor(_idx, color, range)
                            }
                        } else {
                            editor.setBorderColor(_idx, color);
                        }
                    } else {
                        editor.setBorderColor(_idx, color);
                    }
                } else if (shapes.value.length > 1) {
                    const actions = get_actions_border_color(shapes.value as ShapeView[], _idx, color);
                    const page = props.context.selection.selectedPage;
                    if (page) {
                        const editor = props.context.editor4Page(page);
                        editor.setShapesBorderColor(actions);
                    }
                } else if (shapes.value.length === 1 && shape.type === ShapeType.Group && !(shape as GroupShapeView).data.isBoolOpShape) {
                    const childs = (shape).childs as ShapeView[];
                    const shapes = flattenShapes(childs).filter(s => s.type !== ShapeType.Group);
                    const actions = get_actions_border_color(shapes, _idx, color);
                    const page = props.context.selection.selectedPage;
                    if (page) {
                        const editor = props.context.editor4Page(page);
                        editor.setShapesBorderColor(actions);
                    }
                }
            } else {
                message('danger', t('system.illegal_input'));
                return alphaBorder.value[idx].value = (borders[idx].border.color.alpha * 100) + '%'
            }
        }
    }
    hidden_selection(props.context);
}

function getColorFromPicker(color: Color, idx: number) {
    const _idx = borders.length - idx - 1;
    const shape = props.shapes[0];
    if (len.value === 1 && (shape.type !== ShapeType.Group || (shape as GroupShapeView).data.isBoolOpShape)) {
        if (shape.type === ShapeType.Table) {
            const table = props.context.tableSelection;
            const e = props.context.editor4Table(shape as TableView);
            const is_edting = table.editingCell;
            if (table.tableRowStart > -1 || table.tableColStart > -1 || is_edting) {
                let range
                if (is_edting) {
                    range = {
                        rowStart: is_edting.index.row,
                        rowEnd: is_edting.index.row,
                        colStart: is_edting.index.col,
                        colEnd: is_edting.index.col
                    };
                } else {
                    range = {
                        rowStart: table.tableRowStart,
                        rowEnd: table.tableRowEnd,
                        colStart: table.tableColStart,
                        colEnd: table.tableColEnd
                    };
                }
                e.setBorderColor(_idx, color, range)
            } else {
                editor.value.setBorderColor(_idx, color);
            }
        } else {
            editor.value.setBorderColor(_idx, color);
        }
    } else if (len.value > 1) {
        const shapes = getShapesForStyle(props.shapes);
        const actions = get_actions_border_color(shapes, _idx, color);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderColor(actions);
        }
    } else if (len.value === 1 && shape.type === ShapeType.Group && !(shape as GroupShapeView).data.isBoolOpShape) {
        const childs = (shape).childs;
        const shapes = flattenShapes(childs).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_border_color(shapes, _idx, color);
        const page = props.context.selection.selectedPage;
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
const selectAlpha = (i: number) => {
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
        alphaBorder.value[i].select();
    }
}
const alphaInput = (i: number) => {
    if (alphaBorder.value) {
        const value = alphaBorder.value[i].value;
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
                        @change="(c: Color) => getColorFromPicker(c, idx)" />
                    <input ref="colorBorder" class="colorBorder" :spellcheck="false"
                        :value="(toHex(b.border.color)).slice(1)" @change="e => onColorChange(e, idx)"
                        @focus="selectColor(idx)" @input="colorInput(idx)"
                        :class="{ 'check': b.border.isEnabled, 'nocheck': !b.border.isEnabled }" />
                    <input ref="alphaBorder" class="alphaBorder" style="text-align: center;"
                        :value="filterAlpha(b.border.color.alpha * 100) + '%'" @change="e => onAlphaChange(e, idx)"
                        @focus="selectAlpha(idx)" @input="alphaInput(idx)"
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
                flex: 0 1 144px;
                background-color: var(--input-background);
                height: 32px;
                width: 144px;
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
                    width: 92px;
                    height: 14px;
                    margin-left: 8px;
                    flex: 1;
                    font-size: 12px;
                }

                .alphaBorder {
                    outline: none;
                    border: none;
                    background-color: transparent;
                    width: 37px;
                    //margin-left: 20%;
                    margin-left: -28px;
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