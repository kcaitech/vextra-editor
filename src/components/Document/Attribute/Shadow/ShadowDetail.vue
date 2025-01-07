<script setup lang="ts">
import { Context } from '@/context';
import { onUpdated, reactive, ref, watch } from 'vue';
import Popover from '@/components/common/Popover.vue';
import ShadowInput from './ShadowInput.vue';
import { useI18n } from 'vue-i18n';
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { toHex } from "@/utils/color";
import { Color, Shadow, ShapeView, ShapeType, Fill, LinearApi } from '@kcdesign/data';
import { message } from "@/utils/message";
import { Reg_HEX } from "@/utils/RegExp";
import {
    get_actions_shadow_blur,
    get_actions_shadow_color,
    get_actions_shadow_offsetx,
    get_actions_shadow_offsety,
    get_actions_shadow_spread
} from '@/utils/shape_style';
import { hidden_selection } from '@/utils/content';
import { Menu } from "@/context/menu";
import { LockMouse } from "@/transform/lockMouse";
import { format_value } from "@/utils/common";
import { sortValue } from '../BaseAttr/oval';
import { FillRenderer, EditorAtt } from "../StyleLibrary/fillRenderer";
const { t } = useI18n();

interface Props {
    context: Context
    shadow: Shadow
    idx: number
    id?: string
    length: number
    shapes: ShapeView[]
    entry?: string
    isMask?: boolean
    editor?: EditorAtt
}

interface Emits {
    (e: 'setOffsetX', value: number): void;
    (e: 'setOffsetY', value: number): void;
    (e: 'setBlurRadius', value: number): void;
    (e: 'setSpread', value: number): void;
    (e: 'pickerColor', color: Color): void;
    (e: 'setColor', color: Color): void;
    (e: 'keydownoffsetX', value: number): void;
    (e: 'keydownoffsetY', value: number): void;
    (e: 'keydownBlurRadius', value: number): void;
    (e: 'keydownSpread', value: number): void;
    (e: 'keydownColor', color: Color): void;
    (e: 'dragoffsetX', fn: LockMouse, value: number): void;
    (e: 'dragoffsetY', fn: LockMouse, value: number): void;
    (e: 'dragBlurRadius', fn: LockMouse, value: number): void;
    (e: 'dragSpread', fn: LockMouse, value: number): void;
}

const emits = defineEmits<Emits>();
const props = defineProps<Props>();
const popover = ref();
const reflush = ref<number>(0);
const alphaShadow = ref<HTMLInputElement>();
const colorShadow = ref<HTMLInputElement>();
const disabled = ref(false);
const spare_tip = ref('');
const linearApi = new LinearApi(props.context.coopRepo, props.context.data, props.context.selection.selectedPage!)
const keydownval = ref<boolean>(false);

const setOffsetX = (value: number) => {
    const _idx = props.length - props.idx - 1;
    const len = props.shapes.length;
    if (props.isMask && props.editor) {
        props.editor.OffsetX(props.idx, value)
        return
    }

    if (props.entry === 'style') {
        emits('setOffsetX', value);
    } else if (len === 1) {
        const e = props.context.editor4Shape(props.context.selection.selectedShapes[0]);
        e.setShadowOffsetX(_idx, value);
    } else if (len > 1) {
        const actions = get_actions_shadow_offsetx(props.shapes, _idx, value);
        if (actions && actions.length) {
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.setShapesShadowOffsetX(actions);
            }
        }
    }
    hidden_selection(props.context);
}

watch(() => props.shapes, () => {
    console.log('切换了图形');

})

function keydownOffsetX(e: KeyboardEvent, val: string | number) {
    let value: any = sortValue(val.toString());
    const _idx = props.length - props.idx - 1;
    const len = props.shapes.length;
    if (e.code === 'ArrowUp' || e.code === "ArrowDown") {
        value = value + (e.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        value = value <= -3000 ? -3000 : value <= 3000 ? value : 3000;
        if (props.isMask && props.editor) {
            props.editor.OffsetX(props.idx, value)
            return
        }
        if (props.entry === 'style') {
            emits('keydownoffsetX', value);
        } else if (len === 1) {
            linearApi.modifyShadowOffSetX(_idx, value, props.context.selection.selectedShapes[0]);
        } else if (len > 1) {
            const actions = get_actions_shadow_offsetx(props.shapes, _idx, value);
            if (actions && actions.length) {
                const page = props.context.selection.selectedPage;
                if (page) {
                    linearApi.modifyShapesShadowOffsetX(actions)
                }
            }
        }
        e.preventDefault();
        hidden_selection(props.context);
    }
}

const setOffsetY = (value: number) => {
    const _idx = props.length - props.idx - 1;
    const len = props.shapes.length;
    if (props.isMask && props.editor) {
        props.editor.OffsetY(props.idx, value)
        return
    }
    if (props.entry === 'style') {
        emits('setOffsetY', value);
    } else if (len === 1) {
        const e = props.context.editor4Shape(props.context.selection.selectedShapes[0]);
        e.setShadowOffsetY(_idx, value);
    } else if (len > 1) {
        const actions = get_actions_shadow_offsety(props.shapes, _idx, value);
        if (actions && actions.length) {
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.setShapesShadowOffsetY(actions);
            }
        }
    }
    hidden_selection(props.context);
}

function keydownOffsetY(e: KeyboardEvent, val: string | number) {
    let value: any = sortValue(val.toString());
    const _idx = props.length - props.idx - 1;
    const len = props.shapes.length;
    if (e.code === 'ArrowUp' || e.code === "ArrowDown") {
        value = value + (e.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        value = value <= -3000 ? -3000 : value <= 3000 ? value : 3000;
        if (props.isMask && props.editor) {
            props.editor.OffsetY(props.idx, value)
            return
        }
        if (props.entry === 'style') {
            emits('keydownoffsetY', value);
        } else if (len === 1) {
            linearApi.modifyShadowOffSetY(_idx, value, props.context.selection.selectedShapes[0]);
        } else if (len > 1) {
            const actions = get_actions_shadow_offsety(props.shapes, _idx, value);
            if (actions && actions.length) {
                const page = props.context.selection.selectedPage;
                if (page) {
                    linearApi.modifyShapesShadowOffsetY(actions)
                }
            }
        }
        e.preventDefault();
        hidden_selection(props.context);
    }
}

const setBlurRadius = (value: number) => {
    const _idx = props.length - props.idx - 1;
    const len = props.shapes.length;
    if (props.isMask && props.editor) {
        props.editor.setBlurRadius(props.idx, value)
        return
    }
    if (props.entry === 'style') {
        emits('setBlurRadius', value);
    } else if (len === 1) {
        const e = props.context.editor4Shape(props.context.selection.selectedShapes[0]);
        e.setShadowBlur(_idx, value);
    } else if (len > 1) {
        const actions = get_actions_shadow_blur(props.shapes, _idx, value);
        if (actions && actions.length) {
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.setShapesShadowBlurRadius(actions);
            }
        }
    }
    hidden_selection(props.context);
}

function keydownBlurRadius(e: KeyboardEvent, val: string | number) {
    let value: any = sortValue(val.toString());
    const _idx = props.length - props.idx - 1;
    const len = props.shapes.length;
    if (e.code === 'ArrowUp' || e.code === "ArrowDown") {
        value = value + (e.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        value = value <= 0 ? 0 : value <= 200 ? value : 200;
        if (props.isMask && props.editor) {
            props.editor.setBlurRadius(props.idx, value)
            return
        }
        if (props.entry === 'style') {
            emits('keydownBlurRadius', value as number);
        } else if (len === 1) {
            linearApi.modifyShadowBlur(_idx, value, props.context.selection.selectedShapes[0]);
        } else if (len > 1) {
            const actions = get_actions_shadow_blur(props.shapes, _idx, value);
            if (actions && actions.length) {
                const page = props.context.selection.selectedPage;
                if (page) {
                    linearApi.modifyShapesShadowBlur(actions)
                }
            }
        }
        e.preventDefault();
        hidden_selection(props.context);
    }
}

const setSpread = (value: number) => {
    const _idx = props.length - props.idx - 1;
    const len = props.shapes.length;
    if (props.isMask && props.editor) {
        props.editor.setSpread(props.idx, value)
        return
    }
    if (props.entry === 'style') {
        emits('setSpread', value);
    } else if (len === 1) {
        const e = props.context.editor4Shape(props.context.selection.selectedShapes[0]);
        e.setShadowSpread(_idx, value);
    } else if (len > 1) {
        const actions = get_actions_shadow_spread(props.shapes, _idx, value);
        if (actions && actions.length) {
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.setShapesShadowSpread(actions);
            }
        }
    }
    hidden_selection(props.context);
}

function keydownSpread(e: KeyboardEvent, val: string | number) {
    let value: any = sortValue(val.toString());
    const _idx = props.length - props.idx - 1;
    const len = props.shapes.length;
    if (e.code === 'ArrowUp' || e.code === "ArrowDown") {
        value = value + (e.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        value = value <= -3000 ? -3000 : value <= 3000 ? value : 3000;
        if (props.isMask && props.editor) {
            props.editor.setSpread(props.idx, value)
            return
        }
        if (props.entry === 'style') {
            emits('keydownSpread', value as number);
        } else if (len === 1) {
            linearApi.modifyShadowSpread(_idx, value, props.context.selection.selectedShapes[0]);
        } else if (len > 1) {
            const actions = get_actions_shadow_spread(props.shapes, _idx, value);
            if (actions && actions.length) {
                const page = props.context.selection.selectedPage;
                if (page) {
                    linearApi.modifyShapesShadowSpread(actions)
                }
            }
        }
        e.preventDefault();
        hidden_selection(props.context);
    }
}

function setColor(clr: string, alpha: number) {
    const res = clr.match(Reg_HEX);
    if (!res) {
        message('danger', t('system.illegal_input'));
        return;
    }
    const r = Number.parseInt(res[1], 16);
    const g = Number.parseInt(res[2], 16);
    const b = Number.parseInt(res[3], 16);
    const _idx = props.length - props.idx - 1;
    const len = props.shapes.length;
    if (props.isMask && props.editor) {
        const color = new Color(alpha, r, g, b)
        props.editor.setColor(props.idx, color)
        return
    }
    if (props.entry === 'style') {
        const color = new Color(alpha, r, g, b);
        if (keydownval.value) {
            emits('keydownColor', color);
        } else {
            emits('setColor', color);
        }
    } else if (len === 1 && props.entry !== 'style') {
        const e = props.context.editor4Shape(props.context.selection.selectedShapes[0]);
        if (keydownval.value) {
            linearApi.modifyShadowColor(_idx, new Color(alpha, r, g, b), props.context.selection.selectedShapes[0])
        } else {
            e.setShadowColor(_idx, new Color(alpha, r, g, b));
        }

    } else if (len > 1 && props.entry !== 'style') {
        const actions = get_actions_shadow_color(props.shapes, _idx, new Color(alpha, r, g, b));
        const page = props.context.selection.selectedPage;
        if (page) {
            if (keydownval.value) {
                linearApi.modifyShapesShadowColor(actions)
            } else {
                const editor = props.context.editor4Page(page);
                editor.setShapesShadowColor(actions);
            }
        }
    }
    keydownval.value = false
    hidden_selection(props.context);
}

function onColorChange(e: Event) {
    (e.target as HTMLInputElement)?.blur();
    let value = (e.target as HTMLInputElement)?.value;
    if (value.slice(0, 1) !== '#') value = "#" + value;
    if (value.length === 4) value = `#${value.slice(1).split('').map(i => `${i}${i}`).join('')}`;
    if (value.length === 2) value = `#${value.slice(1).split('').map(i => `${i}${i}${i}${i}${i}${i}`).join('')}`;
    if (Reg_HEX.test(value)) {
        setColor(value, props.shadow.color.alpha);
    } else {
        message('danger', t('system.illegal_input'));
        return (e.target as HTMLInputElement).value = toHex(props.shadow.color);
    }
}

function onAlphaChange(e: Event) {
    let value = (e.currentTarget as any)['value'];
    if (alphaShadow.value) {
        alphaShadow.value.blur();
        if (value?.slice(-1) === '%') {
            value = Number(value?.slice(0, -1))
            if (value >= 0) {
                if (value > 100) value = 100;
                value = value.toFixed(2) / 100;
                const color = props.shadow.color;
                let clr = toHex(color);
                if (clr.slice(0, 1) !== '#') clr = "#" + clr;
                return setColor(clr, value);
            } else {
                message('danger', t('system.illegal_input'));
                return (e.target as HTMLInputElement).value = (props.shadow.color.alpha * 100) + '%'
            }
        } else if (!isNaN(Number(value))) {
            if (value >= 0) {
                if (value > 100) value = 100;
                value = Number((Number(value)).toFixed(2)) / 100;
                const color = props.shadow.color;
                let clr = toHex(color);
                if (clr.slice(0, 1) !== '#') clr = "#" + clr;
                return setColor(clr, value);
            } else {
                message('danger', t('system.illegal_input'));
                return (e.target as HTMLInputElement).value = (props.shadow.color.alpha * 100) + '%'
            }
        } else {
            message('danger', t('system.illegal_input'));
            return (e.target as HTMLInputElement).value = (props.shadow.color.alpha * 100) + '%'
        }
    }
}

function keydownAlpha(event: KeyboardEvent, val: string | number) {
    let value: any = sortValue(val.toString());
    let old = value / 100;
    if (!alphaShadow.value) return;
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        keydownval.value = true;
        if (value >= 0) {
            if (value >= 100) {
                value = 100
            }
            value = value / 100 + (event.code === 'ArrowUp' ? 0.01 : -0.01)
            if (isNaN(value)) return;
            const color = props.shadow.color;
            let clr = toHex(color);
            if (clr.slice(0, 1) !== '#') {
                clr = "#" + clr
            }
            value = value <= 0 ? 0 : value <= 1 ? value : 1
            if (old !== value) setColor(clr, value);
        } else {
            message('danger', t('system.illegal_input'));
            (event.target as HTMLInputElement).value = (props.shadow.color.alpha * 100) + '%'
        }
        event.preventDefault();
    }

}

function getColorFromPicker(color: Color) {
    const _idx = props.length - props.idx - 1;
    const len = props.shapes.length;
    if (props.isMask && props.editor) {
        props.editor.setColor(props.idx, color)
        return
    }
    if (props.entry === 'style') {
        emits('pickerColor', color);
    } else if (len === 1) {
        const e = props.context.editor4Shape(props.context.selection.selectedShapes[0]);
        e.setShadowColor(_idx, color);
    } else if (len > 1) {
        const actions = get_actions_shadow_color(props.shapes, _idx, color);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesShadowColor(actions);
        }
    }
    hidden_selection(props.context);
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

function showMenu() {
    props.context.menu.notify(Menu.SHUTDOWN_MENU);
    disable();
    popover.value.show();
}

onUpdated(() => {
    reflush.value++;
})
const disable = () => {
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length === 1) {
        const type = shapes[0].type;
        const fills = shapes[0].data.style.fills;
        if (type === ShapeType.Artboard && !isFill(fills)) {
            spare_tip.value = t('shadow.fill_is_visible');
            disabled.value = true;
        } else {
            if (type !== ShapeType.Rectangle && type !== ShapeType.Artboard && type !== ShapeType.Oval) {
                spare_tip.value = t('shadow.only_used');
                disabled.value = true;
            } else {
                spare_tip.value = t('shadow.extend');
                disabled.value = false;
            }
        }
    } else if (shapes.length > 1) {
        let artFills = false;
        let notAllArtboard = false;
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            if (shape.type !== ShapeType.Rectangle && shape.type !== ShapeType.Artboard && shape.type !== ShapeType.Oval) {
                spare_tip.value = t('shadow.only_used');
                return disabled.value = true;
            } else if (shape.type !== ShapeType.Artboard) {
                notAllArtboard = true;
            } else if (shape.type === ShapeType.Artboard && !isFill(shape.style.fills)) {
                artFills = true;
            }
        }
        if (notAllArtboard) {
            spare_tip.value = t('shadow.extend');
            disabled.value = false;
        } else {
            if (artFills) {
                spare_tip.value = t('shadow.fill_is_visible');
                disabled.value = true;
            } else {
                spare_tip.value = t('shadow.extend');
                disabled.value = false;
            }
        }
    }
}

const isFill = (fills: Fill[]) => {
    for (let i = 0; i < fills.length; i++) {
        const fill = fills[i];
        if (fill.isEnabled && fill.color.alpha > 0) {
            return true;
        }
    }
    return false;
}

const tel = ref<boolean>(false);
const telX = ref<number>(0);
const telY = ref<number>(0);
let lockMouseHandler: LockMouse | undefined = undefined;

function updatePosition(movementX: number, movementY: number) {
    const clientHeight = document.documentElement.clientHeight;
    const clientWidth = document.documentElement.clientWidth;
    telX.value += movementX;
    telY.value += movementY;
    telX.value = telX.value < 0 ? clientWidth : (telX.value > clientWidth ? 0 : telX.value);
    telY.value = telY.value < 0 ? clientHeight : (telY.value > clientHeight ? 0 : telY.value);
}

async function dragStart(e: MouseEvent) {
    tel.value = true;
    telX.value = e.clientX;
    telY.value = e.clientY;
    const el = e.target as HTMLElement
    if (!document.pointerLockElement) {
        await el.requestPointerLock({
            unadjustedMovement: true,
        });
    }

    lockMouseHandler = new LockMouse(props.context, e);
    document.addEventListener('pointerlockchange', pointerLockChange, false);
}

const pointerLockChange = () => {
    if (!document.pointerLockElement) {
        dragEnd();
    }
}

function draggingX(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);
    let val = props.shadow.offsetX + e.movementX;
    const _idx = props.length - props.idx - 1;

    val = val < -3000 ? -3000 : val > 3000 ? 3000 : val;

    if (!lockMouseHandler) {
        return
    }

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }
    // if (props.isMask) return attributes.x = val;
    if (props.entry === 'style') {
        emits('dragoffsetX', lockMouseHandler, val);
    } else {
        lockMouseHandler.executeShadowX(_idx, val);
    }

}

function draggingY(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    let val = props.shadow.offsetY + e.movementX;
    const _idx = props.length - props.idx - 1;

    val = val < -3000 ? -3000 : val > 3000 ? 3000 : val;

    if (!lockMouseHandler) {
        return
    }

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }
    // if (props.isMask) return attributes.y = val;
    if (props.entry === 'style') {
        emits('dragoffsetY', lockMouseHandler, val);
    } else {
        lockMouseHandler.executeShadowY(_idx, val);
    }
}

function draggingB(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    let val = props.shadow.blurRadius + e.movementX;
    const _idx = props.length - props.idx - 1;

    val = val < 0 ? 0 : val > 200 ? 200 : val;

    if (!lockMouseHandler) {
        return
    }

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }
    // if (props.isMask) return attributes.b = val;
    if (props.entry === 'style') {
        emits('dragBlurRadius', lockMouseHandler, val);
    } else {
        lockMouseHandler.executeShadowB(_idx, val);
    }
}

function draggingS(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    let val = props.shadow.spread + e.movementX;
    const _idx = props.length - props.idx - 1;

    val = val < -3000 ? -3000 : val > 3000 ? 3000 : val;

    if (!lockMouseHandler) {
        return
    }

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }
    // if (props.isMask) return attributes.s = val;
    if (props.entry === 'style') {
        emits('dragSpread', lockMouseHandler, val);
    } else {
        lockMouseHandler.executeShadowS(_idx, val);
    }
}

function dragEnd() {
    tel.value = false;
    document.exitPointerLock();

    lockMouseHandler?.fulfil();
    lockMouseHandler = undefined;
    document.removeEventListener('pointerlockchange', pointerLockChange, false);
}

function extend(base: number) {
    return Number(format_value(base));
    // const view = props.shapes[0];
    //
    // if (view.isVirtualShape) {
    //     let parent = view.parent;
    //     while (parent) {
    //         if (parent.scale) base *= parent.scale;
    //         parent = parent.parent;
    //     }
    // }
    //
    // return Number(format_value(base));
}

import gear_icon from '@/assets/icons/svg/gear.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
</script>

<template>
    <div class="border-detail-container">
        <Popover :context="props.context" class="popover" ref="popover" :width="254" :auto_to_right_line="true"
            :title="`${t('shadow.shadow_setting')}`">
            <template #trigger>
                <div class="trigger" @click="showMenu">
                    <SvgIcon :icon="gear_icon"/>
                </div>
            </template>
            <template #body>
                <div class="options-container">
                    <div class="setting">
                        <div class="name-title">{{ t('shadow.position') }}</div>
                        <ShadowInput ticon="X" :shadow-v="extend(shadow.offsetX)" :reflush="reflush"
                            @on-change="setOffsetX" @key-down="keydownOffsetX" @dragstart="dragStart"
                            @dragging="draggingX" @dragend="dragEnd">
                        </ShadowInput>
                        <ShadowInput ticon="Y" :shadow-v="extend(shadow.offsetY)" @on-change="setOffsetY"
                            :reflush="reflush" @key-down="keydownOffsetY" @dragstart="dragStart" @dragging="draggingY"
                            @dragend="dragEnd">
                        </ShadowInput>
                    </div>
                    <div class="setting">
                        <div class="name-title">{{ t('shadow.effect') }}</div>
                        <ShadowInput ticon="B" :shadow-v="extend(shadow.blurRadius)" @on-change="setBlurRadius"
                            :tootip="`${t('shadow.blur')}`" @key-down="keydownBlurRadius" :reflush="reflush"
                            @dragstart="dragStart" @dragging="draggingB" @dragend="dragEnd">
                        </ShadowInput>
                        <ShadowInput ticon="S" :shadow-v="extend(shadow.spread)" @on-change="setSpread"
                            :disabled="disabled" :tootip="spare_tip" :reflush="reflush" @dragstart="dragStart"
                            @dragging="draggingS" @dragend="dragEnd" @key-down="keydownSpread">
                        </ShadowInput>
                    </div>
                    <div class="setting">
                        <div class="name-title">{{ t('shadow.color') }}</div>
                        <div class="color">
                            <ColorPicker :color="(shadow.color as Color)" :entrance="'shadow'" :context="props.context"
                                :late="24" @change="(c: Color) => getColorFromPicker(c)" />
                            <input ref="colorShadow" :spellcheck="false" :value="(toHex(shadow.color)).slice(1)"
                                @change="e => onColorChange(e)" @click="colorClick" @blur="is_color_select = false" />
                            <input ref="alphaShadow" style="text-align: right;"
                                :value="filterAlpha(shadow.color.alpha * 100) + '%'" @change="e => onAlphaChange(e)"
                                @click="alphaClick" @blur="is_alpha_select = false"
                                @keydown="e => keydownAlpha(e, filterAlpha(shadow.color.alpha * 100))" />
                        </div>
                    </div>
                </div>
            </template>
        </Popover>
        <teleport to="body">
            <div v-if="tel" class="point" :style="{ top: `${telY - 10}px`, left: `${telX - 10.5}px` }">
            </div>
        </teleport>
    </div>
</template>

<style scoped lang="scss">
.border-detail-container {
    >.popover {
        width: 28px;
        height: 28px;

        .trigger {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: var(--default-radius);

            >img {
                width: 16px;
                height: 16px;
            }
        }

        .trigger:hover {
            background-color: #F5F5F5;
        }

        .options-container {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 12px 12px 0 12px;
            box-sizing: border-box;
            height: 100%;

            >div {
                display: flex;
                align-items: center;
                margin-bottom: 12px;

                >label {
                    flex: 0 0 72px;
                    text-align: left;
                    box-sizing: border-box;
                    font-weight: var(--font-default-bold);
                }

                >.thickness-container {
                    box-sizing: border-box;
                    padding: 0 14px;
                    background-color: var(--input-background);
                    width: calc(100% - 72px);
                    height: var(--default-input-height);
                    border-radius: var(--default-radius);
                    display: flex;
                    align-items: center;

                    >img {
                        cursor: ew-resize;
                        flex: 0 0 24px;
                        height: 24px;
                    }

                    >input {
                        outline: none;
                        border: none;
                        width: calc(100% - 37px);
                        margin-left: var(--default-margin-half);
                        background-color: transparent;
                    }

                    .up_down {
                        width: 10px;
                        height: 100%;

                        >img {
                            width: 10px;
                            height: 10px;
                        }
                    }
                }
            }
        }
    }
}

.color {
    flex: 0 1 140px;
    background-color: var(--input-background);
    height: 100%;
    padding: 0px 8px;
    margin-left: 8px;
    border-radius: var(--default-radius);
    box-sizing: border-box;
    display: flex;
    align-items: center;

    input {
        outline: none;
        border: none;
        box-sizing: border-box;
        background-color: transparent;
        width: 86px;
        margin-left: 8px;
    }

    input+input {
        width: 50px;
    }

    :deep(.color-block > .popover) {
        transform: translateY(-8px);
    }
}

.setting {
    width: 100%;
    height: 32px;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    //justify-content: space-between;

    .name-title {
        width: 24px;
        height: 14px;
        font-family: HarmonyOS Sans;
        font-size: 12px;
        color: #737373;
        margin-right: 14px;
    }
}

.show {
    width: 100%;
    height: 30px;
    display: flex;
    box-sizing: border-box;
    align-items: center;

    .visibility {
        flex: 0 0 18px;
        width: 18px;
        height: 18px;
        background-color: var(--active-color);
        border-radius: var(--default-radius);
        border: 1px solid #d8d8d8;
        box-sizing: border-box;
        color: #ffffff;
        display: flex;
        justify-content: center;
        align-items: center;

        >img {
            width: 60%;
            height: 60%;
        }
    }

    .hidden {
        flex: 0 0 18px;
        width: 18px;
        height: 18px;
        background-color: transparent;
        border-radius: var(--default-radius);
        border: 1px solid #d8d8d8;
        box-sizing: border-box;
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
</style>