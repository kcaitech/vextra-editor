<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-06 16:10:12
 * @FilePath: \kcdesign\src\components\Document\Navigation\PageItem.vue
-->
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

function onClick(e: MouseEvent) {
    e.stopPropagation();
    emit("switchpage", props.data.id);
}

</script>

<template>
    <div
        :class="{ container: true, selected: props.data.selected }"
        @click.stop="onClick"
    >
        <div class="ph"></div>
        <div class="item">
            <div class="title">{{props.data.name}}</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    width: 100%;
    height: 30px;
    line-height: 30px;
    color: var(--left-navi-font-color);
    background-color: var(--left-navi-bg-color);
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: visible;
    display: flex;
    flex-direction: row;
    position: relative;
    .item {
        line-height: 30px;
        width: 100%;
        position: relative;
        > .title {
            width: 100%;
            height: 100%;
            font-size: 10px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }
}

div.container:hover {
    cursor: default;
    background-color: var(--left-navi-button-hover-color);
}

div.container.selected {
    background-color: var(--left-navi-button-select-color);
}

.ph {
    width: 13px;
    min-width: 13px;
    height: 100%;
}

</style>