<script setup lang="ts">
import { onMounted, ref, reactive, onUnmounted } from 'vue'
import { ShapeType, TextBehaviour, TextShapeView, adapt2Shape } from '@kcdesign/data';
import { debounce, throttle } from 'lodash';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import Tooltip from '@/components/common/Tooltip.vue';
import Radius from './Radius.vue';
import {
    get_actions_constrainer_proportions,
    get_actions_frame_x, get_actions_frame_y,
    is_straight,
    get_xy,
    get_width,
    get_height,
    get_constrainer_proportions,
    get_shapes_rotation,
    get_shapes_angle_counts,
    get_actions_counts,
    showCounts,
    showInnerAngle,
    get_shapes_inner_angle,
    get_actions_inner_angle
} from '@/utils/attri_setting';
import { watch } from 'vue';
import { format_value as format } from '@/utils/common';
import MdNumberInput from "@/components/common/MdNumberInput.vue";
import { LockMouse } from "@/transform/lockMouse";
import { computeString } from "@/utils/content";
import { Attribute } from '@/context/atrribute';
import { flip } from "@/transform/flip";
import { Tool } from "@/context/tool";
import { rotate as __rotate } from "@/transform/rotate"

interface Props {
    context: Context
    selectionChange: number
    trigger: any[]
}

interface LayoutOptions {
    s_adapt: boolean
    s_flip: boolean
    s_radius: boolean
    s_length: boolean
    s_counts: boolean
    s_inner_angle: boolean
}

interface ModelState {
    x: boolean
    y: boolean
    width: boolean
    height: boolean
    rotation: boolean
    flipHorizontal: boolean
    flipVertical: boolean
    radius: boolean
    counts: boolean
    innerAngle: boolean
}

const props = defineProps<Props>();
const { t } = useI18n();
const x = ref<number | string>(0);
const y = ref<number | string>(0);
const w = ref<number | string>(0);
const h = ref<number | string>(0);
const rotate = ref<number | string>(0);
const counts = ref<number | string>(0);
const innerAngle = ref<number | string>(0);
const isLock = ref<boolean>(false);
const fix = 2;
const mixed = t('attr.mixed');
const layout_options: LayoutOptions = reactive({ s_flip: true, s_radius: false, s_adapt: false, s_length: false, s_counts: false, s_inner_angle: false });
const model_disable_state: ModelState = reactive({
    x: false,
    y: false,
    width: false,
    height: false,
    rotation: false,
    flipHorizontal: false,
    flipVertical: false,
    radius: false,
    counts: false,
    innerAngle: false
});
let { s_flip, s_adapt, s_radius, s_length, s_counts, s_inner_angle } = layout_options;

function _calc_attri() {
    const selected = props.context.selection.selectedShapes;
    if (!selected.length) return;
    const xy = get_xy(selected, mixed);
    x.value = xy.x;
    y.value = xy.y;
    w.value = get_width(selected, mixed);
    h.value = get_height(selected, mixed);
    isLock.value = get_constrainer_proportions(selected);
    rotate.value = get_shapes_rotation(selected, mixed);
    counts.value = get_shapes_angle_counts(selected, mixed);
    innerAngle.value = get_shapes_inner_angle(selected, mixed);
}

const calc_attri = throttle(_calc_attri, 60, { trailing: true });

const parentSymbolRef = () => {
    const len = props.context.selection.selectedShapes.length;
    let is_dis = false;
    if (len === 1) {
        const shape = props.context.selection.selectedShapes[0];
        let p = shape.parent;
        while (p && p.type !== ShapeType.Page) {
            if (p.type === ShapeType.SymbolRef) {
                is_dis = true;
            }
            p = p.parent;
        }
    } else if (len > 1) {
        const shapes = props.context.selection.selectedShapes;
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            let p = shape.parent;
            while (p && p.type !== ShapeType.Page) {
                if (p.type === ShapeType.SymbolRef) {
                    is_dis = true;
                    break;
                }
                p = p.parent;
            }
        }
    }
    return is_dis;
}

function _update_view() {
    if (props.context.selection.selectedShapes.length) {
        layout();
        check_model_state();
    }

    if (parentSymbolRef()) {
        all_disable();
    } else {
        check_model_state();
    }
}

const update_view = debounce(_update_view, 200, { leading: true });

function changeX(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const _x: number = Number.parseFloat(value);
    if (isNaN(_x)) return;

    const shapes = props.context.selection.selectedShapes;


    const actions = get_actions_frame_x(shapes, _x);

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);
    editor.modifyShapesX(actions);

    props.context.nextTick(props.context.selection.selectedPage!, () => {
        props.context.tool.notify(Tool.RULE_RENDER_SIM);
    });
}

function changeY(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const _y: number = Number.parseFloat(value);
    if (isNaN(_y)) return;

    const shapes = props.context.selection.selectedShapes;

    const actions = get_actions_frame_y(shapes, _y);
    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);
    editor.modifyShapesY(actions);

    props.context.nextTick(props.context.selection.selectedPage!, () => {
        props.context.tool.notify(Tool.RULE_RENDER_SIM);
    });
}

function changeW(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const _w: number = Number.parseFloat(value);
    if (isNaN(_w)) return;

    const shapes = props.context.selection.selectedShapes;

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);

    editor.modifyShapesWidth(shapes, _w);
    props.context.attr.notify(Attribute.FRAME_CHANGE);

    props.context.nextTick(props.context.selection.selectedPage!, () => {
        props.context.tool.notify(Tool.RULE_RENDER_SIM);
    });
}

function changeH(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const _h: number = Number.parseFloat(value);
    if (isNaN(_h)) {
        return;
    }

    const shapes = props.context.selection.selectedShapes;

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);

    editor.modifyShapesHeight(shapes, _h);
    props.context.attr.notify(Attribute.FRAME_CHANGE);

    props.context.nextTick(props.context.selection.selectedPage!, () => {
        props.context.tool.notify(Tool.RULE_RENDER_SIM);
    });
}

function lockToggle() {
    if (s_length) {
        return;
    }

    const val = !isLock.value;
    const actions = get_actions_constrainer_proportions(props.context.selection.selectedShapes, val);
    const page = props.context.selection.selectedPage;
    if (!page) {
        return;
    }

    const editor = props.context.editor4Page(page);
    editor.setShapesConstrainerProportions(actions);
}

function fliph() {
    if (model_disable_state.flipHorizontal) {
        return;
    }
    flip(props.context, 'Y');
}

function flipv() {
    if (model_disable_state.flipVertical) {
        return;
    }
    flip(props.context, 'X');
}

function changeR(value: string) {
    value = value.split('°').join(''); // 去掉单位

    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const newRotate: number = Number.parseFloat(value);

    if (isNaN(newRotate)) return;

    const shapes = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);

    const transforms = __rotate(shapes, newRotate);

    editor.setShapesRotate(transforms);

    props.context.nextTick(props.context.selection.selectedPage!, () => {
        props.context.tool.notify(Tool.RULE_RENDER_SIM);
    });
}

function changeCounts(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    let count = Number.parseFloat(value);
    if (isNaN(count) || count == counts.value) {
        return;
    }
    if (count < 3) count = 3;
    if (count > 60) count = 60;
    const shapes = props.context.selection.selectedShapes;

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);
    const actions = get_actions_counts(shapes, count);

    editor.modifyShapesAngleCount(actions);
}

function changeInnerAngle(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    let offset: number = Number.parseFloat(value);
    if (isNaN(offset) || offset == innerAngle.value) {
        return;
    }
    if (offset < 0.1) offset = 0.1;
    if (offset > 100) offset = 100;

    const shapes = props.context.selection.selectedShapes;

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);
    const actions = get_actions_inner_angle(shapes, offset / 100);

    editor.modifyShapesInnerAngle(actions);
}

function adapt() {
    props.context
        .editor4Shape((props.context.selection.selectedShapes[0]))
        .adapt();
}

function layout() {
    reset_layout();
    const selected = props.context.selection.selectedShapes;
    if (selected.length === 1) {
        const shape = selected[0];
        s_radius = !!shape.radiusType;
        s_adapt = shape.type === ShapeType.Artboard;
        if (shape.type === ShapeType.Cutout) {
            s_flip = false;
        }
        if (is_straight(shape) || shape.type === ShapeType.Contact) {
            s_length = true;
        }
    } else if (selected.length > 1) {
        s_radius = selected.some(item => !!item.radiusType);
    }
    s_counts = showCounts(selected);
    s_inner_angle = showInnerAngle(selected);
}

function reset_layout() {
    s_adapt = false;
    s_flip = true;
    s_radius = false;
    s_length = false;
    s_counts = false;
    s_inner_angle = false;
}

function check_model_state() {
    reset_model_state();
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length !== 1) {
        return;
    }
    const shape = shapes[0];

    if (shape.type === ShapeType.Contact) {
        model_disable_state.x = true, model_disable_state.y = true;
        model_disable_state.width = true, model_disable_state.height = true;
        model_disable_state.rotation = true;
        model_disable_state.flipVertical = true, model_disable_state.flipHorizontal = true;
        model_disable_state.radius = false;
        model_disable_state.counts = false;
        model_disable_state.innerAngle = false;
    }

    if (is_straight(shape)) {
        model_disable_state.height = true;
    }
}

function reset_model_state() {
    model_disable_state.x = false, model_disable_state.y = false;
    model_disable_state.width = false, model_disable_state.height = false;
    model_disable_state.rotation = false;
    model_disable_state.flipVertical = false, model_disable_state.flipHorizontal = false;
    model_disable_state.radius = false;
    model_disable_state.counts = false;
    model_disable_state.innerAngle = false;
}

function all_disable() {
    model_disable_state.x = true, model_disable_state.y = true;
    model_disable_state.width = true, model_disable_state.height = true;
    model_disable_state.rotation = true;
    model_disable_state.flipVertical = true, model_disable_state.flipHorizontal = true;
    model_disable_state.radius = true;
    model_disable_state.counts = true;
    model_disable_state.innerAngle = true;
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

async function modifyTelDown(e: MouseEvent) {
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
    document.addEventListener("pointerlockchange", pointerLockChange, false);
}

function modifyTelUp() {
    tel.value = false;
    document.exitPointerLock();

    lockMouseHandler?.fulfil();
    lockMouseHandler = undefined;
    document.removeEventListener("pointerlockchange", pointerLockChange, false);
}

const pointerLockChange = () => {
    if (!document.pointerLockElement) {
        modifyTelUp();
    }
}


function dragstart(e: MouseEvent) {
    modifyTelDown(e);
}

function draggingX(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) return;

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }

    lockMouseHandler.executeX(e.movementX);
}

function draggingY(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) {
        return
    }

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }

    lockMouseHandler.executeY(e.movementX);
}

function draggingW(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) return;

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('scaling');
    }

    lockMouseHandler.executeW(e.movementX);
}


function draggingH(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) {
        return
    }

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('scaling');
    }

    lockMouseHandler.executeH(e.movementX);
}

function draggingRotate(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) {
        return
    }

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('rotating');
    }
    lockMouseHandler.executeRotate(e.movementX);
}

function draggingCounts(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) {
        return
    }

    if (isNaN(Number(counts.value)) || e.movementX === 0) return;

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('rotating');
    }
    let count = Number(counts.value) + e.movementX;
    if (count < 3) count = 3;
    if (count > 60) count = 60;
    lockMouseHandler.executeCounts(count);
}

function draggingInnerAngle(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) {
        return
    }

    if (isNaN(Number(innerAngle.value)) || e.movementX === 0) return;

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('rotating');
    }

    lockMouseHandler.executeInnerAngle(e.movementX / 1000);
}

function dragend() {
    modifyTelUp();
}

function dragend2() {
    modifyTelUp();
    props.context.attr.notify(Attribute.FRAME_CHANGE);
}

function formatRotate(rotate: number | string) {
    return rotate + `${rotate === mixed ? '' : '°'}`;
}

let handlerHolder: any = null;
const holderTime = 520;

function initHdl(event: MouseEvent, type: 'rotating' | 'translating' | 'scaling') {
    if (lockMouseHandler || handlerHolder) {
        return;
    }

    lockMouseHandler = new LockMouse(props.context, event);
    lockMouseHandler.createApiCaller(type);
}

function updateHdl() {
    if (!lockMouseHandler) {
        return;
    }

    if (handlerHolder) {
        clearTimeout(handlerHolder);
    }

    handlerHolder = setTimeout(() => {
        lockMouseHandler?.fulfil();
        lockMouseHandler = undefined;
        handlerHolder = null;
    }, holderTime);
}

function wheelX(event: WheelEvent) {
    // 暂缓
    // initHdl(event as MouseEvent, 'translating');
    //
    // let step = event.deltaY > 0 ? 1 : -1;
    // if (event.shiftKey) {
    //     step *= 10;
    // }
    // lockMouseHandler?.executeX(step);
    //
    // updateHdl();
}

function selection_change() {
    update_view();
    calc_attri();
    textBehaviour();
}

const attr_watcher = (t: number) => {
    if (t === Attribute.HOR_HILP) {
        fliph();
    } else if (t === Attribute.VER_HILP) {
        flipv();
    }
}

const textBehaviour = () => {
    const shapes = props.context.selection.selectedShapes;
    const all_text = shapes.every(item => item instanceof TextShapeView);
    if (all_text) {
        model_disable_state.width = false;
        model_disable_state.height = false;
        const fixwh = shapes.some(item => (item as TextShapeView).text.attr?.textBehaviour === TextBehaviour.FixWidthAndHeight);
        if (fixwh) return;
        const fixw = shapes.some(item => (item as TextShapeView).text.attr?.textBehaviour === TextBehaviour.Fixed);
        if (fixw) {
            model_disable_state.height = true;
            return;
        }
        model_disable_state.width = true;
        model_disable_state.height = true;
    }
}

const stop1 = watch(() => props.selectionChange, selection_change);
const stop3 = watch(() => props.trigger, v => {
    if (v.includes('layout')) {
        calc_attri();
    }
    if (v.includes('textBehaviour')) {
        textBehaviour();
    }
});

onMounted(() => {
    selection_change();
    props.context.attr.watch(attr_watcher);
});
onUnmounted(() => {
    props.context.attr.unwatch(attr_watcher);
    stop1();
    stop3();
})
</script>

<template>
<div class="table">
    <div class="tr">
        <MdNumberInput icon="X" draggable :value="format(x)" :disabled="model_disable_state.x" @change="changeX"
                       @dragstart="dragstart" @dragging="draggingX" @dragend="dragend" @wheel="wheelX"></MdNumberInput>
        <MdNumberInput icon="Y" draggable :value="format(y)" @change="changeY" :disabled="model_disable_state.y"
                       @dragstart="dragstart" @dragging="draggingY" @dragend="dragend"></MdNumberInput>
        <div v-if="s_adapt" class="adapt" @click="adapt">
            <Tooltip :content="t('attr.adapt')">
                <svg-icon icon-class="adapt" style="outline: none;"/>
            </Tooltip>
        </div>
        <div v-else style="width: 32px;height: 32px;"></div>
    </div>
    <div class="tr">
        <MdNumberInput icon="W" draggable :value="format(w)" @change="changeW" :disabled="model_disable_state.width"
                       @dragstart="dragstart" @dragging="draggingW" @dragend="dragend2"></MdNumberInput>
        <MdNumberInput icon="H" draggable :value="format(h)" @change="changeH"
                       :disabled="model_disable_state.height" @dragstart="dragstart" @dragging="draggingH"
                       @dragend="dragend2">
        </MdNumberInput>
        <Tooltip :content="t('attr.constrainProportions')">
            <div v-if="!s_length" class="lock" @click="lockToggle" :class="{ 'active': isLock }">
                <svg-icon :icon-class="isLock ? 'lock' : 'lock-open'" :class="{ 'active': isLock }"></svg-icon>
            </div>
            <div v-else class="lock" style="background-color: #F4F5F5;opacity: 0.4; pointer-events: none">
                <svg-icon icon-class="lock-open"></svg-icon>
            </div>
        </Tooltip>
    </div>
    <div class="tr">
        <MdNumberInput icon="angle" draggable :value="formatRotate(rotate)" @change="changeR"
                       :disabled="model_disable_state.rotation" @dragstart="dragstart" @dragging="draggingRotate"
                       @dragend="dragend"></MdNumberInput>
        <div class="flip-wrapper">
            <Tooltip v-if="s_flip" :content="`${t('attr.flip_h')}\u00a0\u00a0Shift H`" :offset="15">
                <div
                    :class="{ flip: !model_disable_state.flipVertical, 'flip-disable': model_disable_state.flipVertical }"
                    @click="fliph">
                    <svg-icon icon-class="fliph"></svg-icon>
                </div>
            </Tooltip>
            <Tooltip v-if="s_flip" :content="`${t('attr.flip_v')}\u00a0\u00a0Shift V`" :offset="15">
                <div
                    :class="{ flip: !model_disable_state.flipVertical, 'flip-disable': model_disable_state.flipVertical }"
                    @click="flipv">
                    <svg-icon icon-class="flipv"></svg-icon>
                </div>
            </Tooltip>
        </div>
        <div style="width: 32px;height: 32px;margin-left: 7px"></div>
    </div>
    <div class="tr" v-if="s_counts">
        <MdNumberInput icon="angle-count" draggable :value="format(counts)" @change="changeCounts"
                       :disabled="model_disable_state.counts" @dragstart="dragstart" @dragging="draggingCounts"
                       @dragend="dragend"></MdNumberInput>
        <MdNumberInput v-if="s_inner_angle" icon="inner-angle" draggable
                       :value="innerAngle === mixed ? mixed : format(innerAngle) + '%'" @change="changeInnerAngle"
                       :disabled="model_disable_state.counts" @dragstart="dragstart" @dragging="draggingInnerAngle"
                       @dragend="dragend"></MdNumberInput>
        <div style="width: 32px;height: 32px;"></div>
    </div>
    <Radius v-if="s_radius" :context="context" :disabled="model_disable_state.radius"></Radius>
</div>
<teleport to="body">
    <div v-if="tel" class="point" :style="{ top: `${telY - 10}px`, left: `${telX - 10.5}px` }">
    </div>
</teleport>
</template>

<style scoped lang="scss">
.ml-24 {
    margin-left: 18px;
}

.table {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    padding: 12px 8px 12px 8px;
    box-sizing: border-box;
    visibility: visible;
    border-bottom: 1px solid #F0F0F0;

    .tr {
        position: relative;
        width: 100%;
        height: 30px;
        align-items: center;
        justify-content: space-between;
        display: flex;
        flex-direction: row;
        margin-bottom: 8px;


        > .icontext {
            background-color: var(--input-background);
        }

        .frame {
            width: 88px;
            height: 32px;
            margin: 0 0;
            border-radius: var(--default-radius);
        }

        .lock {
            height: 32px;
            width: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.1);
            box-sizing: border-box;
            border: 1px solid #F0F0F0;
            padding: 9px;

            > svg {
                color: #808080;
                width: 14px;
                height: 14px;
            }

            > svg.active {
                color: #FFFFFF;
            }
        }

        .lock:hover {
            background: #F4F5F5;
        }

        .lock.active {
            background-color: #1878F5;
            border: 1px solid #1878F5;
        }

        .adapt {
            width: 32px;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.1);
            box-sizing: border-box;
            border: 1px solid #F0F0F0;
            padding: 9px;

            > svg {
                transition: 0.3s;
                width: 14px;
                height: 14px;
                color: #808080;
            }
        }

        .adapt:hover {
            background: #F4F5F5;
        }

        .angle {
            width: 88px;
            height: 32px;
            border-radius: var(--default-radius);

            > svg {
                width: 12px;
                height: 12px;
            }
        }

        .flip-wrapper {
            width: 88px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-left: 7px;

            .flip {
                background-color: var(--input-background);
                display: flex;
                justify-content: center;
                align-items: center;
                width: 40px;
                height: 32px;
                border-radius: var(--default-radius);
                padding: 9px 14px;
                box-sizing: border-box;

                > svg {
                    color: var(--coco-grey);
                    width: 14px;
                    height: 14px;
                }
            }

            .flip:hover {
                background-color: #EBEBEB;
            }

            .flip-disable {
                opacity: 0.4;
                background-color: var(--input-background);
                display: flex;
                justify-content: center;
                align-items: center;
                width: 40px;
                height: 32px;
                border-radius: var(--default-radius);

                > svg {
                    color: var(--coco-grey);
                    width: 40%;
                    height: 40%;
                }
            }
        }

        .active {
            background-color: var(--active-color);
            color: #fff;
        }

        .more-for-radius {
            width: 32px;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.1);
            box-sizing: border-box;
            border: 1px solid #F0F0F0;
            padding: 9px;

            > svg {
                transition: 0.3s;
                color: #808080;
                width: 14px;
                height: 14px;
            }

            > svg.active {
                color: #FFFFFF;
            }
        }

        .more-for-radius:hover {
            background: #F4F5F5;
        }

        .more-for-radius.active {
            background-color: #1878F5;
            border: 1px solid #1878F5;
        }
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