<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, shallowRef, computed, ref } from 'vue';
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
import { KeyboardKeys, WorkSpace } from '@/context/workspace';
const props = defineProps<{ data: Document, repo: Repository }>();
const curPage = shallowRef<Page | undefined>(undefined);
const context = shallowRef<Context>(new Context(props.data, props.repo));
(window as any).__context = context.value;
const workspace = computed<WorkSpace>(() => context.value.workspace);
const middleWidth = ref<number>(0.8)
const middleMinWidth = ref<number>(0.3)

const Right = ref({
    rightMin: 336,
    rightMinWidth: 0.1,
    rightWidth: 0.1
})

const Left = ref({
    leftMin: 336,
    leftWidth: 0.1,
    leftMinWidth: 0.1
})
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
function keyboardEventHandler(e: KeyboardEvent) {
    const { ctrlKey, shiftKey, metaKey, altKey, target } = e;
    if (target instanceof HTMLInputElement) return; // 在输入框中输入时避免触发编辑器的键盘事件
    if (e.code === KeyboardKeys.R) {
        workspace.value.keydown_r();
    } else if (e.code === KeyboardKeys.V) {
        workspace.value.keydown_v();
    } else if (e.code === KeyboardKeys.L) {
        workspace.value.keydown_l(shiftKey);
    } else if (e.code === KeyboardKeys.Z) {
        workspace.value.keydown_z(props.repo, ctrlKey, shiftKey, metaKey);
    } else if (e.code === KeyboardKeys.K) {
        workspace.value.keydown_K();
    } else if (e.code === KeyboardKeys.O) {
        workspace.value.keydown_o();
    } else if (e.code === KeyboardKeys.F) {
        workspace.value.keydown_f();
    }
}
const showRight = ref<boolean>(true)
const showLeft = ref<boolean>(true)

const showHiddenRight = () => {
    if (showRight.value) {
        Right.value.rightMin = 0
        Right.value.rightWidth = 0
        Right.value.rightMinWidth = 0
        middleWidth.value = middleWidth.value + 0.1
        showRight.value = false
    } else {
        Right.value.rightMin = 336
        Right.value.rightWidth = 0.1
        Right.value.rightMinWidth = 0.1
        middleWidth.value = middleWidth.value - 0.1
        showRight.value = true
    }
}

const showHiddenLeft = () => {
    if (showLeft.value) {
        Left.value.leftMin = 0
        Left.value.leftWidth = 0
        Left.value.leftMinWidth = 0
        middleWidth.value = middleWidth.value + 0.1
        showLeft.value = false
    } else {
        Left.value.leftMin = 336
        Left.value.leftWidth = 0.1
        Left.value.leftMinWidth = 0.1
        middleWidth.value = middleWidth.value - 0.1
        showLeft.value = true
    }
}

onMounted(() => {
    context.value.selection.watch(selectionWatcher);
    switchPage(props.data.pagesList[0]?.id);
    if (localStorage.getItem(SCREEN_SIZE.KEY) === SCREEN_SIZE.FULL) {
        document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
    }
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('keydown', keyboardEventHandler);
})
onUnmounted(() => {
    context.value.selection.unwatch(selectionWatcher);
    window.removeEventListener('blur', onWindowBlur);
    document.removeEventListener('keydown', keyboardEventHandler);
})
</script>

<template>
    <div id="top" @dblclick="screenSetting">
        <Toolbar :context="context" />
    </div>
    <ColSplitView ref="colSplitView" id="center" :left="{ width: Left.leftWidth, minWidth: Left.leftMinWidth, maxWidth: 0.5 }"
        :middle="{ width: middleWidth, minWidth: middleMinWidth, maxWidth: middleWidth }"
        :right="{ width: Right.rightWidth, minWidth: Right.rightMinWidth, maxWidth: 0.5 }" :right-min-width-in-px="Right.rightMin"
        :left-min-width-in-px="Left.leftMin">
        <template #slot1>
            <Navigation v-if="curPage !== undefined" id="navigation" :context="context" @switchpage="switchPage"
                :page="(curPage as Page)"></Navigation>
                <div class="showHiddenL" @click="showHiddenLeft">
                    <svg-icon v-if="showLeft" class="svg" icon-class="left"></svg-icon>
                    <svg-icon v-else class="svg" icon-class="right"></svg-icon>
                </div>
        </template>
        <template #slot2>
            <ContentView v-if="curPage !== undefined" data-area="content" id="content" :context="context"
                :page="(curPage as Page)">
            </ContentView>
        </template>
        <template #slot3>
            <Attribute id="attributes" :context="context"></Attribute>
            <div class="showHiddenR" @click="showHiddenRight">
                <svg-icon v-if="showRight" class="svg" icon-class="right"></svg-icon>
                <svg-icon v-else class="svg" icon-class="left"></svg-icon>
            </div>
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
<style scoped lang="scss">
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
    flex-flow: row nowrap;
    flex: 1 1 auto;
    width: 100%;
    height: auto;
    overflow: hidden;
    position: relative;

    #navigation {
        height: 100%;
        background-color: var(--left-navi-bg-color);
        z-index: 1;
    }

    #content {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    #attributes {
        height: 100%;
        background-color: var(--right-attr-bg-color);
        z-index: 1;
    }

    .showHiddenR {
        position: absolute;
        left: -18px;
        top: 50%;
        cursor: pointer;
        >.svg {
            width: 18px;
            height: 18px;
        }
    }
    .showHiddenL {
        position: absolute;
        right: -18px;
        top: 50%;
        z-index: 1;
        cursor: pointer;

        >.svg {
            width: 18px;
            height: 18px;
        }
    }
}

#bottom {
    flex-flow: row nowrap;
    width: 100%;
    height: 30px;
    min-height: 30px;
    align-self: flex-end;
    background-color: var(--theme-color);
    z-index: 1;
}
</style>
