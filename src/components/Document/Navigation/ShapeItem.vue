<script setup lang="ts">

import { defineProps, defineEmits, onBeforeMount, onBeforeUpdate, ref, computed } from "vue";
import { Shape, GroupShape } from '@/data/data/shape';

export interface ItemData {
    id: string
    shape: Shape
    selected: boolean
    expand: boolean
    level: number
}


const props = defineProps<{ data: ItemData }>();
const phWidth = computed(() => {
    return (props.data.level - 1) * 6;
})
const emit = defineEmits<{
    (e: "toggleexpand", shape: Shape): void;
    (e: "selectshape", data: ItemData): void;
    (e: "hovershape", shape: Shape): void;
    (e: "unhovershape", shape: Shape): void;
}>();
let showTriangle = ref<boolean>(false);
function updater() {
    let shape = props.data.shape;
    showTriangle.value = shape instanceof GroupShape && shape.childsCount > 0;
}

// const { proxy } = getCurrentInstance() as ComponentInternalInstance;
function toggleExpand(e: Event) {
    if (!showTriangle.value) {
        return;
    }
    e.stopPropagation();    
    emit("toggleexpand", props.data.shape);
}

function selectShape(e: Event) {
    e.stopPropagation();
    emit("selectshape", props.data);
}

function hoverShape(e: MouseEvent) {
    e.stopPropagation();
    emit("hovershape", props.data.shape);
}
function unHoverShape(e: MouseEvent) {
    e.stopPropagation();
    emit("unhovershape", props.data.shape);
}
onBeforeMount(() => {
    updater();
})
onBeforeUpdate(() => {
    updater();
})

</script>

<template>
    <div
        :class="{ container: true, selected: props.data.selected }"
        @click="selectShape"
        @mouseover="hoverShape"
        @mouseleave="unHoverShape"
    >
        <div
            class="ph"
            :style="{ width:`${phWidth}px`, height:'100%', minWidth:`${phWidth}px` }"
        ></div>
        <div :class="{ triangle: showTriangle, slot: !showTriangle }" v-on:click="toggleExpand">
            <div
                v-if="showTriangle"
                :class="{'triangle-right': !props.data.expand, 'triangle-down': props.data.expand}"
            ></div>
        </div>
        <div class="text">{{props.data.shape.name}}</div>
    </div>
</template>

<style scoped>
div.container {
    display: flex;
    flex-flow: row;
    width: 100%;
    height: 30px;
    color: var(--left-navi-font-color);
    background-color: var(--left-navi-bg-color);
}

div.container:hover {
    cursor: default;
    background-color: var(--left-navi-button-hover-color);
}

div.container.selected {
    background-color: var(--left-navi-button-select-color);
}

div.triangle {
    width: 8px;
    min-width: 8px;
    height: 100%;
    padding-right: 2px;
}

div.slot {
    width: 8px;
    min-width: 8px;
    height: 100%;
    padding-right: 2px;
}

div.triangle:hover {
    cursor: default;
    background-color: var(--grey-dark);
}

div.triangle-right {
    width: 0;
    height: 0;
    border-left: 5px solid gray;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    position: relative;
    left: 2px;
    top: 12px;
}

div.triangle-down {
    width: 0;
    height: 0;
    border-top: 5px solid gray;
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    position: relative;
    left: 1px;
    top: 13px;
}

div.text {
    line-height: 30px;
    font-size: 10px;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-left: 2px;
}
</style>