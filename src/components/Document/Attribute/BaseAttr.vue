<script setup lang="ts">
import { defineProps, onBeforeUpdate, onMounted, onUnmounted, ref } from 'vue'
import { Shape } from '@/data/data/shape';
import IconText from '@/components/common/IconText.vue';
import Position from './PopoverMenu/Position.vue';
import { Context } from '@/context';
import { computed } from '@vue/reactivity';

const props = defineProps<{ context: Context, shape: Shape }>();
const editor = computed(() => {
    return props.context.editor4Shape(props.shape);
})
let shape: Shape | undefined;
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
const x = ref<number>(0);
const y = ref<number>(0);
const w = ref<number>(0);
const h = ref<number>(0);
const isLock = ref<boolean>(true);
const isMoreForRadius = ref<boolean>(false);
const fix = 2;

function calcFrame() {
    const xy = props.shape.realXY();
    x.value = xy.x;
    y.value = xy.y;
    const frame = props.shape.frame;
    w.value = frame.width;
    h.value = frame.height;
}
function setupWatcher() {
    if (!shape) {
        shape = props.shape;
        shape.watch(watcher);
    }
    else if (shape.id != props.shape.id) {
        shape.unwatch(watcher);
        shape = props.shape;
        shape.watch(watcher);
    }
}

function onChangeX(value: string) {
    // console.log(value)
    value = Number.parseFloat(value).toFixed(fix);
    let x: number = Number.parseFloat(value);
    if (props.shape.frame.x.toFixed(fix) != value && props.context.selection.selectedPage) {
        const xy = props.shape.realXY();
        editor.value.translateTo(x, xy.y);
    }
}
function onChangeY(value: string) {
    // console.log(value)
    value = Number.parseFloat(value).toFixed(fix);
    let y: number = Number.parseFloat(value);
    if (props.shape.frame.y.toFixed(fix) != value && props.context.selection.selectedPage) {
        const xy = props.shape.realXY();
        editor.value.translateTo(xy.x, y);
    }
}
function onChangeW(value: string) {
    value = Number.parseFloat(value).toFixed(fix);
    const newW: number = Number.parseFloat(value);
    const rate = newW / w.value;
    if (props.shape.frame.width.toFixed(fix) != value && props.context.selection.selectedPage) {
        const newH = isLock.value ? Number((rate * h.value).toFixed(fix)) : props.shape.frame.height;
        editor.value.expandTo(newW, newH);
    }
}
function onChangeH(value: string) {
    value = Number.parseFloat(value).toFixed(fix);
    const newH: number = Number.parseFloat(value);
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

function fliph() {}
function flipv() {}

// hooks
onMounted(() => {
    setupWatcher();
    calcFrame();
})
onUnmounted(() => {
    if (shape) {
        shape.unwatch(watcher);
        shape = undefined;
    }
})
onBeforeUpdate(() => {
    setupWatcher();
    calcFrame();
})
</script>

<template>
    <div class="table" :reflush="reflush">
        <div class="tr">
            <IconText class="td positon" ticon="X" :text="x.toFixed(fix)" @onchange="onChangeX"/>
            <div class="space"></div>
            <IconText class="td positon" ticon="Y" :text="y.toFixed(fix)" @onchange="onChangeY"/>
            <Position></Position>
        </div>
        <div class="tr">
            <IconText class="td frame" ticon="W" :text="w.toFixed(fix)" @onchange="onChangeW"/>
            <div class="lock" @click="lockToggle">
                <svg-icon :icon-class="isLock ? 'lock' : 'unlock'"></svg-icon>
            </div>
            <IconText class="td frame" ticon="H" :text="h.toFixed(fix)" @onchange="onChangeH"/>
        </div>
        <div class="tr">
            <IconText
                class="td angle"
                svgicon="angle"
                :text="h.toFixed(fix)"
                @onchange="onChangeH"
                :frame="{ width: 14, height: 14 }"
            />
            <div class="flip ml-24" @click="fliph">
                <svg-icon icon-class="fliph"></svg-icon>
            </div>
            <div class="flip ml-12" @click="flipv">
                <svg-icon icon-class="flipv"></svg-icon>
            </div>
        </div>
        <div class="tr">
            <IconText
                class="td frame"
                svgicon="radius"
                :text="w.toFixed(fix)"
                :frame="{ width: 12, height: 12 }"
                @onchange="onChangeW"
            />
            <IconText
                class="td frame ml-24"
                svgicon="radius"
                :text="w.toFixed(fix)"
                :frame="{ width: 12, height: 12, rotate: 90 }"
                :style="{
                    visibility: isMoreForRadius ? 'visible' : 'hidden'
                }"
                @onchange="onChangeW"
            />
            <div class="more-for-radius" @click="radiusToggle">
                <svg-icon :icon-class="isMoreForRadius ? 'more-for-radius' : 'more-for-radius'"></svg-icon>
            </div>
        </div>
        <div class="tr" v-if="isMoreForRadius">
            <IconText
                class="td frame"
                svgicon="radius"
                :text="w.toFixed(fix)"
                :frame="{ width: 12, height: 12, rotate: 270 }"
                @onchange="onChangeW"
            />
            <IconText
                class="td frame ml-24"
                svgicon="radius"
                :text="w.toFixed(fix)"
                :frame="{ width: 12, height: 12, rotate: 180 }"
                @onchange="onChangeW"
            />
        </div>
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
        > .icontext {
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
            > svg {
                width: 60%;
                height: 60%;
            }
        }
        .angle {
            height: 32px;
            width: 110px;
            border-radius: 8px;
            > svg {
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
            > svg {
                color: var(--coco-grey);
                width: 40%;
                height: 40%;
            }
        }
        .more-for-radius {
            width: 32px;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            > svg {
                transition: 0.3s;
                width: 40%;
                height: 40%;
            }
            > svg:hover {
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
        > svg {
            width: 90%;
            height: 90%;
        }
    }
}
</style>