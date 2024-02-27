<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Context } from '@/context';
import { BasicArray, Color, Fill, FillType, Shape, ShapeType, ShapeView, TableCell, TableView } from "@kcdesign/data";
import { GroupShapeView } from "@kcdesign/data";
import { Reg_HEX } from "@/utils/RegExp";
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { message } from "@/utils/message";
import {
    get_actions_add_fill,
    get_actions_fill_color,
    get_actions_fill_delete,
    get_actions_fill_enabled,
    get_actions_fill_unify,
    get_fills
} from '@/utils/shape_style';
import { v4 } from 'uuid';
import { flattenShapes } from '@/utils/cutout';
import { hidden_selection } from '@/utils/content';
import { getShapesForStyle } from '@/utils/style';

interface FillItem {
    id: number,
    fill: Fill
}

interface Props {
    context: Context;
    shapes: ShapeView[];
    selectionChange: number;
    triggle: any[];
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
const shapes = ref<ShapeView[]>([]);

function toHex(r: number, g: number, b: number) {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return hex(r) + hex(g) + hex(b);
}

function updateData() {
    fills.length = 0;
    mixed.value = false;
    mixed_cell.value = false;
    const selecteds = getShapesForStyle(props.context.selection.selectedShapes);
    if (selecteds.length === 1 && (selecteds[0].type !== ShapeType.Group || (selecteds[0] as GroupShapeView).data.isBoolOpShape)) {
        const shape = selecteds[0];
        const table = props.context.tableSelection;
        const is_edting = table.editingCell;
        if (shape.type === ShapeType.Table && (table.tableRowStart > -1 || is_edting)) {
            let cells = [], might_is_mixed = false;
            if (table.tableRowStart > -1) {
                const _cs = table.getSelectedCells(true);
                for (let i = 0, len = _cs.length; i < len; i++) {
                    const c = _cs[i];
                    if (!c.cell) might_is_mixed = true;
                    else cells.push(c.cell);
                }
            } else if (is_edting) {
                cells.push(is_edting);
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
            const stylefills = shape.getFills();
            for (let i = 0, len = stylefills.length; i < len; i++) {
                const fill = stylefills[i];
                const f = { id: i, fill };
                fills.unshift(f);
            }
        }
    } else if (selecteds.length > 1) {
        const _fs = get_fills(selecteds);
        if (_fs === 'mixed') {
            mixed.value = true;
        } else {
            fills.push(..._fs.reverse());
        }
    } else if (selecteds.length === 1 && selecteds[0].type === ShapeType.Group && !(selecteds[0] as GroupShapeView).data.isBoolOpShape) {
        const childs = (selecteds[0]).childs;
        const shapes = flattenShapes(childs).filter(s => s.type !== ShapeType.Group);
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
    const s = props.context.selection.selectedShapes[0];
    if (len.value === 1 && (s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape)) {
        const e = props.context.editor4Shape(s);
        if (s.type === ShapeType.Table) {
            const table = props.context.tableSelection;
            const editor = props.context.editor4Table(s as TableView);
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
                    editor.addFill4Multi(fill, range);
                } else {
                    editor.addFill(fill, range);
                }
            } else {
                e.addFill(fill);
            }
        } else {
            e.addFill(fill);
        }
    } else if (len.value > 1) {
        if (mixed.value) {
            const shapes = getShapesForStyle(props.shapes);
            const actions = get_actions_fill_unify(shapes);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesFillsUnify(actions);
            }
        } else {
            const shapes = getShapesForStyle(props.shapes);
            const actions = get_actions_add_fill(shapes, fill);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesAddFill(actions);
            }
        }
    } else if (len.value === 1 && s.type === ShapeType.Group && !(s as GroupShapeView).data.isBoolOpShape) {
        const childs = (s).childs;
        const shapes = flattenShapes(childs).filter(s => s.type !== ShapeType.Group);
        if (mixed.value) {
            const actions = get_actions_fill_unify(shapes);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesFillsUnify(actions);
            }
        } else {
            const actions = get_actions_add_fill(shapes, fill);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesAddFill(actions);
            }
        }
    }
    hidden_selection(props.context);
}

function first() {
    if (fills.length === 0 && !mixed.value) addFill();
}

function deleteFill(idx: number) {
    const _idx = fills.length - idx - 1;
    const s = props.context.selection.selectedShapes[0];
    if (len.value === 1 && (s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape)) {
        if (s.type === ShapeType.Table) {
            const table = props.context.tableSelection;
            const e = props.context.editor4Table(s as TableView);
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
                e.deleteFill(_idx, range)
            } else {
                editor.value.deleteFill(_idx);
            }
        } else {
            editor.value.deleteFill(_idx);
        }
    } else if (len.value > 1) {
        const shapes = getShapesForStyle(props.shapes);
        const actions = get_actions_fill_delete(shapes, _idx);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.shapesDeleteFill(actions);
        }
    } else if (len.value === 1 && s.type === ShapeType.Group && !(s as GroupShapeView).data.isBoolOpShape) {
        const childs = (s).childs;
        const shapes = flattenShapes(childs).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_fill_delete(shapes, _idx);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.shapesDeleteFill(actions);
        }
    }
    hidden_selection(props.context);
}

function toggleVisible(idx: number) {
    const _idx = fills.length - idx - 1;
    const s = props.context.selection.selectedShapes[0];
    if (len.value === 1 && (s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape)) {
        if (s.type === ShapeType.Table) {
            const table = props.context.tableSelection;
            const e = props.context.editor4Table(s as TableView);
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
                e.setFillEnable(_idx, !fills[idx].fill.isEnabled, range)
            } else {
                editor.value.setFillEnable(_idx, !fills[idx].fill.isEnabled);
            }
        } else {
            editor.value.setFillEnable(_idx, !fills[idx].fill.isEnabled);
        }
    } else if (len.value > 1) {
        const fills = props.shapes[0].getFills();
        const value = !fills[_idx].isEnabled;
        const shapes = getShapesForStyle(props.shapes);
        const actions = get_actions_fill_enabled(shapes, _idx, value);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillEnabled(actions);
        }
    } else if (len.value === 1 && s.type === ShapeType.Group && !(s as GroupShapeView).data.isBoolOpShape) {
        const childs = (s).childs;
        const shapes = flattenShapes(childs).filter(s => s.type !== ShapeType.Group);
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
function setColor(idx: number, clr: string, alpha: number, isColor: boolean) {
    const res = clr.match(Reg_HEX);
    if (!res) {
        message('danger', t('system.illegal_input'));
        return;
    }
    const r = Number.parseInt(res[1], 16);
    const g = Number.parseInt(res[2], 16);
    const b = Number.parseInt(res[3], 16);
    const s = shapes.value[0] as ShapeView;
    const _idx = fills.length - idx - 1;
    const editor = props.context.editor4Shape(s)
    if (shapes.value.length === 1 && (s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape)) {
        if (s.type === ShapeType.Table) {
            const e = props.context.editor4Table(s as TableView);
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
                const tablecells = (s as TableView).getVisibleCells(tableSelect.value.tableRowStart,
                    tableSelect.value.tableRowEnd,
                    tableSelect.value.tableColStart,
                    tableSelect.value.tableColEnd);
                if (tablecells.length > 0 && tablecells[0].cell) {
                    e.setFillColor(_idx, new Color(alpha, r, g, b), range)
                }
            } else {
                editor.setFillColor(_idx, new Color(alpha, r, g, b));
            }
        } else {
            editor.setFillColor(_idx, new Color(alpha, r, g, b));
        }
    } else if (shapes.value.length > 1) {
        const shapes = getShapesForStyle(props.shapes);
        const actions = get_actions_fill_color(shapes, _idx, new Color(alpha, r, g, b));
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillColor(actions);
        }
    } else if (shapes.value.length === 1 && s.type === ShapeType.Group && !(s as GroupShapeView).data.isBoolOpShape) {
        const childs = (s).childs;
        const shapes = flattenShapes(childs).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_fill_color(shapes, _idx, new Color(alpha, r, g, b));
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillColor(actions);
        }
    }
    hidden_selection(props.context);
}

function onColorChange(idx: number) {
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
    if (len.value === 1 && (s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape)) {
        if (s.type === ShapeType.Table) {
            const table = props.context.tableSelection;
            const e = props.context.editor4Table(s as TableView);
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
                e.setFillColor(_idx, color, range)
            } else {
                editor.value.setFillColor(_idx, color);
            }
        } else {
            editor.value.setFillColor(_idx, color);
        }
    } else if (len.value > 1) {
        const shapes = getShapesForStyle(props.shapes);
        const actions = get_actions_fill_color(shapes, _idx, color);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillColor(actions);
        }
    } else if (len.value === 1 && s.type === ShapeType.Group && !(s as GroupShapeView).data.isBoolOpShape) {
        const childs = (s).childs;
        const shapes = flattenShapes(childs).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_fill_color(shapes, _idx, color);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillColor(actions);
        }
    }
    hidden_selection(props.context);
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

// hooks
const stop2 = watch(() => props.selectionChange, updateData); // 监听选区变化
const stop3 = watch(() => props.triggle, v => { // 监听选区图层变化
    if (v.length > 0 && (v.includes('style') || v.includes('variables'))) updateData();
});
const stop4 = watch(() => props.tableSelectionChange, updateData); // 监听表格选区变化
const stop5 = watch(() => props.cellsTrigger, v => { // 监听选区单元格变化
    if (v.length > 0 && (v.includes('style') || v.includes('variables'))) updateData();
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
        <div class="fills-container" v-else-if="!mixed && !mixed_cell">
            <div class="fill" v-for="(f, idx) in fills" :key="f.id">
                <div :class="f.fill.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible(idx)">
                    <svg-icon v-if="f.fill.isEnabled" icon-class="select"></svg-icon>
                </div>
                <div class="color">
                    <ColorPicker :color="f.fill.color" :context="props.context" :auto_to_right_line="true"
                        @change="c => getColorFromPicker(idx, c)">
                    </ColorPicker>
                    <input ref="colorFill" class="colorFill"
                        :value="toHex(f.fill.color.red, f.fill.color.green, f.fill.color.blue)" :spellcheck="false"
                        @change="(e) => onColorChange(idx)" @focus="selectColor(idx)" @input="colorInput(idx)"
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