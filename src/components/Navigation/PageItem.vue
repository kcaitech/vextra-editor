<script setup lang="ts">
import { defineProps, defineExpose } from "vue";

export interface ItemData {
    name: string
    id: string
    selected: boolean
}

function measure(data: ItemData) {
    return {width: 100, height: 30}
}

defineExpose({
    measure
})

const props = defineProps<{ data: ItemData }>();

</script>

<template>
    <div :class="{selected: props.data.selected}">{{props.data.name}}</div>
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