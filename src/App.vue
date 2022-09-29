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


<style>
    :root {
        /*  */
        --theme-color: #2c2c2c;
        --theme-color-anti: white;
        --theme-color2: #f5f5f5;
        
        /* top toolbar */
        --top-toolbar-bg-color: var(--theme-color);
        --top-toolbar-font-color: var(--theme-color-anti);
        /* left navigation col */
        --left-navi-bg-color: var(--theme-color-anti);
        --left-navi-button-hover-color: var(--theme-color2);
        --left-navi-font-color: var(--theme-color);
        /* right attribute col */
        --right-attr-bg-color: var(--theme-color-anti);
        /* center content area */
        --center-content-bg-color: var(--theme-color2);

        /* button toolbar */

    }
    html {
        width: 100%;
        height: 100%;
    }
    body {
        font-family: BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,PingFang SC,Microsoft Yahei,Hiragino Sans GB,sans-serif,apple color emoji,Noto Color Emoji,segoe ui emoji,segoe ui symbol;
        overflow: hidden;
        margin: 0px;
        width: 100%;
        height: 100%;
    }
    body #app {
        display: flex;
        flex-flow:column nowrap;
        width:100%;
        height:100%;
    }
</style>

<style scoped>
    #top {
        flex-flow:row nowrap;
        width:100%;
        height:50px;
        background-color: var(--top-toolbar-bg-color);
        z-index: 1;
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
        /* visibility: hidden; */
        background-color: var(--theme-color);
        z-index: 1;
    }
    #navigation {
        display: flex;
        flex-flow:column nowrap;
        width:100px;
        height:auto;
        background-color: var(--left-navi-bg-color);
        z-index: 1;
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
        background-color: var(--right-attr-bg-color);
        z-index: 1;
    }
</style>
