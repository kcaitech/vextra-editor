<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, shallowRef } from 'vue';
import ContentView from "./ContentView.vue";
import { Context } from '@/context';
import { Document } from "@/data/data/document";
import Navigation from './Navigation/index.vue';
import { Page } from '@/data/data/page';
import { Selection } from '@/context/selection'
import Attribute from './Attribute/index.vue';
import Toolbar from './Toolbar/index.vue'
import ColSplitView from './ColSplitView.vue';

const props = defineProps<{data: Document}>();
// const dataReady = ref<boolean>(false);
const curPage = shallowRef<Page | undefined>(undefined);
const context = shallowRef<Context>(new Context(props.data));
(window as any).__context = context.value;

function topDblClick() {
    const isFullscreen = props.data.isFullscreen;
    const element = document.documentElement;
    if (isFullscreen) {
        document.exitFullscreen && document.exitFullscreen()
  	} else {
        element.requestFullscreen && element.requestFullscreen()
    }
  	props.data.setScreen(!isFullscreen)
}

function onWindowBlur() {
    // Window blur, Close the process that should be closed
}

onMounted(() => {    
    context.value.selection.watch(selectionWatcher);
    switchPage(props.data.pagesMgr.getPageIdByIndex(0));
    window.addEventListener('blur', onWindowBlur)
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
    window.removeEventListener('blur', onWindowBlur);
})

</script>

<template>
    <div id="top" @dblclick="topDblClick">
        <Toolbar :context="context" />
    </div>
    <ColSplitView 
        id="center"
        :left="{width: 0.2, minWidth: 0.1, maxWidth: 0.5}" 
        :middle="{width: 0.6, minWidth: 0.3, maxWidth: 0.8}"
        :right="{width: 0.2, minWidth: 0.1, maxWidth: 0.5}"
    >
        <template #slot1>
            <Navigation
                id="navigation"
                :context="context"
                @switchpage="switchPage"
            ></Navigation>
        </template>
        <template #slot2>
            <ContentView
                v-if="curPage !== undefined"
                id="content"
                :context="context"
                :page="(curPage as Page)"
            ></ContentView>
        </template>
        <template #slot3>
            <Attribute id="attributes" :context="context"></Attribute>
        </template>
    </ColSplitView>
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
        --left-navi-button-select-color: var(--theme-color3);
        --left-navi-font-color: var(--theme-color);
        /* right attribute col */
        --right-attr-bg-color: var(--theme-color-anti);
        /* center content area */
        --center-content-bg-color: var(--theme-color2);
    }
</style>

<style scoped>
    #top {
        display: flex;
        flex-flow: row nowrap;
        width: 100%;
        height: 40px;
        min-height: 40px;
        background-color: var(--top-toolbar-bg-color);
        z-index: 1;
    }
    #center {
        display: flex;
        flex-flow:row nowrap;
        flex: 1 1 auto;
        width:100%;
        height: auto;
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
        flex-flow: column nowrap;
        /* width:100px; */
        height: 100%;
        background-color: var(--left-navi-bg-color);
        z-index: 1;
    }
    #content {
        flex: 1 1 auto;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    #attributes {
        flex-flow: column nowrap;
        /* width:150px; */
        height: 100%;
        background-color: var(--right-attr-bg-color);
        z-index: 1;
    }

</style>
