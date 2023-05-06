<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, ref, watch, onUpdated } from 'vue'
import { Shape, ShapeType, RectShape } from '@kcdesign/data/data/shape';
import IconText from '@/components/common/IconText.vue';
import Position from './PopoverMenu/Position.vue';
import RadiusForIos from './PopoverMenu/RadiusForIos.vue';
import { Context } from '@/context';
import { computed } from '@vue/reactivity';
import { RectRadius } from '@kcdesign/data/data/baseclasses'
import { cloneDeep } from 'lodash';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ context: Context, shape: Shape }>();
const editor = computed(() => {
    return props.context.editor4Shape(props.shape);
})
const { t } = useI18n();
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
    calcFrame();
}
const shapeType = ref<ShapeType>();
const x = ref<number>(0);
const y = ref<number>(0);
const w = ref<number>(0);
const h = ref<number>(0);
const rotate = ref<number>(0);
const isLock = ref<boolean>(true);
const isMoreForRadius = ref<boolean>(false);
const fix = 2;
const points = ref<number>(0);
const radius = ref<RectRadius>();
const showRadius = ref<boolean>(false)
const showRadian = ref<boolean>(false)
const showBgFlipH = ref<boolean>()
const showBgColorV = ref<boolean>()
const shwoAdapt = ref<boolean>(false)

function calcFrame() {
    const xy = props.shape.realXY();
    x.value = xy.x;
    y.value = xy.y;
    const frame = props.shape.frame;
    w.value = Math.max(frame.width, 1);
    h.value = Math.max(frame.height, 1);
    rotate.value = Number(props.shape.rotation?.toFixed(2)) || 0;
    shapeType.value = props.shape.type;
    showBgFlipH.value = props.shape.isFlippedHorizontal;
    showBgColorV.value = props.shape.isFlippedVertical;
    if (shapeType.value === 'rectangle') {
        getRectShapeAttr(props.shape);
    }
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
    if (props.shape.frame.x.toFixed(fix) != value && props.context.selection.selectedPage) {
        const xy = props.shape.realXY();
        editor.value.translateTo(_x, xy.y);
    }
}
function onChangeY(value: string) {
    value = Number.parseFloat(value).toFixed(fix);
    const y: number = Number.parseFloat(value);
    if (isNaN(y)) return;
    if (props.shape.frame.y.toFixed(fix) != value && props.context.selection.selectedPage) {
        const xy = props.shape.realXY();
        editor.value.translateTo(xy.x, y);
    }
}
function onChangeW(value: string) {
    value = Number.parseFloat(value).toFixed(fix);
    const newW: number = Number.parseFloat(value);
    if (isNaN(newW)) return editor.value.expandTo(w.value, h.value);
    const rate = newW / w.value;
    if (props.shape.frame.width.toFixed(fix) != value && props.context.selection.selectedPage) {
        const newH = isLock.value ? Number((rate * h.value).toFixed(fix)) : props.shape.frame.height;
        editor.value.expandTo(newW, newH);
    }
}
function onChangeH(value: string) {
    value = Number.parseFloat(value).toFixed(fix);
    const newH: number = Number.parseFloat(value);
    if (isNaN(newH)) return editor.value.expandTo(w.value, h.value);
    const rate = newH / h.value;
    if (props.shape.frame.height.toFixed(fix) != value && props.context.selection.selectedPage) {
        const newW = isLock.value ? Number((rate * w.value).toFixed(fix)) : props.shape.frame.width;
        editor.value.expandTo(newW, newH);
    }
}
function lockToggle() {
    isLock.value = !isLock.value;
}
function radiusToggle() {
    isMoreForRadius.value = !isMoreForRadius.value
}

function fliph() {
    editor.value.flipH();
}
function flipv() {
    editor.value.flipV();
}

function onChangeRotate(value: string) {
    value = Number.parseFloat(value).toFixed(fix);
    const newRotate: number = Number.parseFloat(value);
    if (isNaN(newRotate)) return editor.value.rotate(rotate.value);
    editor.value.rotate(newRotate);
}

const onChangeRadian = (value: string, type: 'rrt' | 'rlt' | 'rrb' | 'rlb') => {
    if(isMoreForRadius.value) {
        value = Number.parseFloat(value).toFixed(fix);
        const newRadian: number = Number.parseFloat(value) < Math.min(w.value, h.value) ? Number.parseFloat(value) :Math.min(w.value, h.value)
        if (!radius.value) return;
        const newR = cloneDeep(radius.value);
        newR[type] = newRadian > 0 ? newRadian.toFixed(fix) : 0;
        editor.value.setRadius(newR);
    }else {
        value = Number.parseFloat(value).toFixed(fix);
        const newRadian: number = Number.parseFloat(value) < (Math.min(w.value, h.value) / 2) ? Number.parseFloat(value) :Math.min(w.value, h.value) / 2
        if (!radius.value) return;
        const newR = cloneDeep(radius.value);
        newR['rrt'] = newRadian > 0 ? newRadian.toFixed(fix) : 0;
        newR['rlt'] = newRadian > 0 ? newRadian.toFixed(fix) : 0;
        newR['rrb'] = newRadian > 0 ? newRadian.toFixed(fix) : 0;
        // newR['rlb'] = newRadian > 0 ? newRadian.toFixed(fix) : 0;
        editor.value.setRadius(newR);
    }
}

function adapt() {
    editor.value.adapt();
}

const radiusArr = ['rect-shape', 'artboard']
const radianArr = ['line-shape', 'oval-shape']
onUpdated(() => {
    if (radiusArr.includes(props.shape.typeId)) {
        showRadius.value = true
    } else {
        showRadius.value = false
    }

    if (radianArr.includes(props.shape.typeId)) {
        showRadian.value = false
    } else {
        showRadian.value = true
    }
    if(props.shape.typeId === 'artboard') {
        shwoAdapt.value = true
    }else {
        shwoAdapt.value = false
    }
    
    
})

// hooks
const stopWatchShape = watch(() => props.shape, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
    calcFrame();
})

onMounted(() => {
    calcFrame();
    props.shape.watch(watcher);
})
onUnmounted(() => {
    props.shape.unwatch(watcher);
    stopWatchShape();
})

</script>

<template>
    <div class="table" :reflush="reflush">
        <div class="tr">
            <IconText class="td positon" ticon="X" :text="x.toFixed(fix)" @onchange="onChangeX" />
            <div class="space"></div>
            <IconText class="td positon" ticon="Y" :text="y.toFixed(fix)" @onchange="onChangeY" />
            <Position :context="props.context" :shape="props.shape"></Position>
        </div>
        <div class="tr">
            <IconText class="td frame" ticon="W" :text="w.toFixed(fix)" @onchange="onChangeW" />
            <div class="lock" @click="lockToggle">
                <svg-icon :icon-class="isLock ? 'lock' : 'unlock'"></svg-icon>
            </div>
            <IconText class="td frame" ticon="H" :text="h.toFixed(fix)" @onchange="onChangeH" />
            <div class="adapt" v-if="shwoAdapt" :title="t('attr.adapt')" @click="adapt">
                <svg-icon icon-class="adapt"></svg-icon>
            </div>
        </div>
        <div class="tr">
            <IconText class="td angle" svgicon="angle" :text="`${rotate}`+'°'" @onchange="onChangeRotate"
                :frame="{ width: 14, height: 14 }" />
            <div class="flip ml-24" @click="fliph" :class="{ bgColor: showBgFlipH }">
                <svg-icon icon-class="fliph"></svg-icon>
            </div>
            <div class="flip ml-12" @click="flipv" :class="{ bgColor: showBgColorV }">
                <svg-icon icon-class="flipv"></svg-icon>
            </div>
        </div>
        <div class="tr" v-if="showRadius">
            <IconText class="td frame" svgicon="radius" :text="radius?.rlt || 0" :frame="{ width: 12, height: 12 }"
                @onchange="e => onChangeRadian(e, 'rlt')" />
            <div class="td frame ml-24" v-if="!isMoreForRadius"></div>
            <IconText v-if="isMoreForRadius" class="td frame ml-24" svgicon="radius" :text="radius?.rrt || 0" :frame="{ width: 12, height: 12, rotate: 90 }"
                 @onchange="e => onChangeRadian(e, 'rrt')" />
            <div class="more-for-radius" @click="radiusToggle" v-if="showRadius">
                <svg-icon :icon-class="isMoreForRadius ? 'more-for-radius' : 'more-for-radius'"></svg-icon>
            </div>
        </div>
        <div class="tr" v-if="isMoreForRadius">
            <IconText class="td frame" svgicon="radius" :text="radius?.rlb || 0" :frame="{ width: 12, height: 12, rotate: 270 }"
                @onchange="e => onChangeRadian(e, 'rlb')" />
            <IconText class="td frame ml-24" svgicon="radius" :text="radius?.rrb || 0" :frame="{ width: 12, height: 12, rotate: 180 }"
                @onchange="e => onChangeRadian(e, 'rrb')" />
            <RadiusForIos :context="props.context"></RadiusForIos>
        </div>
        <!-- <div class="tr" v-if="shapeType === 'rectangle'">
                <IconText
                    class="td frame"
                    svgicon="points"
                    :text="points"
                    :frame="{ width: 12, height: 12 }"
                    @onchange="onChangeW"
                />
            </div> -->
    </div>
</template>

<style scoped lang="scss">
.ml-24 {
    margin-left: 24px;
}

.ml-12 {
    margin-left: 12px;
}

.table {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 24px;
    box-sizing: border-box;
    visibility: visible;

    .tr {
        position: relative;
        width: 100%;
        align-items: center;
        display: flex;
        flex-direction: row;
        margin: 8px 0;

        .space {
            width: 24px;
        }

        >.icontext {
            background-color: rgba(#D8D8D8, 0.4);
        }

        .positon {
            width: 110px;
            height: 32px;
            border-radius: 8px;
        }

        .frame {
            width: 110px;
            height: 32px;
            border-radius: 8px;
        }

        .lock {
            height: 32px;
            width: 24px;
            display: flex;
            justify-content: center;
            align-items: center;

            >svg {
                width: 60%;
                height: 60%;
            }
        }
        .adapt {
            width: 32px;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;

            >svg {
                transition: 0.3s;
                width: 40%;
                height: 40%;
            }
            >svg:hover {
                transform: scale(1.25);
            }
        }

        .angle {
            height: 32px;
            width: 110px;
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
            width: 49px;
            height: 32px;
            border-radius: 8px;

            >svg {
                color: var(--coco-grey);
                width: 40%;
                height: 40%;
            }
        }

        .bgColor {
            background-color: var(--active-color);
            color: #fff;
        }

        .more-for-radius {
            width: 32px;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;

            >svg {
                transition: 0.3s;
                width: 40%;
                height: 40%;
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