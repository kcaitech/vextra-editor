<script setup lang="ts">
import { ComponentInternalInstance, defineProps, getCurrentInstance } from "vue";
const props = defineProps<{icon?: any, ticon?: string, text: string | number}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

function onChange(e: Event) {
    const value = (e.currentTarget as any)['value']
    proxy?.$emit("onchange", value);
}
</script>

<template>
<label class="icontext" >
    <img class="icon" v-if="props.icon" :src="props.icon" />
    <span class="icon" v-if="!props.icon && props.ticon" >{{props.ticon}}</span>
    <input :value="props.text" v-on:change="onChange"/>
</label>
</template>

<style scoped>
.icontext {
    display: flex;
    flex-flow: row;
    white-space: nowrap;
    overflow: hidden;
    padding: 1px;
}
.icontext:focus-within {
    border: 1px solid var(--theme-color-line);
    padding: 0;
}
.icon {
    width: 12px;
    max-width: 12px;
    min-width: 12px;
    align-content: center;
    margin-left: 1px;
    margin-right: 2px;
    color: var(--theme-color);
    font-size: 10px;
    text-align: center;
    padding-top: 1px;
}
input {
    width: 100%;
    flex: 1 1 auto;
    align-content: center;
    margin-left: 2px;
    color: var(--theme-color);
    border: none;
    outline: none;
    font-family: var(--font-family);
    font-size: 10px;
    text-overflow: ellipsis;
}
input:focus {
    border: none;
    outline: none;
}
</style>