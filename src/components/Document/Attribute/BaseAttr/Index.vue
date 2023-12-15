<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import { Shape, ShapeType, RectShape, GroupShape, PathShape, PathShape2, TextShape } from '@kcdesign/data';
import IconText from '@/components/common/IconText.vue';
import { debounce } from 'lodash';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import Tooltip from '@/components/common/Tooltip.vue';
import { hasRadiusShape } from '@/utils/content'
import {
    get_rotation,
    is_mixed,
    get_actions_constrainer_proportions,
    get_actions_frame_x, get_actions_frame_y,
    get_actions_frame_w, get_actions_frame_h,
    get_actions_flip_h,
    get_actions_flip_v,
    get_straight_line_length
} from '@/utils/attri_setting';
interface Props {
    context: Context
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
const isMoreForRadius = ref<boolean>(false);
const fix = 2;
const points = ref<number>(0);
const radius = ref<{ lt: number | string, rt: number, rb: number, lb: number }>({ lt: 0, rt: 0, rb: 0, lb: 0 });
const multiRadius = ref(false)
const multipleValues = ref<boolean>(false)
const mixed = t('attr.mixed');
const watchedShapes = new Map();
const layout_options: LayoutOptions = reactive({ s_flip: true, s_radius: false, s_adapt: false, s_length: false });
const model_disable_state: ModelState = reactive({ x: false, y: false, width: false, height: false, rotation: false, flipHorizontal: false, filpVertical: false, radius: false });
let { s_flip, s_adapt, s_radius, s_length } = layout_options;
const reflush = ref<number>(0);
function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(calc_attri);
        watchedShapes.delete(k);
    })
    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length > 0) {
        const first = selectedShapes[0];
        watchedShapes.set(first.id, first);
        watchedShapes.forEach((v) => { v.watch(calc_attri); });
    }
}
function calc_attri() {
    const len = props.context.selection.selectedShapes.length;
    if (len === 1) {
        const shape = props.context.selection.selectedShapes[0];
        if (shape.type === ShapeType.Line) {
            w.value = Math.max(get_straight_line_length(shape), 1);
            h.value = 0;
        } else {
            const frame = shape.frame;
            w.value = Math.max(frame.width, 1);
            h.value = Math.max(frame.height, 1);
        }
        const lt = shape.matrix2Root().computeCoord2(0, 0);
        x.value = lt.x;
        y.value = lt.y;
        rotate.value = get_rotation(shape);
        isLock.value = Boolean(shape.constrainerProportions);
    } else if (len > 1) {
        const shape = props.context.selection.selectedShapes[0];
        const lt = shape.matrix2Root().computeCoord2(0, 0);
        const frame = shape.frame;

        const isMixed = is_mixed(props.context.selection.selectedShapes);
        if (x.value !== mixed) x.value = lt.x;
        if (y.value !== mixed) y.value = lt.y;
        if (w.value !== mixed) w.value = Math.max(frame.width, 1);
        if (isMixed.type === 'mixed' || !isMixed.type) {
            if (h.value !== mixed) h.value = Math.max(frame.height, 1);
            if (isMixed.type === 'mixed') {
                model_disable_state.height = true;
            }
        } else {
            h.value = 0;
        }
    }
}

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
    if (props.context.selection.selectedShapes.length > 1) check_mixed();
    if(parentSymbolRef()) {
        all_disable();
    }else {
        check_model_state();
    }
}
const update_view = debounce(_update_view, 200);
// 检查是否多值
function check_mixed() {
    const isMixed = is_mixed(props.context.selection.selectedShapes);
    isMixed.x === 'mixed' ? x.value = mixed : x.value = isMixed.x;
    isMixed.y === 'mixed' ? y.value = mixed : y.value = isMixed.y;
    isMixed.w === 'mixed' ? w.value = mixed : w.value = isMixed.w;
    isMixed.rotate === 'mixed' ? rotate.value = mixed : rotate.value = isMixed.rotate;
    isMixed.constrainerProportions === 'mixed' ? isLock.value = true : isLock.value = (isMixed.constrainerProportions as boolean)!;
    if (isMixed.type === 'mixed' || !isMixed.type) {
        isMixed.h === 'mixed' ? h.value = mixed : h.value = isMixed.h;
        if (isMixed.type === 'mixed') {
            model_disable_state.height = true;
            h.value = mixed
        }
    } else {
        h.value = 0;
        model_disable_state.height = true;
    }
}

function radiusValuesMixed(radius: any) {
    const referenceValue = Object.values(radius)[0];
    for (const value of Object.values(radius)) {
        if (value !== referenceValue) return false;
    }
    return true;
}
function getRectShapeAttr(shape: Shape) {
    points.value = (shape as RectShape).pointsCount || 0;
    if (shape instanceof RectShape) {
        radius.value = (shape as RectShape).getRectRadius();
        if (!radiusValuesMixed(radius.value) && !isMoreForRadius.value) {
            multipleValues.value = true
            radius.value.lt = mixed
        }
    } else if (shape instanceof GroupShape ||
        shape instanceof PathShape ||
        shape instanceof PathShape2 ||
        shape instanceof TextShape) {
        const fixedRadius = shape.fixedRadius ?? 0;
        radius.value.lt = fixedRadius;
        radius.value.lb = fixedRadius;
        radius.value.rt = fixedRadius;
        radius.value.rb = fixedRadius;
    }
}
function onChangeX(value: string) {
    value = Number.parseFloat(value).toFixed(fix);
    const _x: number = Number.parseFloat(value);
    if (isNaN(_x)) return;
    const selected = props.context.selection.selectedShapes;
    if (selected.length === 1) {
        const shape = selected[0];
        const xy = shape.frame2Root();
        const e = props.context.editor4Shape(shape);
        e.translateTo(_x, xy.y);
    } else if (selected.length > 1) {
        const actions = get_actions_frame_x(props.context.selection.selectedShapes, _x);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.arrange(actions);
            check_mixed();
        }
    }
}
function onChangeY(value: string) {
    value = Number.parseFloat(value).toFixed(fix);
    const _y: number = Number.parseFloat(value);
    if (isNaN(_y)) return;
    const selected = props.context.selection.selectedShapes;
    if (selected.length === 1) {
        const shape = selected[0];
        const xy = shape.frame2Root();
        const e = props.context.editor4Shape(shape);
        e.translateTo(xy.x, _y);
    } else if (selected.length > 1) {
        const actions = get_actions_frame_y(props.context.selection.selectedShapes, _y);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.arrange(actions);
            check_mixed();
        }
    }
}
function onChangeW(value: string) {
    if (s_length) {
        set_lines_length(value);
        return;
    }
    value = Number.parseFloat(value).toFixed(fix);
    const _w: number = Number.parseFloat(value);
    if (isNaN(_w)) return;
    const selected = props.context.selection.selectedShapes;
    if (selected.length === 1) {
        const rate = _w / (w.value as number);
        const shape = selected[0];
        if (shape.frame.width.toFixed(fix) != value) {
            const _h = isLock.value ? Number((rate * (h.value as number)).toFixed(fix)) : shape.frame.height;
            const e = props.context.editor4Shape(shape)
            e.expandTo(_w, _h);
        }
    } else if (selected.length > 1) {
        const actions = get_actions_frame_w(props.context.selection.selectedShapes, _w, isLock.value);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFrame(actions);
            check_mixed();
        }
    }
}
function onChangeH(value: string) {
    value = Number.parseFloat(value).toFixed(fix);
    const _h: number = Number.parseFloat(value);
    if (isNaN(_h)) return;
    const selected = props.context.selection.selectedShapes;
    if (selected.length === 1) {
        const rate = _h / (h.value as number);
        const shape = selected[0];
        if (shape.frame.height.toFixed(fix) !== value) {
            const _w = isLock.value ? Number((rate * (w.value as number)).toFixed(fix)) : shape.frame.width;
            const e = props.context.editor4Shape(shape);
            e.expandTo(_w, _h);
        }
    } else if (selected.length > 1) {
        const actions = get_actions_frame_h(props.context.selection.selectedShapes, _h, isLock.value);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFrame(actions);
            check_mixed();
        }
    }
}
function lockToggle() {
    if (s_length) return;
    const val = !isLock.value;
    const actions = get_actions_constrainer_proportions(props.context.selection.selectedShapes, val);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapesConstrainerProportions(actions);
    }
    isLock.value = val;
}
function radiusToggle() {
    isMoreForRadius.value = !isMoreForRadius.value
    if (!isMoreForRadius.value) {
        if (radius.value) {
            let { lt, rt, rb, lb } = radius.value
            if (lt === rt && rb === lb && rt === rb) {
                multipleValues.value = false
            } else {
                multipleValues.value = true
                if (!radiusValuesMixed(radius.value)) {
                    radius.value.lt = mixed
                }
            }
        }
    } else {
        multipleValues.value = false
        const shape = props.context.selection.selectedShapes[0];
        getRectShapeAttr(shape)
    }
}
function fliph() {
    if (model_disable_state.flipHorizontal) return;
    const selected = props.context.selection.selectedShapes;
    if (selected.length === 1) {
        const e = props.context.editor4Shape(selected[0]);
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
    if (model_disable_state.filpVertical) return;
    const selected = props.context.selection.selectedShapes;
    if (selected.length === 1) {
        const e = props.context.editor4Shape(selected[0]);
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
function set_lines_length(value: string) {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    value = Number.parseFloat(value).toFixed(fix);
    const _l: number = Number.parseFloat(value);
    if (isNaN(_l)) return;
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.setLinesLength(selected, _l);
    }
}
function onChangeRotate(value: string) {
    value = Number.parseFloat(value).toFixed(fix);
    const newRotate: number = Number.parseFloat(value);
    if (isNaN(newRotate)) return;
    const selected = props.context.selection.selectedShapes;
    if (selected.length) {
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesRotate(selected, newRotate);
            if (selected.length > 1) check_mixed();
        }
    }
}
const onChangeRadian = (value: string, type: 'rt' | 'lt' | 'rb' | 'lb') => {
    const selected = props.context.selection.selectedShapes.filter(shape => shape.type !== ShapeType.Cutout);
    if (selected.length === 1) {
        const e = props.context.editor4Shape(selected[0]);
        if (isMoreForRadius.value) {
            value = Number.parseFloat(value).toFixed(fix);
            const newRadian: number = Number.parseFloat(value) < Math.min((w.value as number), (h.value as number)) ? Number.parseFloat(value) : Math.min((w.value as number), (h.value as number))
            if (!radius.value) return;
            radius.value[type] = newRadian > 0 ? Number(newRadian.toFixed(fix)) : 0;

            e.setRectRadius(+radius.value.lt, radius.value.rt, radius.value.rb, radius.value.lb);
        } else {
            value = Number.parseFloat(value).toFixed(fix);
            const newRadian: number = Number.parseFloat(value) < (Math.min((w.value as number), (h.value as number)) / 2) ? Number.parseFloat(value) : Math.min((w.value as number), (h.value as number)) / 2
            if (!radius.value) return;
            const fixedRadius = newRadian > 0 ? Number(newRadian.toFixed(fix)) : 0;
            const shape = props.context.selection.selectedShapes[0];
            radius.value.lt = fixedRadius;
            if (shape instanceof RectShape) {
                e.setRectRadius(fixedRadius, fixedRadius, fixedRadius, fixedRadius);
            } else {
                e.setFixedRadius(fixedRadius)
            }
        }
    } else if (selected.length > 1) {
        const page = props.context.selection.selectedPage;
        if (page) {
            const e = props.context.editor4Page(page);
            if (isMoreForRadius.value) {
                value = Number.parseFloat(value).toFixed(fix);
                const newRadian: number = Number.parseFloat(value) < Math.min((w.value as number), (h.value as number)) ? Number.parseFloat(value) : Math.min((w.value as number), (h.value as number))
                if (!radius.value) return;
                radius.value[type] = newRadian > 0 ? Number(newRadian.toFixed(fix)) : 0;
                e.setShapesRadius(selected, +radius.value.lt, radius.value.rt, radius.value.rb, radius.value.lb);
            } else {
                value = Number.parseFloat(value).toFixed(fix);
                const newRadian: number = Number.parseFloat(value) < (Math.min((w.value as number), (h.value as number)) / 2) ? Number.parseFloat(value) : Math.min((w.value as number), (h.value as number)) / 2
                if (!radius.value) return;
                const fixedRadius = newRadian > 0 ? Number(newRadian.toFixed(fix)) : 0;
                e.setShapesRadius(selected, fixedRadius, fixedRadius, fixedRadius, fixedRadius);
            }
        }
    }
}
function adapt() {
    const selected = props.context.selection.selectedShapes;
    if (selected.length === 1 && selected[0].type === ShapeType.Artboard) props.context.editor4Shape(selected[0]).adapt();
}
const RADIUS_SETTING = [
    ShapeType.Rectangle, ShapeType.Artboard,
    ShapeType.Image, ShapeType.Group,
    ShapeType.Path, ShapeType.Path2, ShapeType.Contact,
    ShapeType.Text
];
const MULTI_RADIUS = [ShapeType.Rectangle, ShapeType.Artboard, ShapeType.Image];
const cutout_setting = ref(true);
function layout() {
    s_adapt = false, s_flip = true, s_radius = false, s_length = false;
    cutout_setting.value = true;
    const selected = props.context.selection.selectedShapes;
    if (selected.length === 1) {
        const shape = selected[0];
        s_radius = hasRadiusShape(shape, RADIUS_SETTING), s_adapt = shape.type === ShapeType.Artboard;
        if (s_radius) {
            multiRadius.value = MULTI_RADIUS.includes(shape.type);
            getRectShapeAttr(shape);
        }
        if (shape.type === ShapeType.Table) s_flip = false;
        if (shape.type === ShapeType.Line || shape.type === ShapeType.Contact) s_length = true;
        if(shape.type === ShapeType.Cutout) cutout_setting.value = false;
    } else {
        if (selected.find(i => i instanceof RectShape)) s_radius = true;
    }
    reflush.value++;
}
function check_model_state() {
    reset_model_state();
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length !== 1) return;
    const shape = shapes[0];
    if (shape.type === ShapeType.Contact) {
        model_disable_state.x = true, model_disable_state.y = true;
        model_disable_state.width = true, model_disable_state.height = true;
        model_disable_state.rotation = true;
        model_disable_state.filpVertical = true, model_disable_state.flipHorizontal = true;
        model_disable_state.radius = false;
    }
    if (shape.type === ShapeType.Line) {
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
function workspace_watcher(t?: any) {
    if (t === WorkSpace.CLAC_ATTRI) check_mixed();
}
function selection_wather(t: any) {
    if (t === Selection.CHANGE_PAGE || t === Selection.CHANGE_SHAPE) {
        watch_shapes();
        update_view();
        calc_attri();
    }
}

// hooks
onMounted(() => {
    watch_shapes();
    update_view();
    calc_attri();
    props.context.selection.watch(selection_wather);
    props.context.workspace.watch(workspace_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
    props.context.workspace.unwatch(workspace_watcher);
})
</script>

<template>
    <div class="table">
        <div class="tr">
            <IconText class="positon" ticon="X" :text="typeof (x) === 'number' ? x.toFixed(fix) : x" @onchange="onChangeX"
                :disabled="model_disable_state.x" :context="context" />
            <IconText class="positon" ticon="Y" :text="typeof (y) === 'number' ? y.toFixed(fix) : y" @onchange="onChangeY"
                :disabled="model_disable_state.y" :context="context" />
            <div class="adapt" v-if="s_adapt" :title="t('attr.adapt')" @click="adapt">
                <svg-icon icon-class="adapt"></svg-icon>
            </div>
            <div style="width: 32px;height: 32px;" v-else></div>
        </div>
        <div class="tr" :reflush="reflush">
            <IconText class="frame" ticon="W" :text="typeof (w) === 'number' ? w.toFixed(fix) : w" @onchange="onChangeW"
                :disabled="model_disable_state.width" :context="context" />

            <IconText class="frame" ticon="H" :text="typeof (h) === 'number' ? h.toFixed(fix) : h" @onchange="onChangeH"
                      :disabled="model_disable_state.height"  :context="context"/>
            <div class="lock" v-if="!s_length" @click="lockToggle" :class="{ 'active': isLock }">
                <svg-icon :icon-class="isLock ? 'lock' : 'unlock'" :class="{ 'active': isLock }"></svg-icon>
            </div>
            <div class="lock grayed" style="background-color: #F4F5F5;opacity: 0.4;" v-else>
                <svg-icon :icon-class="isLock ? 'lock' : 'unlock'" :class="{ 'active': isLock }"></svg-icon>
            </div>
        </div>
        <div class="tr" :reflush="reflush">
            <IconText class="angle" svgicon="angle" :text="`${rotate}` + '°'" @onchange="onChangeRotate"
                :frame="{ width: 14, height: 14 }" :disabled="model_disable_state.rotation" :context="context" />
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
            <div style="width: 32px;height: 32px;"></div>
        </div>
        <div class="tr" v-if="s_radius" :reflush="reflush">
            <IconText class="frame" svgicon="radius" :multipleValues="multipleValues" :text="radius?.lt || 0"
                :frame="{ width: 12, height: 12 }" @onchange="e => onChangeRadian(e, 'lt')"
                :disabled="model_disable_state.radius" :context="context" />
            <div class="frame ml-24" v-if="!isMoreForRadius"></div>
            <IconText v-if="isMoreForRadius" class="frame ml-24" svgicon="radius" :text="radius?.rt || 0"
                :frame="{ width: 12, height: 12, rotate: 90 }" @onchange="e => onChangeRadian(e, 'rt')"
                :context="context" />
            <div class="more-for-radius" @click="radiusToggle" v-if="s_radius && multiRadius"
                :class="{ 'active': isMoreForRadius }">
                <svg-icon :icon-class="isMoreForRadius ? 'more-for-radius' : 'more-for-radius'"
                    :class="{ 'active': isMoreForRadius }"></svg-icon>
            </div>
        </div>
        <div class="tr" v-if="isMoreForRadius">
            <IconText class="frame" svgicon="radius" :text="radius?.lb || 0" :frame="{ width: 12, height: 12, rotate: 270 }"
                @onchange="e => onChangeRadian(e, 'lb')" :context="context" />
            <IconText class="frame ml-24" svgicon="radius" :text="radius?.rb || 0"
                :frame="{ width: 12, height: 12, rotate: 180 }" @onchange="e => onChangeRadian(e, 'rb')"
                :context="context" />
            <div style="width: 32px;height: 32px;"></div>
        </div>
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