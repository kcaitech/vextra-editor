<script setup lang="ts">
import { ref } from "vue";
import { DragKit } from "@/components/common/draggable";

const props = defineProps<{
    type: string;
    value: number;
    range?: [number, number];
}>();
const emits = defineEmits<{
    (e: "change", value: number): void;
    (e: "drag-start"): void;
    (e: "dragging", value: number): void;
    (e: "drag-end"): void;
}>();
const MAX_SIDE_LENGTH = 160;
const MAX_SIDE_LENGTH_CSS = `${MAX_SIDE_LENGTH}px`;
const valLength = ref<number>((() => {
    const val = props.value;
    if (!val) return 0; else {
        const max = (props.range || [-100, 100])[1];
        return (Math.abs(val) / max) * MAX_SIDE_LENGTH / 2;
    }
})());
const valStart = ref<number>((() => props.value < 0 ? (MAX_SIDE_LENGTH / 2) - valLength.value : MAX_SIDE_LENGTH / 2)());
const position = ref<number>((() => {
    const val = props.value;
    if (val) {
        const max = (props.range || [-100, 100])[1];
        return (MAX_SIDE_LENGTH / 2) + (val / max) * MAX_SIDE_LENGTH / 2
    } else {
        return MAX_SIDE_LENGTH / 2;
    }
})());
const rangeEl = ref<HTMLDivElement>();

let center: number = 0;
let start: number = 0;
let end: number = 0;
let downX = 0;
let isDrag = false;

const dragKit = new DragKit({
    down: (event: MouseEvent) => {
        if (!rangeEl.value) return;
        downX = event.clientX;
        const box = rangeEl.value.getBoundingClientRect();
        start = box.left;
        end = box.right;
        center = (start + end) / 2;
        emits("drag-start");
    },
    move: (event: MouseEvent) => {
        if (isDrag) {
            modify(event);
        } else if (Math.abs(event.clientX - downX) > 4) {
            isDrag = true;
        }
    },
    commit: () => {
        emits("drag-end");
    }
})

function down(e: MouseEvent) {
    dragKit.start(e);
}

function downSlider(e: MouseEvent) {
    dragKit.start(e);
    modify(e);
}

function modify(e: MouseEvent) {
    let x = e.x;
    if (x > center) {
        if (x > end) x = end;
        if (x - center < 3) x = center;
        valLength.value = x - center;
        valStart.value = center - start;
        position.value = valStart.value + valLength.value;
    } else {
        if (x < start) x = start;
        if (center - x < 3) x = center;
        valLength.value = center - x;
        valStart.value = x - start;
        position.value = x - start;
    }
    emits("dragging", position.value / MAX_SIDE_LENGTH);
}
</script>
<template>
    <div class="container">
        <div class="desc">{{ type }}</div>
        <div ref="rangeEl" class="range" :style="{ width: MAX_SIDE_LENGTH_CSS }" @mousedown="downSlider">
            <div class="line"/>
            <div v-if="valLength" class="line-center"/>
            <div v-if="valLength" class="val-line" :style="{ left: `${valStart}px`, width: `${valLength}px` }"/>
            <div :style="{ left: `${position}px` }" :class="{ dot: true, 'fill-dot': valLength }" @mousedown="down"/>
        </div>
    </div>
</template>
<style scoped lang="scss">
.container {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    position: relative;

    .desc {
        max-width: 56px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        color: #3D3D3D;
    }

    .range {
        display: flex;
        align-items: center;
        position: relative;
        height: 100%;

        .line {
            width: 100%;
            height: 2px;
            border-radius: 1px;
            background-color: #D9D9D9;
        }

        .line-center {
            width: 1px;
            background-color: #D9D9D9;
            height: 10px;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
        }

        .val-line {
            height: 2px;
            background-color: #1878F5;
            position: absolute;
        }


        .dot {
            position: absolute;
            top: 50%;
            transform: translate(-50%, -50%);
            box-sizing: border-box;
            width: 10px;
            height: 10px;
            border: 1.5px solid #262626;
            border-radius: 50%;
            background-color: #fff;
            box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.12);
        }

        .fill-dot {
            border: 1.5px solid #1878F5;
        }
    }
}
</style>