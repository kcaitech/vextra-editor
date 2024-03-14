<script setup lang="ts">
import { onMounted, ref, reactive, onUnmounted } from 'vue'
import { ShapeType, RectShape, PathShape, ImageShape, Artboard, adapt2Shape, ShapeView } from '@kcdesign/data';
import IconText from '@/components/common/IconText.vue';
import { debounce, throttle } from 'lodash';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import Tooltip from '@/components/common/Tooltip.vue';
import { hasRadiusShape } from '@/utils/content'
import Radius from './Radius.vue';
import {
    get_actions_constrainer_proportions,
    get_actions_frame_x, get_actions_frame_y,
    get_actions_flip_h,
    get_actions_flip_v,
    is_straight,
    get_xy,
    get_width,
    get_height,
    get_constrainer_proportions,
    get_shapes_rotation
} from '@/utils/attri_setting';
import { watch } from 'vue';
import { format_value as format } from '@/utils/common';
interface Props {
    context: Context
    selectionChange: number
    triggle: any[]
}
interface LayoutOptions {
    s_adapt: boolean
    s_flip: boolean
    s_radius: boolean
    s_length: boolean
}
interface ModelState {
    x: boolean
    y: boolean
    width: boolean
    height: boolean
    rotation: boolean
    flipHorizontal: boolean
    filpVertical: boolean
    radius: boolean
}
const props = defineProps<Props>();
const { t } = useI18n();
const x = ref<number | string>(0);
const y = ref<number | string>(0);
const w = ref<number | string>(0);
const h = ref<number | string>(0);
const rotate = ref<number | string>(0);
const isLock = ref<boolean>(false);
const fix = 2;
const multiRadius = ref(false)
const mixed = t('attr.mixed');
const layout_options: LayoutOptions = reactive({ s_flip: true, s_radius: false, s_adapt: false, s_length: false });
const model_disable_state: ModelState = reactive({ x: false, y: false, width: false, height: false, rotation: false, flipHorizontal: false, filpVertical: false, radius: false });
let { s_flip, s_adapt, s_radius, s_length } = layout_options;
const reflush = ref<number>(0);

function _calc_attri() {
    const selected = props.context.selection.selectedShapes;
    if (!selected.length) {
        return;
    }
    const xy = get_xy(selected, mixed);
    x.value = xy.x;
    y.value = xy.y;
    w.value = get_width(selected, mixed);
    h.value = get_height(selected, mixed);
    isLock.value = get_constrainer_proportions(selected);
    rotate.value = get_shapes_rotation(selected, mixed);
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

function onChangeX(value: string, shapes: ShapeView[]) {
    value = Number
        .parseFloat(value)
        .toFixed(fix);

    const _x: number = Number.parseFloat(value);
    if (isNaN(_x)) {
        return;
    }

    const actions = get_actions_frame_x(shapes, _x);

    const page = props.context.selection.selectedPage;
    if (!page) {
        return;
    }

    const editor = props.context.editor4Page(page);
    editor.modifyShapesX(actions);
}
function onChangeY(value: string, shapes: ShapeView[]) {
    value = Number
        .parseFloat(value)
        .toFixed(fix);

    const _y: number = Number.parseFloat(value);
    if (isNaN(_y)) {
        return;
    }

    const actions = get_actions_frame_y(shapes, _y);
    const page = props.context.selection.selectedPage;
    if (!page) {
        return;
    }

    const editor = props.context.editor4Page(page);
    editor.modifyShapesY(actions);
}
function onChangeW(value: string, shapes: ShapeView[]) {
    value = Number
        .parseFloat(value)
        .toFixed(fix);

    const _w: number = Number.parseFloat(value);
    if (isNaN(_w)) {
        return;
    }

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);

    editor.modifyShapesWidth(shapes.map(s => adapt2Shape(s)), _w);
}
function onChangeH(value: string, shapes: ShapeView[]) {
    value = Number
        .parseFloat(value)
        .toFixed(fix);

    const _h: number = Number.parseFloat(value);
    if (isNaN(_h)) {
        return;
    }

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);

    editor.modifyShapesHeight(shapes.map(s => adapt2Shape(s)), _h);
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
    const selected = props.context.selection.selectedShapes;
    if (selected.length === 1) {
        const e = props.context.editor4Shape((selected[0]));
        e.flipH();
    } else if (selected.length > 1) {
        const page = props.context.selection.selectedPage;
        if (page) {
            const actions = get_actions_flip_h(props.context.selection.selectedShapes);
            const editor = props.context.editor4Page(page);
            editor.shapesFlip(actions);
        }
    }
}
function flipv() {
    if (model_disable_state.filpVertical) {
        return;
    }
    const selected = props.context.selection.selectedShapes;
    if (selected.length === 1) {
        const e = props.context.editor4Shape((selected[0]));
        e.flipV();
    } else if (selected.length > 1) {
        const page = props.context.selection.selectedPage;
        if (page) {
            const actions = get_actions_flip_v(props.context.selection.selectedShapes);
            const editor = props.context.editor4Page(page);
            editor.shapesFlip(actions);
        }
    }
}
function onChangeRotate(value: string, shapes: ShapeView[]) {
    value = Number
        .parseFloat(value)
        .toFixed(fix);

    const newRotate: number = Number.parseFloat(value);

    if (isNaN(newRotate)) {
        return;
    }

    if (!shapes.length) {
        return;
    }

    const page = props.context.selection.selectedPage;
    if (!page) {
        return;
    }

    const editor = props.context.editor4Page(page);

    editor.setShapesRotate(shapes.map(s => adapt2Shape(s)), newRotate);
}
function adapt() {
    props.context
        .editor4Shape((props.context.selection.selectedShapes[0]))
        .adapt();
}
function modify_multi_radius(shape: ShapeView) {
    multiRadius.value = false;
    if (!(shape instanceof PathShape)) {
        return;
    }
    if (!shape.isClosed) {
        return;
    }
    const points = shape.points;
    if (points.length !== 4) {
        return;
    }
    multiRadius.value = true;
}
const RADIUS_SETTING = [
    ShapeType.Rectangle, ShapeType.Artboard,
    ShapeType.Image, ShapeType.Group,
    ShapeType.Path, ShapeType.Path2, ShapeType.Contact,
    ShapeType.BoolShape
];
function layout() {
    reset_layout();
    const selected = props.context.selection.selectedShapes;
    if (selected.length === 1) {
        const shape = selected[0];
        s_radius = hasRadiusShape(shape, RADIUS_SETTING);
        s_adapt = shape.type === ShapeType.Artboard;

        if (s_radius) {
            modify_multi_radius(shape);
        }

        if (shape.type === ShapeType.Cutout) {
            s_flip = false;
        }

        if (is_straight(shape) || shape.type === ShapeType.Contact) {
            s_length = true;
        }
    } else {
        if (selected.find(i => i instanceof RectShape || i instanceof ImageShape || i instanceof Artboard)) {
            s_radius = true;
        }
    }
    reflush.value++;
}
function reset_layout() {
    s_adapt = false;
    s_flip = true;
    s_radius = false;
    s_length = false;
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
        model_disable_state.filpVertical = true, model_disable_state.flipHorizontal = true;
        model_disable_state.radius = false;
    }

    if (is_straight(shape)) {
        model_disable_state.height = true;
    }
}
function reset_model_state() {
    model_disable_state.x = false, model_disable_state.y = false;
    model_disable_state.width = false, model_disable_state.height = false;
    model_disable_state.rotation = false;
    model_disable_state.filpVertical = false, model_disable_state.flipHorizontal = false;
    model_disable_state.radius = false;
}
function all_disable() {
    model_disable_state.x = true, model_disable_state.y = true;
    model_disable_state.width = true, model_disable_state.height = true;
    model_disable_state.rotation = true;
    model_disable_state.filpVertical = true, model_disable_state.flipHorizontal = true;
    model_disable_state.radius = true;
}
function selection_change() {
    update_view();
    calc_attri();
}
const stop1 = watch(() => props.selectionChange, selection_change);
const stop3 = watch(() => props.triggle, v => {
    if (v.includes('layout')) {
        calc_attri();
    }
});

onMounted(selection_change);
onUnmounted(() => {
    stop1();
    stop3();
})
</script>

<template>
    <div class="table">
        <div class="tr" :reflush="reflush">
            <IconText class="td positon" ticon="X" :text="format(x)" @onchange="onChangeX" :disabled="model_disable_state.x"
                :context="context" />
            <IconText class="td positon" ticon="Y" :text="format(y)" @onchange="onChangeY" :disabled="model_disable_state.y"
                :context="context" />
            <div class="adapt" v-if="s_adapt" :title="t('attr.adapt')" @click="adapt">
                <svg-icon icon-class="adapt"></svg-icon>
            </div>
            <div style="width: 32px;height: 32px;" v-else></div>
        </div>
        <div class="tr" :reflush="reflush">
            <IconText class="td frame" ticon="W" :text="format(w)" @onchange="onChangeW"
                :disabled="model_disable_state.width" :context="context" />

            <IconText class="td frame" ticon="H" :text="format(h)" @onchange="onChangeH"
                :disabled="model_disable_state.height" :context="context" />
            <div class="lock" v-if="!s_length" @click="lockToggle" :class="{ 'active': isLock }">
                <svg-icon :icon-class="isLock ? 'lock' : 'unlock'" :class="{ 'active': isLock }"></svg-icon>
            </div>
            <div class="lock grayed" style="background-color: #F4F5F5;opacity: 0.4;" v-else>
                <svg-icon :icon-class="isLock ? 'lock' : 'unlock'" :class="{ 'active': isLock }"></svg-icon>
            </div>
        </div>
        <div class="tr" :reflush="reflush">
            <IconText class="td angle" svgicon="angle" :text="`${rotate}` + `${rotate === mixed ? '' : '°'}`"
                @onchange="onChangeRotate" :frame="{ width: 14, height: 14 }" :disabled="model_disable_state.rotation"
                :context="context" />
            <div class="flip-warpper">
                <Tooltip v-if="s_flip" :content="t('attr.flip_h')" :offset="15">
                    <div :class="{ flip: !model_disable_state.filpVertical, 'flip-disable': model_disable_state.filpVertical }"
                        @click="fliph">
                        <svg-icon icon-class="fliph"></svg-icon>
                    </div>
                </Tooltip>
                <Tooltip v-if="s_flip" :content="t('attr.flip_v')" :offset="15">
                    <div :class="{ flip: !model_disable_state.filpVertical, 'flip-disable': model_disable_state.filpVertical }"
                        @click="flipv">
                        <svg-icon icon-class="flipv"></svg-icon>
                    </div>
                </Tooltip>
            </div>
            <div style="width: 32px;height: 32px;margin-left: 7px"></div>
        </div>
        <Radius v-if="s_radius" :context="context" :disabled="model_disable_state.radius"></Radius>
    </div>
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


        >.icontext {
            background-color: var(--input-background);
        }

        .positon {
            width: 88px;
            height: 32px;
            border-radius: var(--default-radius);
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

            >svg {
                color: #808080;
                width: 14px;
                height: 14px;
            }

            >svg.active {
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

            >svg {
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

            >svg {
                width: 12px;
                height: 12px;
            }
        }

        .flip-warpper {
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

                >svg {
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

                >svg {
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

            >svg {
                transition: 0.3s;
                color: #808080;
                width: 14px;
                height: 14px;
            }

            >svg.active {
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
</style>