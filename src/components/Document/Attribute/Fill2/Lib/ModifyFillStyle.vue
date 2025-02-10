<template>
    <div class="modify-fill-style-panel" id="modify-fill-style-panel">
        <div class="header">
            <div class="title">{{ props.type === 'editor' ? t('stylelib.editor_color') : t('stylelib.create_color') }}
            </div>
            <div class="close" @click.stop="emits('close')">
                <SvgIcon :icon="close_icon" />
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">{{ t('stylelib.name') }}</label>
                <input type="text" id="name" v-model="styleName" @change="setSheetName">
            </div>
            <div class="des">
                <label for="des">{{ t('stylelib.description') }}</label>
                <input type="text" id="des" v-model="styleDes" @change="setSheetDes">
            </div>
        </div>
        <div class="color">
            <div class="create-color">
                <div class="title">{{ t('stylelib.color') }}</div>
                <div class="add" @click.stop="create">
                    <SvgIcon :icon="add_icon" />
                </div>
            </div>
            <div class="color-list">
                <div class="item" v-for="(f, idx) in fills" :key="f.id">
                    <div :class="f.fill.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible(idx)">
                        <SvgIcon v-if="f.fill.isEnabled" :icon="select_icon" />
                    </div>
                    <div class="editor">
                        <ColorPicker :color="f.fill.color" :style="props.style" :entrance="'styles'"
                            :context="props.context" :auto_to_right_line="true"
                            :locat="{ index: fills.length - idx - 1, type: 'fills' }" :gradient="f.fill.gradient"
                            :fillType="f.fill.fillType" :scale="f.fill.scale"
                            :image-scale-mode="(f.fill.imageScaleMode || ImageScaleMode.Fill)"
                            :imageUrl="getImageUrl(f.fill)" @change="c => getColorFromPicker(idx, c)"
                            :image-origin-frame="{ width: f.fill.originalImageWidth || 0, height: f.fill.originalImageHeight || 0 }"
                            :paintFilter="f.fill.paintFilter" @gradient-reverse="() => gradient_reverse(idx)"
                            @gradient-rotate="() => gradient_rotate(idx)"
                            @gradient-add-stop="(p, c, id) => gradient_add_stop(idx, p, c, id)"
                            @gradient-type="(type, fillType) => modify_gradient_type(idx, type, fillType)"
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
                    <div class="delete" :class="{ 'invalid': fills.length === 1 }" @click="deleteFill(idx)">
                        <SvgIcon :icon="delete_icon" />
                    </div>
                </div>
            </div>
        </div>
        <div v-if="props.type !== 'editor'" class="create-bnt" @click.stop="insertStyleLib">{{ t('stylelib.add_style') }}
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { Context } from '@/context';
import {
    BasicArray, Color, Fill, FillMask, FillType, GradientType, ImageScaleMode, ShapeType, ShapeView,
    Stop, TableView
} from "@kcdesign/data";
import { Reg_HEX } from "@/utils/RegExp";
import { useI18n } from 'vue-i18n';
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { message } from "@/utils/message";
import {
    get_action_gradient,
    get_action_gradient_stop,
    get_actions_fill_color,
    get_actions_fill_delete,
    get_actions_fill_opacity,
    get_actions_filltype,
    get_actions_image_ref,
    get_actions_image_scale_mode,
} from '@/utils/shape_style';
import { v4 } from 'uuid';
import { flattenShapes } from '@/utils/cutout';
import { get_table_range, hidden_selection, is_editing } from '@/utils/content';
import { getShapesForStyle } from '@/utils/style';
import { ImgFrame } from '@/context/atrribute';
import { sortValue } from "@/components/Document/Attribute/BaseAttr/oval";
import { LinearApi } from "@kcdesign/data"
import { FillRenderer } from "../../StyleLib/fillRenderer";
import add_icon from '@/assets/icons/svg/add.svg';
import delete_icon from '@/assets/icons/svg/delete.svg';
import close_icon from '@/assets/icons/svg/close.svg';
import select_icon from '@/assets/icons/svg/select.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

/**
 * 将废弃组件，不需要再对这个组件进行维护了
 */
interface FillItem {
    id: number,
    fill: Fill
}
const props = defineProps<{
    context: Context;
    maskId?: string;

    fill?: FillItem[];
    style?: FillMask;
    type?: string;
    maskid?: string;
    reder?: FillRenderer
}>();

const emits = defineEmits<{
    (e: "close"): void;
    (e: "create"): void;
}>()

const { t } = useI18n();
let fills: FillItem[] = reactive([]);
const alphaFill = ref<HTMLInputElement[]>();
const colorFill = ref<HTMLInputElement[]>();
const shapes = ref<ShapeView[]>();
const keydownval = ref<boolean>(false)
const is_color_select = ref(false);
const is_alpha_select = ref(false);
const colorValue = ref('');
const alphaValue = ref('');
const tableSelect = ref({
    editingCell: props.context.tableSelection.editingCell,
    tableRowStart: props.context.tableSelection.tableRowStart,
    tableRowEnd: props.context.tableSelection.tableRowEnd,
    tableColStart: props.context.tableSelection.tableColStart,
    tableColEnd: props.context.tableSelection.tableColEnd
});
const styleName = ref<string>('')
const styleDes = ref<string>('')
const linearApi = new LinearApi(props.context.coopRepo, props.context.data, props.context.selection.selectedPage!)

const modifyMode = computed<boolean>(() => !!props.maskId);

const create = () => {
    if (!modifyMode.value) {
        return emits('create');
    }
    const editor = props.context.editor4Doc()
    if (props.style?.sheet && props.style?.id) {
        const color = new Color(0.2, 0, 0, 0);
        const fill = new Fill(new BasicArray(), v4(), true, FillType.SolidColor, color);
        editor.modifyFillMaskFillAddFill(props.style?.sheet, props.style?.id, fill)
    }
}

const insertStyleLib = () => {
    const editor = props.context.editor4Doc()
    const fills = new BasicArray<Fill>()
    props.fill?.reverse().forEach(s => fills.push(s.fill))
    const style = new FillMask(new BasicArray(), props.context.data.id, v4(), styleName.value, styleDes.value, fills)
    const page = props.context.selection.selectedPage!
    const selected = props.context.selection.selectedShapes;
    const shapes = getShapesForStyle(selected);
    editor.insertStyleLib(style, page, shapes);
    emits('close')
}

const setSheetName = () => {
    if (!props.type) return
    const editor = props.context.editor4Doc()
    if (!props.style?.sheet) return
    editor.modifyStyleName(props.style?.sheet, props.style?.id, styleName.value)
}

const setSheetDes = () => {
    if (!props.type) return
    const editor = props.context.editor4Doc()
    if (!props.style?.sheet) return
    editor.modifyStyleDescription(props.style?.sheet, props.style?.id, styleDes.value)
}

const alphaInput = (e: Event) => {
    if (alphaFill.value) {
        alphaValue.value = (e.target as HTMLInputElement).value;
    }
}

const alphaClick = (e: Event) => {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_alpha_select.value) return;
    el.select();
    is_alpha_select.value = true;
}

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
    } else if (fill.fillType === FillType.Pattern) {
        const opacity = fill.contextSettings?.opacity || 1;
        alpha = opacity * 100;
    } else if (fill.gradient && fill.fillType === FillType.Gradient) {
        const opacity = fill.gradient.gradientOpacity;
        alpha = (opacity === undefined ? 1 : opacity) * 100;
    }
    alphaFill.value[idx].value = alpha + '%'
}

function toggleVisible(idx: number) {
    const _idx = fills.length - idx - 1;
    const editor = props.context.editor4Doc()
    if (props.style?.sheet && props.style?.id) {
        const value = !props.style.fills[_idx].isEnabled
        editor.modifyFillMaskFillEnabled(props.style?.sheet, props.style?.id, _idx, value)
    }
    hidden_selection(props.context);
}

function deleteFill(idx: number) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (props.type) {
        const editor = props.context.editor4Doc()
        if (props.style?.sheet && props.style?.id) {
            editor.modifyFillMaskFillDelFill(props.style?.sheet, props.style?.id, _idx)
        }
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

const set_gradient_opacity = (idx: number, opacity: number) => {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_action_gradient_stop(shapes, _idx, opacity, 'fills');
    if (keydownval.value) {
        linearApi.modifyGradientOpacity(actions)
        keydownval.value = false
    } else {
        if (props.type) {
            const editor = props.context.editor4Doc()
            if (!props.style) return
            editor.modifyFillMaskGradientOpacity(props.style?.sheet, props.style?.id, _idx, opacity)
        } else {
            editor.setGradientOpacity(actions);
        }

    }

}

function setFillOpacity(idx: number, opacity: number) {
    const selected = shapes.value || props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    const _idx = fills.length - idx - 1;
    const s = getShapesForStyle(selected);
    const actions = get_actions_fill_opacity(s, _idx, opacity);

    if (props.type) {
        const editor = props.context.editor4Doc()
        if (!props.style) return
        editor.modifyFillMaskImageOpacity(props.style.sheet, props.style.id, _idx, opacity)
    } else {
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillOpacity(actions);
        }
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

    if (props.type) {
        const editor = props.context.editor4Doc()
        if (props.style?.sheet && props.style?.id) {
            editor.modifyFillMaskFillColor(props.style?.sheet, props.style?.id, _idx, new Color(alpha, r, g, b))
        }
        return
    }

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
    if (props.type) {
        const editor = props.context.editor4Doc()
        if (!props.style) return
        editor.modifyFillMaskFillFillType(props.style?.sheet, props.style?.id, _idx, fillType)
    } else {
        const selected = props.context.selection.selectedShapes;
        const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_filltype(shapes, _idx, fillType);
        const page = props.context.selection.selectedPage!;
        const editor = props.context.editor4Page(page);
        editor.setShapesFillType(actions);
    }
}

const getImageUrl = (fill: Fill) => {
    return fill.peekImage(true) || props.context.attr.defaultImage;
}

function getColorFromPicker(idx: number, color: Color) {
    const _idx = fills.length - idx - 1;
    const page = props.context.selection.selectedPage;
    if (props.type) {
        const editor = props.context.editor4Doc()
        if (props.style?.sheet && props.style?.id) {
            editor.modifyFillMaskFillColor(props.style?.sheet, props.style?.id, _idx, color)
        }
        return
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

function gradient_reverse(idx: number) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_action_gradient(shapes, _idx, 'fills');
    if (props.type) {
        const editor = props.context.editor4Doc()
        if (props.style?.sheet && props.style?.id) {
            editor.modifyFillMaskGradientReverse(props.style?.sheet, props.style?.id, _idx)
        }
    } else {
        editor.reverseShapesGradient(actions);
    }

}

function gradient_rotate(idx: number) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_action_gradient(shapes, _idx, 'fills');

    if (props.type) {
        const editor = props.context.editor4Doc()
        if (props.style?.sheet && props.style?.id) {
            editor.modifyFillMaskGradientRotate(props.style?.sheet, props.style?.id, _idx)
        }
    } else {
        editor.rotateShapesGradient(actions);
    }
}

function gradient_add_stop(idx: number, position: number, color: Color, id: string) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const stop = new Stop(new BasicArray(), id, position, color);
    const actions = get_action_gradient_stop(shapes, _idx, stop, 'fills');
    if (props.type) {
        const editor = props.context.editor4Doc()
        if (!(props.style?.sheet && props.style.id)) return
        editor.modifyFillMaskGradientStop(props.style?.sheet, props.style?.id, _idx, stop)
    } else {
        editor.addShapesGradientStop(actions);
    }

}

function modify_gradient_type(idx: number, type: GradientType, fillType: FillType) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    console.log('fillType', fillType);

    if (fillType !== FillType.Gradient) {
        toggle_fill_type(idx, fillType);
    } else {
        if (props.type) {
            const editor = props.context.editor4Doc()
            if (!props.style) return
            editor.modifyFillMaskGradientType(props.style?.sheet, props.style?.id, _idx, type)
        } else {
            const actions = get_action_gradient_stop(shapes, _idx, type, 'fills');
            editor.toggerShapeGradientType(actions);
        }

    }
}

function gradient_stop_color_change(idx: number, color: Color, index: number) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_action_gradient_stop(shapes, _idx, { color, stop_i: index }, 'fills');
    if (props.type) {
        const editor = props.context.editor4Doc()
        if (!props.style) return
        editor.modifyFillMaskGradientStopColor(props.style?.sheet, props.style?.id, _idx, { color, stop_i: index })
    } else {
        editor.setShapesGradientStopColor(actions);
    }

}

function gradient_stop_delete(idx: number, index: number) {
    const _idx = fills.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const actions = get_action_gradient_stop(shapes, _idx, index, 'fills');
    editor.deleteShapesGradientStop(actions);
}

const changeMode = (idx: number, mode: ImageScaleMode) => {
    const _idx = fills.length - idx - 1;
    const page = props.context.selection.selectedPage;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const actions = get_actions_image_scale_mode(shapes, _idx, mode);
    if (props.type) {
        const editor = props.context.editor4Doc()
        if (!props.style) return
        editor.modifyFillMaskImageScaleMode(props.style?.sheet, props.style?.id, _idx, mode)
    } else {
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillImageScaleMode(actions);
        }
    }
}

const setImageRef = (idx: number, urlRef: string, origin: ImgFrame, imageMgr: { buff: Uint8Array, base64: string }) => {
    const _idx = fills.length - idx - 1;
    const page = props.context.selection.selectedPage;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const actions = get_actions_image_ref(shapes, _idx, { urlRef, origin, imageMgr });

    if (props.type) {
        const editor = props.context.editor4Doc()
        if (!props.style) return
        editor.modifyFillMaskImageRef(props.style?.sheet, props.style?.id, _idx, { urlRef, origin, imageMgr })
    } else {
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillImageRef(actions);
        }
    }

}

const changeRotate = (idx: number, fill: Fill) => {
    let rotate = fill.rotation || 0;
    const _idx = fills.length - idx - 1;
    const page = props.context.selection.selectedPage;

    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const actions = get_actions_image_ref(shapes, _idx, (rotate + 90) % 360);

    if (props.type) {
        const editor = props.context.editor4Doc()
        if (!props.style) return
        editor.modifyFillMaskImageRotate(props.style?.sheet, props.style?.id, _idx, (rotate + 90) % 360)
    } else {
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillImageRotate(actions);
        }
    }
}

const changeScale = (idx: number, scale: number) => {
    const _idx = fills.length - idx - 1;
    const page = props.context.selection.selectedPage;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const actions = get_actions_image_ref(shapes, _idx, scale / 100);

    if (props.type) {
        const editor = props.context.editor4Doc()
        if (!props.style) return
        editor.modifyFillMaskImageScale(props.style?.sheet, props.style?.id, _idx, scale / 100)
    } else {
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillImageScale(actions);
        }

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
        colorValue.value = (e.target as HTMLInputElement).value;
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

const update = () => {
    if (props.fill) {
        fills = props.fill
        console.log('props.fills', props.fill, fills);
    }
    if (props.style) {
        props.style.fills.forEach((f, idx) => fills.push({ id: idx, fill: f }))
        fills = fills.reverse()
        console.log('props.style', props.style);
    }
    // fills=fills.reverse()
    styleName.value = props.style?.name ?? '颜色样式';
    styleDes.value = props.style?.description ?? '';
}

function stylelib_watcher(t: number | string) {
    if (t === 'stylelib')
        if (!props.style) return
    fills.length = 0
    if (props.reder) {
        props.reder.currentTarget(props.style!.id)?.fills?.forEach((f, idx) => fills.push({ id: idx, fill: f }))
    }
    fills = fills.reverse()
}

onMounted(() => {
    update();
    props.context.data.watch(stylelib_watcher)
})

onUnmounted(() => {
    props.context.data.unwatch(stylelib_watcher)
})
</script>
<style lang="scss" scoped>
.modify-fill-style-panel {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 250px;
    gap: 8px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
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
            width: 28px;
            height: 28px;
            display: flex;
            border-radius: 4px;

            &:hover {
                background-color: #F5F5F5;
            }

            img {
                width: 16px;
                height: 16px;
                margin: auto;
                padding: 2px;
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
                flex: 1;
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
        margin-bottom: 8px;
        box-sizing: border-box;

        .create-color {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 32px;

            .add {
                width: 28px;
                height: 28px;
                display: flex;
                border-radius: 4px;

                &:hover {
                    background-color: #F5F5F5;
                }

                img {
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
                gap: 8px;

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

                    >img {
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
                }

                .editor {
                    flex: 1;
                    background-color: var(--input-background);
                    height: 32px;
                    padding: 9px 8px;
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

                .delete {
                    flex: 0 0 28px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 28px;
                    height: 28px;
                    border-radius: var(--default-radius);
                    transition: .2s;

                    >img {
                        width: 16px;
                        height: 16px;
                    }
                }

                .delete:hover {
                    background-color: #F5F5F5;
                }

                .invalid {
                    opacity: 0.4;
                    pointer-events: none;
                }
            }
        }
    }

    .create-bnt {
        display: flex;
        align-items: center;
        justify-content: center;
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
