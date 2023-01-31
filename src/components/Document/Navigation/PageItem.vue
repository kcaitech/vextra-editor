<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

export interface ItemData {
    name: string
    id: string
    selected: boolean
}

const props = defineProps<{ data: ItemData }>();
const emit = defineEmits<{
    (e: "switchpage", id: string): void;
}>();
// const { proxy } = getCurrentInstance() as ComponentInternalInstance;
function onClick(e: Event) {
    e.stopPropagation();
    emit("switchpage", props.data.id);
}

</script>

<template>
    <div :class="{selected: props.data.selected}" v-on:click="onClick">{{props.data.name}}</div>
</template>

<style scoped>
div {
    width: 100px;
    height: 30px;
    line-height: 30px;
    color: var(--left-navi-font-color);
    background-color: var(--left-navi-bg-color);
    font-size: 10px;
    /* text-align: center; */
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-left: 13px;
}

div:hover {
    cursor: default;
    background-color: var(--left-navi-button-hover-color);
}

div.selected {
    background-color: var(--left-navi-button-hover-color);
}
</style>