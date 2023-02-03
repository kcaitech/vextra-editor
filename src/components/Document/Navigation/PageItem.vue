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
    <div :class="{ container: true, selected: props.data.selected }" v-on:click="onClick">
        <div class="ph"></div>
        <div class="item">{{props.data.name}}</div>
    </div>
</template>

<style scoped>
.container {
    width: 100%;
    height: 30px;
    line-height: 30px;
    color: var(--left-navi-font-color);
    background-color: var(--left-navi-bg-color);
    font-size: 10px;
    /* text-align: center; */
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    display: flex;
    flex-direction: row;
}

.container:hover {
    cursor: default;
    background-color: var(--left-navi-button-hover-color);
}

.selected {
    background-color: var(--left-navi-button-hover-color);
}

.ph {
    width: 13px;
    min-width: 13px;
    height: 100%;
}

.item {
    line-height: 30px;
    font-size: 10px;
    /* text-align: center; */
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
</style>