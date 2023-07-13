<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect, computed } from 'vue'
import { Shape, ShapeType, RectShape } from '@kcdesign/data';
import IconText from '@/components/common/IconText.vue';
import Position from './PopoverMenu/Position.vue';
import RadiusForIos from './PopoverMenu/RadiusForIos.vue';
import { Context } from '@/context';
import { RectRadius } from '@kcdesign/data'
import { cloneDeep, debounce, throttle } from 'lodash';
import { useI18n } from 'vue-i18n';
import { Selection } from '@/context/selection';
import {
    is_mixed,
    get_actions_constrainer_proportions,
    get_actions_frame_x, get_actions_frame_y,
    get_actions_frame_w, get_actions_frame_h,
    get_actions_rotate,
    get_actions_flip_h,
    get_actions_flip_v
} from '@/utils/attri_setting';
import { WorkSpace } from '@/context/workspace';
interface Props {
    shapes: Shape[]
    context: Context
}
const props = defineProps<Props>();
const editor = computed(() => {
    return props.context.editor4Shape(props.shapes[0]);
})
const len = computed<number>(() => props.shapes.length);
const { t } = useI18n();
const reflush = ref(0);
function shapesWatcher() {
    reflush.value++;
    _calcFrame();
}
const shapeType = ref<ShapeType>();
const x = ref<number | string>(0);
const y = ref<number | string>(0);
const w = ref<number | string>(0);
const h = ref<number | string>(0);
const rotate = ref<number | string>(0);
const isLock = ref<boolean>(false);
const isMoreForRadius = ref<boolean>(false);
const fix = 2;
const points = ref<number>(0);
const radius = ref<RectRadius>();
const showRadius = ref<boolean>(false)
const showRadian = ref<boolean>(false)
const isFlippedHorizontal = ref<boolean>()
const isFlippedVertical = ref<boolean>()
const shwoAdapt = ref<boolean>(false)
const multipleValues = ref<boolean>(false)
const mixed = t('attr.mixed');
const watchedShapes = new Map();
function watchShapes() {
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.hoveredShape) {
        needWatchShapes.set(selection.hoveredShape.id, selection.hoveredShape);
    }
    if (selection.selectedShapes.length > 0) {
        selection.selectedShapes.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(shapesWatcher);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(shapesWatcher);
        watchedShapes.set(k, v);
    })
}
function _calcFrame() {
    if (len.value === 1) {
        const shape = props.shapes[0];
        const xy = shape.frame2Root();
        const frame = shape.frame;
        x.value = xy.x;
        y.value = xy.y;
        w.value = Math.max(frame.width, 1);
        h.value = Math.max(frame.height, 1);
        rotate.value = Number(shape.rotation?.toFixed(2)) || 0;
        isFlippedHorizontal.value = Boolean(shape.isFlippedHorizontal);
        isFlippedVertical.value = Boolean(shape.isFlippedVertical);
        isLock.value = Boolean(shape.constrainerProportions);
    } else if (len.value > 1) {
        const shape = props.shapes[0];
        const xy = shape.frame2Root();
        const frame = shape.frame;
        if (x.value !== mixed) {
            x.value = xy.x;
        }
        if (y.value !== mixed) {
            y.value = xy.y;
        }
        if (w.value !== mixed) {
            w.value = Math.max(frame.width, 1);
        }
        if (h.value !== mixed) {
            h.value = Math.max(frame.height, 1);
        }
    }
}
const calcFrame = throttle(_calcFrame, 100);
function _update_view() {
    watchShapes();
    layout();
    check_mixed();
}
const update_view = debounce(_update_view, 200);
function selection_wather(t: any) {
    if ([Selection.CHANGE_PAGE, Selection.CHANGE_SHAPE].includes(t)) {
        update_view();
    }
}
function check_mixed() {
    const isMixed = is_mixed(props.shapes);
    isMixed.x === 'mixed' ? x.value = mixed : x.value = isMixed.x;
    isMixed.y === 'mixed' ? y.value = mixed : y.value = isMixed.y;
    isMixed.w === 'mixed' ? w.value = mixed : w.value = isMixed.w;
    isMixed.h === 'mixed' ? h.value = mixed : h.value = isMixed.h;
    isMixed.rotate === 'mixed' ? rotate.value = mixed : rotate.value = isMixed.rotate;
    isMixed.constrainerProportions === 'mixed' ? isLock.value = true : isLock.value = (isMixed.constrainerProportions as boolean)!
}
function getRectShapeAttr(shape: Shape) {
    points.value = (shape as RectShape).pointsCount || 0;
    const r = new RectRadius(0, 0, 0, 0);
    radius.value = (shape as RectShape).fixedRadius || r;
}
function onChangeX(value: string) {
    value = Number.parseFloat(value).toFixed(fix);
    const _x: number = Number.parseFloat(value);
    if (isNaN(_x)) return;
    if (len.value === 1) {
        const shape = props.shapes[0];
        if (shape.frame.x.toFixed(fix) != value) {
            const xy = shape.frame2Root();
            editor.value.translateTo(_x, xy.y);
        }
    } else if (len.value > 1) {
        const actions = get_actions_frame_x(props.shapes, _x);
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
    if (len.value === 1) {
        const shape = props.shapes[0];
        if (shape.frame.y.toFixed(fix) != value) {
            const xy = shape.frame2Root();
            editor.value.translateTo(xy.x, _y);
        }
    } else if (len.value > 1) {
        const actions = get_actions_frame_y(props.shapes, _y);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.arrange(actions);
            check_mixed();
        }
    }
}
function onChangeW(value: string) {
    value = Number.parseFloat(value).toFixed(fix);
    const _w: number = Number.parseFloat(value);
    if (isNaN(_w)) return editor.value.expandTo((w.value as number), (h.value as number));
    if (len.value === 1) {
        const rate = _w / (w.value as number);
        const shape = props.shapes[0];
        if (shape.frame.width.toFixed(fix) != value) {
            const _h = isLock.value ? Number((rate * (h.value as number)).toFixed(fix)) : shape.frame.height;
            editor.value.expandTo(_w, _h);
        }
    } else if (len.value > 1) {
        const actions = get_actions_frame_w(props.shapes, _w, isLock.value);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFrame(actions);
            check_mixed();
        }
    }
    if(props.shapes[0].type === ShapeType.Text) {
        props.context.selection.notify(Selection.CHANGE_TEXT)
    }
}
function onChangeH(value: string) {
    value = Number.parseFloat(value).toFixed(fix);
    const _h: number = Number.parseFloat(value);
    if (isNaN(_h)) return editor.value.expandTo((w.value as number), (h.value as number));
    if (len.value === 1) {
        const rate = _h / (h.value as number);
        const shape = props.shapes[0];
        if (shape.frame.height.toFixed(fix) !== value) {
            const _w = isLock.value ? Number((rate * (w.value as number)).toFixed(fix)) : shape.frame.width;
            editor.value.expandTo(_w, _h);
        }
    } else if (len.value > 1) {
        const actions = get_actions_frame_h(props.shapes, _h, isLock.value);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFrame(actions);
            check_mixed();
        }
    }
    if(props.shapes[0].type === ShapeType.Text) {
        props.context.selection.notify(Selection.CHANGE_TEXT)
    }
}
function lockToggle() {
    const val = !isLock.value;
    const actions = get_actions_constrainer_proportions(props.shapes, val);
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
            let { rlb, rlt, rrb, rrt } = radius.value
            if (rlt === rlb && rlt === rrb && rlt === rrt) {
                multipleValues.value = false
            } else {
                multipleValues.value = true
            }
        }
    } else {
        multipleValues.value = false
    }

}
function fliph() {
    if (len.value === 1) {
        editor.value.flipH();
    } else if (len.value > 1) {
        const page = props.context.selection.selectedPage;
        if (page) {
            const actions = get_actions_flip_h(props.shapes);
            const editor = props.context.editor4Page(page);
            editor.shapesFlip(actions);
        }
    }
}
function flipv() {
    if (len.value === 1) {
        editor.value.flipV();
    } else if (len.value > 1) {
        const page = props.context.selection.selectedPage;
        if (page) {
            const actions = get_actions_flip_v(props.shapes);
            const editor = props.context.editor4Page(page);
            editor.shapesFlip(actions);
        }
    }
}
function onChangeRotate(value: string) {
    value = Number.parseFloat(value).toFixed(fix);
    const newRotate: number = Number.parseFloat(value);
    if (isNaN(newRotate)) return editor.value.rotate(rotate.value as number);
    if (len.value === 1) {
        editor.value.rotate(newRotate);
    } else if (len.value > 1) {
        const actions = get_actions_rotate(props.shapes, newRotate);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesRotate(actions);
            check_mixed();
        }
    }
}
const onChangeRadian = (value: string, type: 'rrt' | 'rlt' | 'rrb' | 'rlb') => {
    if (len.value === 1) {
        if (isMoreForRadius.value) {
            value = Number.parseFloat(value).toFixed(fix);
            const newRadian: number = Number.parseFloat(value) < Math.min((w.value as number), (h.value as number)) ? Number.parseFloat(value) : Math.min((w.value as number), (h.value as number))
            if (!radius.value) return;
            const newR = cloneDeep(radius.value);
            newR[type] = newRadian > 0 ? Number(newRadian.toFixed(fix)) : 0;
            editor.value.setRadius(newR);
        } else {
            value = Number.parseFloat(value).toFixed(fix);
            const newRadian: number = Number.parseFloat(value) < (Math.min((w.value as number), (h.value as number)) / 2) ? Number.parseFloat(value) : Math.min((w.value as number), (h.value as number)) / 2
            if (!radius.value) return;
            const newR = cloneDeep(radius.value);
            newR['rrt'] = newRadian > 0 ? Number(newRadian.toFixed(fix)) : 0;
            newR['rlt'] = newRadian > 0 ? Number(newRadian.toFixed(fix)) : 0;
            newR['rrb'] = newRadian > 0 ? Number(newRadian.toFixed(fix)) : 0;
            // newR['rlb'] = newRadian > 0 ? newRadian.toFixed(fix) : 0;
            editor.value.setRadius(newR);
        }
    } else {
        // todo
    }
}
function adapt() {
    if (len.value === 1) {
        editor.value.adapt();
    }
}
const RADIUS_SETTING = [ShapeType.Rectangle, ShapeType.Artboard];
const DE_RADIAN_SETTING = [ShapeType.Line, ShapeType.Oval];
function layout() {
    if (len.value === 1) {
        const shape = props.shapes[0];
        showRadius.value = RADIUS_SETTING.includes(shape.type);
        showRadian.value = DE_RADIAN_SETTING.includes(shape.type);
        shwoAdapt.value = shape.type === ShapeType.Artboard;
        shapeType.value = shape.type;
        if (shapeType.value === ShapeType.Rectangle) {
            getRectShapeAttr(shape);
        }
    }
}
function workspace_watcher(t?: any) {
    if (t === WorkSpace.CLAC_ATTRI) {
        check_mixed();
    }
}
// hooks
onMounted(() => {
    calcFrame();
    layout();
    watchShapes();
    check_mixed();
    props.context.selection.watch(selection_wather);
    props.context.workspace.watch(workspace_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
    props.context.workspace.unwatch(workspace_watcher);
})
watchEffect(shapesWatcher);
</script>

<template>
    <div class="table" :reflush="reflush">
        <div class="tr">
            <IconText class="td positon" ticon="X" :text="typeof (x) === 'number' ? x.toFixed(fix) : x"
                @onchange="onChangeX" />
            <div class="space"></div>
            <IconText class="td positon" ticon="Y" :text="typeof (y) === 'number' ? y.toFixed(fix) : y"
                @onchange="onChangeY" />
            <Position :context="props.context" :shape="props.shapes[0]"></Position>
        </div>
        <div class="tr">
            <IconText class="td frame" ticon="W" :text="typeof (w) === 'number' ? w.toFixed(fix) : w"
                @onchange="onChangeW" />
            <div class="lock" @click="lockToggle">
                <svg-icon :icon-class="isLock ? 'lock' : 'unlock'"></svg-icon>
            </div>
            <IconText class="td frame" ticon="H" :text="typeof (h) === 'number' ? h.toFixed(fix) : h"
                @onchange="onChangeH" />
            <div class="adapt" v-if="shwoAdapt" :title="t('attr.adapt')" @click="adapt">
                <svg-icon icon-class="adapt"></svg-icon>
            </div>
            <div style="width: 22px;height: 22px;;" v-else></div>
        </div>
        <div class="tr">
            <IconText class="td angle" svgicon="angle" :text="`${rotate}` + '°'" @onchange="onChangeRotate"
                :frame="{ width: 14, height: 14 }" />
            <div class="flip ml-24" @click="fliph" :class="{ active: isFlippedHorizontal }">
                <svg-icon icon-class="fliph"></svg-icon>
            </div>
            <div class="flip ml-12" @click="flipv" :class="{ active: isFlippedVertical }">
                <svg-icon icon-class="flipv"></svg-icon>
            </div>
            <div style="width: 22px;height: 22px;;"></div>
        </div>
        <div class="tr" v-if="showRadius">
            <IconText class="td frame" svgicon="radius" :multipleValues="multipleValues" :text="radius?.rlt || 0"
                :frame="{ width: 12, height: 12 }" @onchange="e => onChangeRadian(e, 'rlt')" />
            <div class="td frame ml-24" v-if="!isMoreForRadius"></div>
            <IconText v-if="isMoreForRadius" class="td frame ml-24" svgicon="radius" :text="radius?.rrt || 0"
                :frame="{ width: 12, height: 12, rotate: 90 }" @onchange="e => onChangeRadian(e, 'rrt')" />
            <div class="more-for-radius" @click="radiusToggle" v-if="showRadius">
                <svg-icon :icon-class="isMoreForRadius ? 'more-for-radius' : 'more-for-radius'"></svg-icon>
            </div>
        </div>
        <div class="tr" v-if="isMoreForRadius">
            <IconText class="td frame" svgicon="radius" :text="radius?.rlb || 0"
                :frame="{ width: 12, height: 12, rotate: 270 }" @onchange="e => onChangeRadian(e, 'rlb')" />
            <IconText class="td frame ml-24" svgicon="radius" :text="radius?.rrb || 0"
                :frame="{ width: 12, height: 12, rotate: 180 }" @onchange="e => onChangeRadian(e, 'rrb')" />
            <RadiusForIos :context="props.context"></RadiusForIos>
        </div>
    </div>
</template>

<style scoped lang="scss">
.ml-24 {
    margin-left: 18px;
}

.ml-12 {
    margin-left: 5px;
}

.table {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 0px 10px 12px 10px;
    box-sizing: border-box;
    visibility: visible;

    .tr {
        position: relative;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        display: flex;
        flex-direction: row;
        margin: 8px 0;

        .space {
            width: 18px;
        }

        >.icontext {
            background-color: rgba(#D8D8D8, 0.4);
        }

        .positon {
            width: 95px;
            height: 30px;
            border-radius: 8px;
        }

        .frame {
            width: 95px;
            height: 30px;
            border-radius: 8px;
        }

        .lock {
            height: 18px;
            width: 18px;
            display: flex;
            justify-content: center;
            align-items: center;

            >svg {
                color: grey;
                width: 100%;
                height: 100%;
            }
        }

        .adapt {
            width: 22px;
            height: 22px;
            display: flex;
            justify-content: center;
            align-items: center;

            >svg {
                transition: 0.3s;
                width: 50%;
                height: 50%;
            }

            >svg:hover {
                transform: scale(1.25);
            }
        }

        .angle {
            height: 30px;
            width: 95px;
            border-radius: 8px;

            >svg {
                width: 12px;
                height: 12px;
            }
        }

        .flip {
            background-color: rgba(#D8D8D8, 0.4);
            display: flex;
            justify-content: center;
            align-items: center;
            width: 45px;
            height: 30px;
            border-radius: 8px;

            >svg {
                color: var(--coco-grey);
                width: 40%;
                height: 40%;
            }
        }

        .active {
            background-color: var(--active-color);
            color: #fff;
        }

        .more-for-radius {
            width: 22px;
            height: 22px;
            display: flex;
            justify-content: center;
            align-items: center;

            >svg {
                transition: 0.3s;
                width: 50%;
                height: 50%;
            }

            >svg:hover {
                transform: scale(1.25);
            }
        }

    }

    .add {
        width: 16px;
        height: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 192px;

        >svg {
            width: 90%;
            height: 90%;
        }
    }
}
</style>