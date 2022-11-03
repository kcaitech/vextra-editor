<script setup lang="ts">
import { EventEmitter } from './basic/event';
import { defineProps, onMounted, onUnmounted, shallowRef } from 'vue';
import ContentView from './components/ContentView.vue';
import { Context } from './context';
import { LzData } from './data/lzdata';
import { importDocument } from './io/sketch/documentio';
import { Document } from "./data/document";
import Navigation from './components/Navigation/index.vue';
import { Page } from './data/page';
import { Selection } from './context/selection'
import Attribute from './components/Attribute/index.vue';

const props = defineProps<{preload:EventEmitter}>();
// const dataReady = ref<boolean>(false);
const curPage = shallowRef<Page | undefined>(undefined);
const context = shallowRef<Context | undefined>(undefined);

function importData(lzData: LzData) {
    importDocument(lzData).then((core: Document) => {
        // const repo = new Repository();
        // core = repo.proxy(core); // 这个可以延迟，prepare for edit
        context.value = new Context(core);
        // for debugger
        // (window as any).__document = core;
        (window as any).__context = context.value;

        context.value.selection.watch(selectionWatcher);
        switchPage(core.pagesMgr.getPageIdByIndex(0));
    })
}

onMounted(() => {
    props.preload.on('ready', importData);
    props.preload.emit('load');
})

function topDblClick() {
    // console.log("dblclick")
    // props.preload.emit("toggle-maximize");
}

function switchPage(id: string) {
    const ctx: Context = context.value as Context;
    const pagesMgr = ctx.data.pagesMgr;
    const index = pagesMgr.getPageIndexById(id);
    pagesMgr.getPageByIndex(index).then((page: Page) => {
        // curPage.value = page;
        ctx.selection.selectPage(page);
    })
}

function selectionWatcher(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        const ctx: Context = context.value as Context;
        curPage.value = ctx.selection.selectedPage
    }
}

onUnmounted(() => {
    if (context.value !== undefined) {
        context.value.selection.unwatch(selectionWatcher);
    }
})

</script>

<template>
    <div id="top" @dblclick="topDblClick"></div>
    <div id="center" v-if="context !== undefined">
        <Navigation id="navigation" :context="context as Context" @switchpage="switchPage"></Navigation>
        <div class="vertical-line" />
        <ContentView v-if="curPage !== undefined" id="content" :context="context as Context" :page="(curPage as Page)"></ContentView>
        <div class="vertical-line" />
        <Attribute id="attributes" :context="context as Context"></Attribute>
    </div>
    <div id="bottom"></div>
</template>

<style>
    :root {
        /*  */
        --theme-color: #2c2c2c;
        --theme-color-anti: white;
        --theme-color2: #f5f5f5;
        --theme-color3: #e0e0e0;
        --theme-color-line: #f0f0f0;
        --font-family: BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,PingFang SC,Microsoft Yahei,Hiragino Sans GB,sans-serif,apple color emoji,Noto Color Emoji,segoe ui emoji,segoe ui symbol;
        
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
        font-family: var(--font-family);
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
        height:40px;
        min-height: 40px;
        background-color: var(--top-toolbar-bg-color);
        z-index: 1;
    }
    #center {
        display: flex;
        flex-flow:row nowrap;
        flex: 1 1 auto;
        width:100%;
        height:auto;
        overflow: hidden;
    }
    #bottom {
        flex-flow:row nowrap;
        width:100%;
        height:30px;
        min-height: 30px;
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
        overflow: hidden;
    }
    #attributes {
        flex-flow:column nowrap;
        width:150px;
        height:auto;
        background-color: var(--right-attr-bg-color);
        z-index: 1;
    }
    div.vertical-line {
        width: 1px;
        height: 100%;
        background-color: var(--theme-color-line);
        flex: 0 0 auto;
    }
</style>
