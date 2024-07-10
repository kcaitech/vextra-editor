<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, ref, watch } from 'vue';
import ContentView from "./ContentView.vue";
import { Context } from '@/context';
import Navigation from './Navigation/index.vue';
import { Selection } from '@/context/selection';
import Attribute from './Attribute/RightTabs.vue';
import Toolbar from './Toolbar/index.vue'
import ColSplitView from '@/components/common/ColSplitView.vue';
import { PageView } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import Loading from '@/components/common/Loading.vue';
import SubLoading from '@/components/common/SubLoading.vue';
import { WorkSpace } from '@/context/workspace';
import Bridge from "@/components/Document/Bridge.vue";
import { Component } from '@/context/component';
import { initpal } from './initpal';
import { setup as keyboardUnits } from '@/utils/keyboardUnits';
import { Tool } from '@/context/tool';
import { IContext } from '@/openapi';

const props = defineProps<{ context: IContext }>()

const { t } = useI18n();
const curPage = shallowRef<PageView | undefined>(undefined);
const rightWidth = ref(250);
const Left = ref({ leftMin: 250, leftWidth: 250, leftMinWidth: 250 });
const showRight = ref<boolean>(true);
const showLeft = ref<boolean>(true);
const showTop = ref<boolean>(true);
const showBottom = ref<boolean>(true);
const docInfo: any = ref({});
const showHint = ref(false);
const countdown = ref(10);
const leftTriggerVisible = ref<boolean>(false);
const rightTriggleVisible = ref<boolean>(false);
let timerForLeft: any;
let timeForRight: any;
const loading = ref<boolean>(false);
const sub_loading = ref<boolean>(false);
const isEdit = ref(true);
const bridge = ref<boolean>(false);
const inited = ref(false);
const fileName = ref<string>(t('product.name'));
let uninstall_keyboard_units: () => void = () => {
};

function mouseenter(t: 'left' | 'right') {
    if (t === 'left') {
        if (timerForLeft) {
            clearTimeout(timerForLeft);
            timerForLeft = undefined;
        }
        leftTriggerVisible.value = true;
    } else {
        if (timeForRight) {
            clearTimeout(timeForRight);
            timeForRight = undefined;
        }
        rightTriggleVisible.value = true;
    }
}

function mouseleave(t: 'left' | 'right') {
    const delay = 80;
    if (t === 'left') {
        timerForLeft = setTimeout(() => {
            if (!timerForLeft) return;
            leftTriggerVisible.value = false;
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

function switchPage(id?: string, frame_id?: string) {
    if (!id) return

    const ctx: Context = props.context as Context;
    ctx.selection.selectPage(id);
}


function selectionWatcher(t: number | string) {
    const ctx: Context = props.context as Context;
    if (t === Selection.CHANGE_PAGE) {
        curPage.value = ctx.selection.selectedPage;

    }
}

const isLable = ref<boolean>(false);
const showHiddenRight = () => {
    if (showRight.value || (!isEdit.value && !isLable.value)) {
        rightWidth.value = 0
        showRight.value = false
    } else {
        rightWidth.value = 250
        showRight.value = true
    }
}
const showHiddenLeft = () => {
    const ctx: Context = props.context as Context;
    const w = ctx.workspace;
    if (showLeft.value) {
        Left.value.leftMin = 0
        Left.value.leftWidth = 0
        Left.value.leftMinWidth = 0
        showLeft.value = false
    } else {
        Left.value.leftMin = 250
        Left.value.leftWidth = 250
        Left.value.leftMinWidth = 250
        showLeft.value = true
    }
    w.notify(WorkSpace.CHANGE_NAVI);
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
    const ctx: Context = props.context as Context;
    if (showTop.value) {
        ctx.workspace.matrix.trans(0, -40);
    } else {
        ctx.workspace.matrix.trans(0, 40);
    }
    ctx.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}

const tool_watcher = (t: number) => {
    const ctx: Context = props.context as Context;
    if (t === Tool.LABLE_CHANGE) {
        isLable.value = ctx.tool.isLable;
        not_perm_hidden_right();
    }
}
const not_perm_hidden_right = () => {
    if (!isEdit.value && !isLable.value) {
        rightWidth.value = 0
    } else if (isLable.value && !isEdit.value) {
        rightWidth.value = 250
    } else if (!isLable.value && isEdit.value && !showRight.value) {
        rightWidth.value = 250
    }
}

let updateDocumentKeyTimer: ReturnType<typeof setInterval> | Parameters<typeof clearInterval>[0] = undefined;

let timer: any = null;

function init_watcher() {
    const ctx: Context = props.context as Context;
    ctx.selection.watch(selectionWatcher);
    ctx.workspace.watch(workspaceWatcher);
    ctx.component.watch(component_watcher);
    ctx.tool.watch(tool_watcher);
}

function init_keyboard_units() {

    const ctx: Context = props.context as Context;
    uninstall_keyboard_units = keyboardUnits(ctx)
}

function workspaceWatcher(t: number, o?: any) {
    if (t === WorkSpace.FREEZE) {
        sub_loading.value = true;
    } else if (t === WorkSpace.THAW) {
        sub_loading.value = false;
    } else if (t === WorkSpace.HIDDEN_UI) {
        o ? keyToggleLR() : keyToggleTB();
    }
}

let loopNet: any = null
//监听网络状态
let netErr: any = null

const closeLoading = () => {
    loading.value = false;
}

const changeLeftWidth = (width: number) => {
    Left.value.leftWidth = width;
}

function component_watcher(t: number) {
    const ctx: Context = props.context as Context;
    if (t === Component.BRIDGE_CHANGE) {
        bridge.value = ctx.component.bridge;
    }
}

watch(fileName, (NewName) => {
    if (NewName) {
        (window as any).wx.miniProgram.postMessage({
            data: {
                name: NewName,
                id: docInfo.value.document.id
            }
        });
    }
})

onMounted(() => {
    init_watcher();
    init_keyboard_units();
    localStorage.setItem('project_id', '');
    initpal().then(() => {
        inited.value = true;
    }).catch((e) => {
        console.log(e)
    })
})

onUnmounted(() => {
    const ctx: Context = props.context as Context;
    window.document.title = t('product.name');
    (window as any).sketchDocument = undefined;
    (window as any).skrepo = undefined;
    ctx.selection.unwatch(selectionWatcher);
    ctx.workspace.unwatch(workspaceWatcher);
    ctx.tool.unwatch(tool_watcher);
    clearInterval(timer);
    localStorage.removeItem('docId')
    showHint.value = false;
    countdown.value = 10;
    clearInterval(loopNet);
    clearInterval(netErr);
    ctx.component.unwatch(component_watcher);
    uninstall_keyboard_units();
    stop();
    clearInterval(updateDocumentKeyTimer); // 清除更新文档密钥定时器
})
</script>

<template>
<div class="editor" style="height: 100vh;">
    <Loading v-if="loading" :size="20"/>
    <div id="top" v-if="showTop">
        <Toolbar :context="context as Context" v-if="!loading"/>
    </div>
    <ColSplitView id="center" :style="{ height: showTop ? 'calc(100% - 46px)' : '100%' }"
                  v-if="inited" :left="{ width: Left.leftWidth, minWidth: Left.leftMinWidth, maxWidth: 0.4 }"
                  :right="rightWidth" :context="context as Context" @changeLeftWidth="changeLeftWidth">
        <template #slot1>
            <Navigation v-if="curPage !== undefined" id="navigation" :context="context as Context"
                        @switchpage="switchPage" @mouseenter="() => { mouseenter('left') }"
                        @showNavigation="showHiddenLeft"
                        :page="(curPage as PageView)" :showLeft="showLeft" :leftTriggerVisible="leftTriggerVisible">
            </Navigation>
        </template>

        <template #slot2>
            <ContentView v-if="curPage !== undefined" id="content" :context="context as Context"
                         @mouseenter="() => { mouseleave('left') }" :page="(curPage as PageView)"
                         @closeLoading="closeLoading">
            </ContentView>
        </template>

        <template #slot3>
            <Attribute id="attributes" v-if="!loading" :context="context as Context"
                       @mouseenter="(e: Event) => { mouseenter('right') }" @mouseleave="() => { mouseleave('right') }"
                       :showRight="showRight" :rightTriggleVisible="rightTriggleVisible"
                       @showAttrbute="showHiddenRight">
            </Attribute>
        </template>
    </ColSplitView>
    <SubLoading v-if="sub_loading"/>

    <Bridge v-if="bridge" :context="context as Context"/>
</div>
</template>

<style scoped lang="scss">
.editor {
    min-width: 460px;
    width: 100%;
    overflow-x: auto;

    @media (max-width: 460px) {
        overflow-x: scroll;
    }

    &::-webkit-scrollbar {
        display: none;
    }

    &::-webkit-scrollbar-track {
        display: none;
    }

    &::-webkit-scrollbar-thumb {
        display: none;
    }

    &::-webkit-scrollbar-thumb:hover {
        display: none;
    }

    &::-webkit-scrollbar-thumb:active {
        display: none;
    }

    #top {
        display: flex;
        flex-flow: row nowrap;
        width: 100%;
        height: 46px;
        background: var(--theme-color);
        padding: 10px 8px;
        box-sizing: border-box;
        position: relative;
        z-index: 19;
    }

    .network {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
    }

    #visit {
        position: absolute;
        top: 45px;
        right: 10px;
        z-index: 999;
        overflow: hidden;
        height: calc(100% - 45px);
    }

    #center {
        display: flex;
        flex-flow: row nowrap;
        width: 100%;
        overflow: hidden;
        position: relative;

        #navigation {
            height: 100%;
            background-color: var(--left-navi-bg-color);
        }

        #content {
            width: 100%;
            height: 100%;
            overflow: hidden;
            position: relative;
        }

        #attributes {
            height: 100%;
            background-color: var(--right-attr-bg-color);
            z-index: 9;
        }
    }

    .notification {
        position: fixed;
        font-size: var(--font-default-fontsize);
        display: flex;
        align-items: center;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        color: red;
        background-color: #fff;
        border: 1px solid #ccc;
        padding: 7px 30px;
        border-radius: 4px;

        .text {
            margin: 0 15px 0 10px;
        }
    }

    .network_error {
        position: fixed;
        font-size: var(--font-default-fontsize);
        display: flex;
        align-items: center;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        color: #f1f1f1;
        background-color: var(--active-color);
        padding: 7px 30px;
        border: 1px solid var(--active-color);
        border-radius: 4px;

        .loading-spinner {
            > svg {
                width: 15px;
                height: 15px;
                color: #000;
            }

            & {
                animation: spin 1s linear infinite;
            }
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }
    }
}
</style>
