<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, shallowRef } from 'vue';
import ContentView from "./ContentView.vue";
import { Context } from '@/context';
import { Document } from "@kcdesign/data/data/document";
import Navigation from './Navigation/index.vue';
import { Page } from '@kcdesign/data/data/page';
import { Selection } from '@/context/selection'
import Attribute from './Attribute/RightTabs.vue';
import Toolbar from './Toolbar/index.vue'
import ColSplitView from './ColSplitView.vue';
import { Repository } from '@kcdesign/data/data/transact';
import { SCREEN_SIZE } from '@/utils/setting';
import { Keyboard } from '@/utils/keyboard';
import { KEYBOARD } from '@kcdesign/data/data/model';

const props = defineProps<{data: Document, repo: Repository}>();
const curPage = shallowRef<Page | undefined>(undefined);
const keyboard = new Keyboard();
const context = shallowRef<Context>(new Context(props.data, props.repo));
(window as any).__context = context.value;

function screenSetting() {
    const element = document.documentElement;
    const isFullScreen = document.fullscreenElement;
    
    if (isFullScreen === null) {
        element.requestFullscreen && element.requestFullscreen();
        localStorage.setItem(SCREEN_SIZE.KEY, SCREEN_SIZE.FULL);
    } else {
        document.exitFullscreen && document.exitFullscreen();
        localStorage.setItem(SCREEN_SIZE.KEY, SCREEN_SIZE.NORMAL);
    }
}

function onWindowBlur() {
    // Window blur, Close the process that should be closed
}
function switchPage(id?: string) {
    if (!id) return
    const ctx: Context = context.value;
    const pagesMgr = ctx.data.pagesMgr;
    pagesMgr.get(id).then((page: Page | undefined) => {
        if (page) ctx.selection.selectPage(page);
    })
}
function selectionWatcher(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        const ctx: Context = context.value as Context;
        curPage.value = ctx.selection.selectedPage;
    }
}
function keyR(e: KeyboardEvent) {
    if (e.code === KEYBOARD.Rect) {
        context.value.keyboard.keydown_r();
    }
}

onMounted(() => {    
    context.value.selection.watch(selectionWatcher);
    switchPage(props.data.pagesList[0]?.id);
    if (localStorage.getItem(SCREEN_SIZE.KEY) === SCREEN_SIZE.FULL) {
        document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
    }
    window.addEventListener('blur', onWindowBlur);
    // keyboard.setupKeyboardListener();
    document.addEventListener('keydown', keyR);
})
onUnmounted(() => {
    context.value.selection.unwatch(selectionWatcher);
    window.removeEventListener('blur', onWindowBlur);
    // keyboard.removeKeyboardListener();
    document.removeEventListener('keydown', keyR);
})
</script>

<template>
    <div id="top" @dblclick="screenSetting">
        <Toolbar :context="context" />
    </div>
    <ColSplitView 
        id="center"
        :left="{width: 0.1, minWidth: 0.1, maxWidth: 0.5}" 
        :middle="{width: 0.8, minWidth: 0.3, maxWidth: 0.8}"
        :right="{width: 0.1, minWidth: 0.1, maxWidth: 0.5}" 
        :right-min-width-in-px="336" 
        :left-min-width-in-px="336"
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
        --left-navi-button-hover-color: var(--grey-light);
        --left-navi-button-select-color: var(--grey-dark);
        --left-navi-font-color: var(--theme-color);
        /* right attribute col */
        --right-attr-bg-color: var(--theme-color-anti);
        /* center content area */
        --center-content-bg-color: var(--grey-light);
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
    .navigation {
        flex-flow: column nowrap;
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
        height: 100%;
        background-color: var(--right-attr-bg-color);
        z-index: 1;
    }

</style>
