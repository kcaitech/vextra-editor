<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{ data: { name: string; id: string }, selected: boolean }>();

</script>

<template>
    <div :class="{selected: props.selected}">{{props.data.name}}</div>
</template>
    
<style scoped>
div {
    width: 100px;
    height: 30px;
    line-height: 30px;
    color: var(--left-navi-font-color);
    background-color: var(--left-navi-bg-color);
    font-size: 10px;
    text-align: center;
    text-overflow: ellipsis;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

div:hover {
    cursor: default;
    background-color: var(--left-navi-button-hover-color);
}

div.selected {
    background-color: var(--left-navi-button-hover-color);
}
</style>