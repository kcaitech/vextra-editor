<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, shallowRef } from 'vue';
import ContentView from "./ContentView.vue";
import { Context } from '@/context';
import { Document } from "@/data/document";
import Navigation from './Navigation/index.vue';
import { Page } from '@/data/page';
import { Selection } from '@/context/selection'
import Attribute from './Attribute/index.vue';
import Toolbar from './Toolbar/index.vue'

const props = defineProps<{data: Document}>();
// const dataReady = ref<boolean>(false);
const curPage = shallowRef<Page | undefined>(undefined);
const context = shallowRef<Context>(new Context(props.data));
(window as any).__context = context.value;

function topDblClick() {
    // console.log("dblclick")
    // props.preload.emit("toggle-maximize");
}

onMounted(() => {
    context.value.selection.watch(selectionWatcher);
    switchPage(props.data.pagesMgr.getPageIdByIndex(0));
})

function switchPage(id: string) {
    const ctx: Context = context.value;
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
    context.value.selection.unwatch(selectionWatcher);
})

</script>

<template>
    <div id="top" @dblclick="topDblClick">
        <Toolbar :context="context" />
    </div>
    <div id="center">
        <Navigation id="navigation" :context="context" @switchpage="switchPage"></Navigation>
        <div class="vertical-line" />
        <ContentView v-if="curPage !== undefined" id="content" :context="context" :page="(curPage as Page)"></ContentView>
        <div class="vertical-line" />
        <Attribute id="attributes" :context="context"></Attribute>
    </div>
    <div id="bottom"></div>
</template>

<style>
    :root {
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
