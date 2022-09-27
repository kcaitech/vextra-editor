<template>
    <div id="top" @dblclick="topDblClick"></div>
    <div id="center">
        <div id="navigation"></div>
        <ContentView id="content"></ContentView>
        <div id="attributes"></div>
    </div>
    <div id="bottom"></div>
</template>

<script setup lang="ts">
import { EventEmitter } from './basic/event';
import { defineProps } from 'vue';
import ContentView from './components/ContentView.vue';

const props = defineProps<{preload:EventEmitter}>();

function topDblClick() {
    // console.log("dblclick")
    // props.preload.emit("toggle-maximize");
}

</script>

<style scoped>
    #app {
        display: flex;
        flex-flow:column nowrap;
        width:100%;
        height:auto;
    }
    #top {
        flex-flow:row nowrap;
        width:100%;
        height:50px;
        background-color: var(--theme-color);
    }
    #center {
        display: flex;
        flex-flow:row nowrap;
        flex: 1 1 auto;
        width:100%;
        height:auto;
    }
    #bottom {
        flex-flow:row nowrap;
        width:100%;
        height:30px;
        align-self:flex-end;
        visibility: hidden;
        background-color: var(--theme-color);
    }
    #navigation {
        display: flex;
        flex-flow:column nowrap;
        width:100px;
        height:auto;
        background-color: var(--theme-color-col);
    }
    #content {
        flex: 1 1 auto;
        width:auto;
        height:auto;
    }
    #attributes {
        flex-flow:column nowrap;
        width:100px;
        height:auto;
        background-color: var(--theme-color-col);
    }
</style>

<style>
    :root {
        --theme-top-nvi-color: #1e1e1e;
        --theme-color: #2c2c2c;
        --theme-color-hover: #232323;
        --theme-font-color-antibg: white;
        --theme-content-colorbg: #f5f5f5;
        --theme-color-col: white;
        --theme-font-color-col: #2c2c2c;
        --theme-color-col-hover: #f5f5f5;
    }
    body {
        font-family: BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,PingFang SC,Microsoft Yahei,Hiragino Sans GB,sans-serif,apple color emoji,Noto Color Emoji,segoe ui emoji,segoe ui symbol;
        overflow: hidden;
        margin: 0px;
    }
</style>