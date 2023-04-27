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
import { WorkSpace } from '@/context/workspace';
import ApplyFor from './Toolbar/Share/ApplyFor.vue';
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
const showRight = ref<boolean>(true);
const showLeft = ref<boolean>(true);
const showTop = ref<boolean>(true);
const showBottom = ref<boolean>(true);
// 模拟申请人
const applicant:any = [
    // {
    //     name: '张三',
    //     file: '图形页面',
    //     authority: '只读',
    //     remarks: ''
    // },
    // {
    //     name: '唐三',
    //     file: '矩形容器',
    //     authority: '可编辑',
    //     remarks: '麻溜的'
    // },
    // {
    //     name: '陈三',
    //     file: '文字图片',
    //     authority: '只读',
    //     remarks: '别让我久等'
    // }
]

const closeApplyFor = (index: number) => {
    // applicant.splice(index, 1)
}
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
const leftTriggleVisible = ref<boolean>(false);
const rightTriggleVisible = ref<boolean>(false);
let timerForLeft: any;
let timeForRight: any;
function mouseenter(t: 'left' | 'right') {
    if (t === 'left') {
        if (timerForLeft) {
            clearTimeout(timerForLeft);
            timerForLeft = undefined;
        }
        leftTriggleVisible.value = true;
    } else {
        if (timeForRight) {
            clearTimeout(timeForRight);
            timeForRight = undefined;
        }
        rightTriggleVisible.value = true;
    }
}
function mouseleave(t: 'left' | 'right') {
    const delay = 2000;
    if (t === 'left') {
        timerForLeft = setTimeout(() => {
            if (!timerForLeft) return;
            leftTriggleVisible.value = false;
            clearTimeout(timerForLeft);
            timerForLeft = undefined;
        }, delay);
    } else {
        timeForRight = setTimeout(() => {
            if (!timeForRight) return;
            rightTriggleVisible.value = false;
            clearTimeout(timeForRight);
            timeForRight = undefined;
        }, delay);
    }
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
function keyboardEventHandler(evevt: KeyboardEvent) {
    const { target, code, ctrlKey, metaKey, shiftKey } = evevt;
    if (target instanceof HTMLInputElement) return; // 在输入框中输入时避免触发编辑器的键盘事件

    workspace.value.keyboardHandle(evevt); // 编辑器相关的键盘事件

    if (code === 'Backslash') {
        if (ctrlKey || metaKey) {
            shiftKey ? keyToggleTB() : keyToggleLR()
        }
    }

}
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
function keyToggleLR() {
    if (showRight.value !== showLeft.value) {
        showHiddenLeft();
    } else {
        showHiddenLeft();
        showHiddenRight();
    }
}
function keyToggleTB() {
    if (showRight.value !== showLeft.value) {
        showHiddenLeft();
        return;
    }
    if (showTop.value !== showLeft.value) {
        showHiddenLeft();
        showHiddenRight();
        return;
    }
    showHiddenLeft();
    showHiddenRight();
    showBottom.value = !showBottom.value;
    showTop.value = showBottom.value;
}

onMounted(() => {
    context.value.selection.watch(selectionWatcher);
    switchPage(props.data.pagesList[0]?.id);
    if (localStorage.getItem(SCREEN_SIZE.KEY) === SCREEN_SIZE.FULL) {
        document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
    }
    document.addEventListener('keydown', keyboardEventHandler);
})
onUnmounted(() => {
    context.value.selection.unwatch(selectionWatcher);
    document.removeEventListener('keydown', keyboardEventHandler);
})
</script>

<template>
    <div id="top" @dblclick="screenSetting" v-if="showTop">
        <Toolbar :context="context" />
    </div>
    <div id="visit" v-if="applicant.length">
        <ApplyFor v-for="(item, index) in applicant" :key="index" :index="index" :name="item.name" 
            :authority=item.authority :file="item.file" :remarks="item.remarks" @close="closeApplyFor">
        </ApplyFor>
    </div>
    <ColSplitView ref="colSplitView" id="center"
        :left="{ width: Left.leftWidth, minWidth: Left.leftMinWidth, maxWidth: 0.5 }"
        :middle="{ width: middleWidth, minWidth: middleMinWidth, maxWidth: middleWidth }"
        :right="{ width: Right.rightWidth, minWidth: Right.rightMinWidth, maxWidth: 0.5 }"
        :right-min-width-in-px="Right.rightMin" :left-min-width-in-px="Left.leftMin">
        <template #slot1>
            <Navigation v-if="curPage !== undefined" id="navigation" :context="context" @switchpage="switchPage"
                @mouseenter="() => { mouseenter('left') }" @mouseleave="() => { mouseleave('left') }"
                :page="(curPage as Page)">
            </Navigation>
            <div class="showHiddenL" @click="showHiddenLeft" v-if="!showLeft || leftTriggleVisible"
                :style="{ opacity: showLeft ? 1 : 0.6 }">
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
            <Attribute id="attributes" :context="context" @mouseenter="e => { mouseenter('right') }"
                @mouseleave="() => { mouseleave('right') }"></Attribute>
            <div class="showHiddenR" @click="showHiddenRight" v-if="!showRight || rightTriggleVisible"
                :style="{ opacity: showRight ? 1 : 0.6 }">
                <svg-icon v-if="showRight" class="svg" icon-class="right"></svg-icon>
                <svg-icon v-else class="svg" icon-class="left"></svg-icon>
            </div>
        </template>
    </ColSplitView>
    <div id="bottom" v-if="showBottom"></div>
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
    background-color: var(--top-toolbar-bg-color);
    z-index: 2;
    min-height: 40px;
}
#visit {
    position: absolute;
    top: 45px;
    right: 10px;
    z-index: 99;
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
        left: -12px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        height: 60px;
        background-color: var(--theme-color-anti);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px 0px 0px 4px;

        >.svg {
            width: 12px;
            height: 12px;
        }
    }

    .showHiddenL {
        position: absolute;
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
        cursor: pointer;
        height: 60px;
        background-color: var(--theme-color-anti);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0 4px 4px 0;

        >.svg {
            width: 12px;
            height: 12px;
        }
    }
}

#bottom {
    transition: 0.18s;
    flex-flow: row nowrap;
    width: 100%;
    height: 30px;
    min-height: 30px;
    align-self: flex-end;
    background-color: var(--theme-color);
    z-index: 1;
}
</style>
