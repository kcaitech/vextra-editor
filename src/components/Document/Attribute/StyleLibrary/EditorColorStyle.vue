<template>
    <div class="editor-style">
        <div class="header">
            <div class="title">创建颜色样式</div>
            <div class="close" @click.stop="emits('close')">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">名称</label>
                <input type="text" id="name">
            </div>
            <div class="des">
                <label for="des">描述</label>
                <input type="text" id="des">
            </div>
        </div>
        <div class="color">
            <div class="create-color">
                <div class="title">颜色</div>
                <div class="add">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
            </div>
            <div class="color-list">
                <div class="item" v-for="(f,idx) in props.fills" :key="f.id">
                    <input type="checkbox">
                    <div class="editor">
                        <ColorPicker :color="f.fill.color" :context="props.context" :auto_to_right_line="true"
                            :locat="{ index: props.fills.length - idx - 1, type: 'fills' }" :gradient="f.fill.gradient"
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
                            :class="{ 'check': f.fill.isEnabled, 'nocheck': !f.fill.isEnabled }"
                            @keydown="(e) => keydownAlpha(e, idx, f.fill, filterAlpha(f.fill))" />
                    </div>
                </div>
            </div>
        </div>
        <div class="create-bnt" @click.stop="emits('close')">创建样式</div>
    </div>

</template>
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
import { sortValue } from "@/components/Document/Attribute/BaseAttr/oval";
import { LinearApi } from "@kcdesign/data"

interface FillItem {
    id: number,
    fill: Fill
}
const props = defineProps<{
    fills?:FillItem[]
}>();

const emits = defineEmits<{
    (e: "close"): void;
}>()
const { t } = useI18n();

const colorClick = (e: Event) => {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_color_select.value) return;
    el.select();
    is_color_select.value = true;
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
    if (keydownval.value) {
        linearApi.modifyGradientOpacity(actions)
        keydownval.value=false
    } else {
        editor.setGradientOpacity(actions);
    }

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
        const tablecells = (s as TableView).getVisibleCells(range.rowStart,
        range.rowEnd,
        range.colStart,
        range.colEnd);
        if (tablecells.length > 0 && tablecells[0].cell) {
            if (keydownval.value) {
                linearApi.modifyFillOpacity4Cell(_idx, new Color(alpha, r, g, b), range, s as TableView)
                keydownval.value = false
            } else {
                e.setFillColor4Cell(_idx, new Color(alpha, r, g, b), range)
            }

        }
    } else {
        const s = getShapesForStyle(selected);
        const actions = get_actions_fill_color(s, _idx, new Color(alpha, r, g, b));
        if (page) {
            const editor = props.context.editor4Page(page);
            if (keydownval.value) {
                linearApi.modifyFillOpacity(actions)
                keydownval.value = false
            } else {
                editor.setShapesFillColor(actions);
            }
        }
    }

    hidden_selection(props.context);
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

const getImageUrl = (fill: Fill) => {
    return fill.peekImage(true) || props.context.attr.defaultImage;
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

function toHex(r: number, g: number, b: number) {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return hex(r) + hex(g) + hex(b);
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

const colorInput = (e: Event) => {
    if (colorFill.value) {
        const value = (e.target as HTMLInputElement).value;
        colorValue.value = value;
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

function keydownAlpha(event: KeyboardEvent, idx: number, fill: Fill, val: string) {
    let value: any = sortValue(val);
    if (!alphaFill.value) return;
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        keydownval.value = true;
        if (value >= 0) {
            if (value >= 100) {
                value = 100
            }
            value = value / 100 + (event.code === 'ArrowUp' ? 0.01 : -0.01)
            if (isNaN(value)) return;
            const color = fills[idx].fill.color;
            let clr = toHex(color.red, color.green, color.blue);
            if (clr.slice(0, 1) !== '#') {
                clr = "#" + clr
            }
            value = value <= 0 ? 0 : value <= 1 ? value : 1
            if (fill.fillType === FillType.SolidColor || fill.fillType === FillType.Pattern) {
                setColor(idx, clr, value);
            } else if (fill.gradient && fill.fillType === FillType.Gradient) {
                set_gradient_opacity(idx, value);
            }
        } else {
            alpha_message(idx, fill);
        }
        event.preventDefault();
    }

}

</script>
<style lang="scss" scoped>
.editor-style {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.18);
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40px;
        padding: 0 12px;
        border-bottom: 1px solid #f0f0f0;
        box-sizing: border-box;

        .close {
            width: 24px;
            height: 24px;
            display: flex;
            border-radius: 4px;

            &:hover {
                background-color: #F5F5F5;
            }

            svg {
                width: 16px;
                height: 16px;
                margin: auto;
                padding: 2px;
                /* margin-top: 1px; */
                box-sizing: border-box;
            }
        }
    }

    .detail {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px;
        box-sizing: border-box;

        .name,
        .des {
            display: flex;
            align-items: center;
            height: 32px;
            gap: 8px;

            input {
                outline: none;
                font-size: 12px;
                padding: 10px 8px;
                height: 32px;
                border-radius: 6px;
                border: 1px solid transparent;
                background-color: #F5F5F5;
                box-sizing: border-box;

                &:focus {
                    border: 1px solid #1878f5;
                }
            }
        }
    }

    .color {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px;
        box-sizing: border-box;

        .create-color {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 32px;

            .add {
                width: 24px;
                height: 24px;
                display: flex;
                border-radius: 4px;

                &:hover {
                    background-color: #F5F5F5;
                }

                svg {
                    width: 16px;
                    height: 16px;
                    margin: auto;
                }
            }
        }

        .color-list {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .item {
                display: flex;
                align-items: center;
                height: 32px;
            }
        }
    }

    .create-bnt {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: auto;
        margin-bottom: 12px;
        font-size: 12px;
        width: 100px;
        height: 40px;
        border-radius: 6px;
        background-color: #1878f5;
        color: #fff;

        &:hover {
            background-color: #429AFF;
        }

        &:active {
            background-color: #0A59CF;
        }
    }
}
</style>
