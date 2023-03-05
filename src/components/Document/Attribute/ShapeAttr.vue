<script setup lang="ts">
import { defineProps, onBeforeUpdate, onMounted, onUnmounted, ref } from 'vue'
import { Shape } from '@/data/shape';
import IconText from '@/components/common/IconText.vue';
import Position from './PopoverMenu/Position.vue';
import { Context } from '@/context';
import { computed } from '@vue/reactivity';
import "@/assets/icons/svg/X.svg";
import "@/assets/icons/svg/Y.svg";
import "@/assets/icons/svg/W.svg";
import "@/assets/icons/svg/H.svg";
import "@/assets/icons/svg/gear.svg";
import "@/assets/icons/svg/lock.svg";
import "@/assets/icons/svg/unlock.svg";
import "@/assets/icons/svg/fliph.svg";
import "@/assets/icons/svg/flipv.svg";
import "@/assets/icons/svg/radius.svg";
import "@/assets/icons/svg/angle.svg";
import "@/assets/icons/svg/add.svg";


const props = defineProps<{ context: Context, shape: Shape }>();
const editor = computed(() => {
    if (props.context.selection.selectedPage == undefined) {
        throw new Error("No Selected Page?");
    }
    const pe = props.context.editor4Page(props.context.selection.selectedPage);
    return pe.editor4Shape(props.shape);
})
let shape: Shape | undefined;
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
let x = ref(0), y = ref(0);
let w = ref(0), h = ref(0);
let isLock = true;
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
const fix = 2;

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
    // console.log(value)
    value = Number.parseFloat(value).toFixed(fix);
    const w: number = Number.parseFloat(value);
    if (props.shape.frame.width.toFixed(fix) != value && props.context.selection.selectedPage) {
        editor.value.expandTo(w, props.shape.frame.height);
    }
}
function onChangeH(value: string) {
    // console.log(value)
    value = Number.parseFloat(value).toFixed(fix);
    const h: number = Number.parseFloat(value);
    if (props.shape.frame.height.toFixed(fix) != value && props.context.selection.selectedPage) {
        editor.value.expandTo(props.shape.frame.width, h);
    }
}
function lockClick(e: MouseEvent) {}

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
            <IconText class="td positon" svgicon="X" :text="x.toFixed(fix)" @onchange="onChangeX"/>
            <div class="space"></div>
            <IconText class="td positon" svgicon="Y" :text="y.toFixed(fix)" @onchange="onChangeY"/>
            <Position></Position>
        </div>
        <div class="tr">
            <IconText class="td frame" svgicon="W" :text="w.toFixed(fix)" @onchange="onChangeW"/>
            <div class="lock" @click="lockClick">
                <svg-icon :icon-class="isLock ? 'lock' : 'unloack'"></svg-icon>
            </div>
            <IconText class="td frame" svgicon="H" :text="h.toFixed(fix)" @onchange="onChangeH"/>
        </div>
        <div class="tr">
            <IconText class="td angle" svgicon="angle" :text="h.toFixed(fix)" @onchange="onChangeH"/>
            <div class="flip ml-24" @click="fliph">
                <svg-icon icon-class="fliph"></svg-icon>
            </div>
            <div class="flip ml-12" @click="flipv">
                <svg-icon icon-class="flipv"></svg-icon>
            </div>
        </div>
        <div class="tr">
            <IconText class="td frame" svgicon="radius" :text="w.toFixed(fix)" @onchange="onChangeW"/>
            <IconText class="td frame ml-24" svgicon="radius" :text="w.toFixed(fix)" @onchange="onChangeW"/>
        </div>
        <div class="tr">
            <IconText class="td frame" svgicon="radius" :text="w.toFixed(fix)" @onchange="onChangeW"/>
            <IconText class="td frame ml-24" svgicon="radius" :text="w.toFixed(fix)" @onchange="onChangeW"/>
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
.mt-24 {
    margin-top: 24px;
}
.table {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 24px;
    box-sizing: border-box;
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
                width: 80%;
                height: 70%;
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