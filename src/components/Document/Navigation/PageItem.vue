<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-08 09:53:56
 * @FilePath: \kcdesign\src\components\Document\Navigation\PageItem.vue
-->
<script setup lang="ts">
import { defineProps, defineEmits, ref, nextTick } from "vue";

export interface ItemData {
    name: string
    id: string
    selected: boolean
}

const props = defineProps<{ data: ItemData }>();
const emit = defineEmits<{
    (e: "switchpage", id: string): void;
}>();
const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement>()

function onClick(e: MouseEvent) {
    e.stopPropagation();
    emit("switchpage", props.data.id);
}

const onRename = () => {
    isInput.value = true
    nextTick(() => {
        if(nameInput.value) {            
            nameInput.value.focus();
            nameInput.value.select()
            nameInput.value?.addEventListener('blur', stopInput);
        }
    })
}
const stopInput = () => {
    isInput.value = false
}

</script>

<template>
    <div
        :class="{ container: true, selected: props.data.selected }"
        @click="onClick"
    >
        <div class="ph"></div>
        <div class="item">
            <div class="title" @dblclick="onRename" :style="{ display: isInput ? 'none' : ''}">{{props.data.name}}</div>
            <input v-if="isInput" class="rename" type="text" ref="nameInput" :value="props.data.name">
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
        display: flex;
        align-items: center;
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

div .rename {
    flex: 1;
    width: 100%;
    height: 22px;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-left:6px;
    margin-right: 6px;
    outline-style: none;
    border: 1px solid var(--left-navi-button-select-color);
}
</style>