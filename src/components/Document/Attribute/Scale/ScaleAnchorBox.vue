<script setup lang="ts">
import { ref } from "vue";
import { AnchorType } from "./index";

const WIDTH = 88;
const WIDTH_CSS = WIDTH + 'px';
const HEIGHT = 80;
const HEIGHT_CSS = HEIGHT + 'px';
const types = ref<{ type: AnchorType, selected: boolean }[]>([
    { type: AnchorType.LeftTop, selected: false },
    { type: AnchorType.Top, selected: false },
    { type: AnchorType.RightTop, selected: false },
    { type: AnchorType.Left, selected: false },
    { type: AnchorType.Center, selected: true },
    { type: AnchorType.Right, selected: false },
    { type: AnchorType.BottomLeft, selected: false },
    { type: AnchorType.Bottom, selected: false },
    { type: AnchorType.RightBottom, selected: false }
]);

const emit = defineEmits<{
    (e: 'update:value', type: AnchorType): void;
}>();

function setAnchor(t: AnchorType) {
    const __selected = types.value.find(i => i.selected);
    const target = types.value.find(i => i.type === t);
    if (__selected) __selected.selected = false;
    if (target && !target.selected) {
        target.selected = true;
        emit('update:value', t);
    }
}

</script>
<template>
<div :style="{width: WIDTH_CSS, height: HEIGHT_CSS}" class="scale-anchor-box">
    <div v-for="t in types" :key="t.type" class="item" @click="() => setAnchor(t.type)">
        <div style="width: 2px; height: 2px; border-radius: 50%; background-color: grey;position: absolute;"/>
        <div :class="{content: true, 'selected-content': t.selected}"/>
    </div>
</div>
</template>
<style scoped lang="scss">
.scale-anchor-box {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 2px;
    background-color: var(--input-background);
    border-radius: var(--default-radius);

    .item {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        .content {
            position: absolute;
            width: 16px;
            height: 16px;
            border-radius: 2px;
            background-color: transparent;
        }

        .selected-content {
            background-color: var(--active-color) !important;
        }

    }

    .item:hover {
        .content {
            background-color: #76a8ea;
        }
    }
}
</style>