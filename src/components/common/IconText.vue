<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-03 14:47:46
 * @FilePath: \kcdesign\src\components\common\IconText.vue
-->
<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
const props = defineProps<{
    svgicon?: any,
    icon?: any,
    ticon?: string,
    text: string | number,
    frame?: { width: number, height: number, rotate?: number }
}>();
const emit = defineEmits<{
    (e: "onchange", value: string): void;
}>();

function onChange(e: Event) {
    const value = (e.currentTarget as any)['value']
    emit("onchange", value);
}
</script>

<template>
<label class="icontext">
    <svg-icon
        class="icon"
        v-if="props.svgicon"
        :icon-class="props.svgicon"
        :style="{
            width: `${props.frame ? frame?.width : 18}px`,
            height: `${props.frame ? frame?.height : 18}px`,
            transform: `rotate(${props.frame ? frame?.rotate : 0}deg)`
        }"
    ></svg-icon>
    <img class="icon" v-if="props.icon" :src="props.icon" />
    <span class="icon" v-if="!props.icon && props.ticon" >{{props.ticon}}</span>
    <input :value="props.text" v-on:change="onChange"/>
</label>
</template>

<style scoped lang="scss">
.icontext {
    display: flex;
    flex-flow: row;
    white-space: nowrap;
    overflow: hidden;
    padding: 1px;
    align-items: center;
    padding: 0 8px;
    box-sizing: border-box;
    > .icon {
        color: grey;
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        cursor: ew-resize;
        text-align: center;
    }
    > span {
        line-height: 14px;
    }
    > input {
        width: 100%;
        flex: 1 1 auto;
        align-content: center;
        margin-left: 2px;
        color: var(--theme-color);
        font-family: var(--font-family);
        text-overflow: ellipsis;
        background-color: transparent;
        border: none;
        outline: none;
    }
}
</style>