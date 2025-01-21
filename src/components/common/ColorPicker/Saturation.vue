<script setup lang="ts">
import { ref } from "vue";
import { DragKit } from "@/components/common/draggable";
import { verifiedVal } from "@/components/common/ColorPicker/utils";

const WIDTH = 250;
const WIDTH_CSS = `${WIDTH}px`;
const HEIGHT = 200;
const HEIGHT_CSS = `${HEIGHT}px`;
const DOT_SIZE = 12;
const DOT_SIZE_CSS = `${DOT_SIZE}px`;
const MIN_LEFT = -6;
const MAX_LEFT = WIDTH - DOT_SIZE / 2;
const MIN_TOP = -6;
const MAX_TOP = HEIGHT - DOT_SIZE / 2;

const left = ref<number>(-6);
const top = ref<number>(-6);

const dragKit = new DragKit({
    move: (event: MouseEvent, x: number, y: number) => {
        left.value = verifiedVal(x, MIN_LEFT, MAX_LEFT);
        top.value = verifiedVal(y, MIN_TOP, MAX_TOP);
    }
})

function downDot(event: MouseEvent) {
    const target = event.target as HTMLElement;
    dragKit.start(event, {x: target.offsetLeft,y: target.offsetTop} );
}

function downPanel(event: MouseEvent) {
    left.value = event.offsetX - 6;
    top.value = event.offsetY - 6;
    dragKit.start(event, {x: event.offsetX - 6, y: event.offsetY - 6});
}
</script>

<template>
    <div id="saturation" :style="{width: WIDTH_CSS, height: HEIGHT_CSS}">
        <div class="white"/>
        <div class="black" @mousedown="downPanel"/>
        <div class="dot" :style="{left: left + 'px', top: top + 'px'}" @mousedown="downDot"/>
    </div>
</template>

<style scoped lang="scss">
#saturation {
    position: relative;
    background-color: red;

    .white {
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #fff, #fff0);
    }

    .black {
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(0deg, #000, #fff0);
    }

    .dot {
        width: v-bind('DOT_SIZE_CSS');
        height: v-bind('DOT_SIZE_CSS');
        border-radius: 50%;
        border: 2px solid #fff;
        position: absolute;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .2), 0 0 0 1px rgba(0, 0, 0, .2);
        box-sizing: border-box;
    }
}
</style>