<script setup lang="ts">
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { Page, PageView } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import { WorkSpace } from '@/context/workspace';
import { initpal } from '@/components/common/initpal';
import Toolbar from '@/components/Preview/PreviewToolbar/index.vue'
import ColSplitView from '@/components/common/ColSplitView.vue';
import Loading from '@/components/common/Loading.vue';
import Navigation from '@/components/Preview/PreviewNavigation/index.vue'
import SubLoading from '@/components/common/SubLoading.vue';
import { Preview } from '@/context/preview';
import PreviewContent from './PreviewContent.vue';
import { keyboard, selectedShape } from '@/utils/preview';
import { IContext } from '@/openapi';
import { Selection } from '@/context/selection';

const props = defineProps<{ context: IContext }>()
const context = props.context as Context;

const { t } = useI18n();
const loading = ref<boolean>(false);
const showLeft = ref<boolean>(true);
const curPage = shallowRef<PageView | undefined>(undefined);
const sub_loading = ref<boolean>(false);
const leftTriggleVisible = ref<boolean>(false);
let uninstall_keyboard_units: () => void = () => {
};
const showTop = ref<boolean>(true);
const Left = ref({ leftMin: 250, leftWidth: 250, leftMinWidth: 250 });
const inited = ref(false);
function switchPage(id?: string) {
    if (!id) return
    if (context) {
        const ctx: Context = context;
        const pagesMgr = ctx.data.pagesMgr;
        const cur_page = context.selection.selectedPage;
        if (cur_page && cur_page.id === id) return;
        pagesMgr.get(id).then((page: Page | undefined) => {
            if (page) {
                curPage.value = undefined;
                const pagedom = ctx.getPageDom(page).dom;
                ctx.selection.selectPage(pagedom);
                selectedShape(ctx, pagedom, t);
                curPage.value = pagedom;
            }
        })
    }
}

function previewWatcher(t: number | string) {
    if (t === Preview.UI_CHANGE) {
        if (!context.preview.uiState) {
            if (showLeft.value && showTop.value) {
                showHiddenLeft();
                showTop.value = false;
            } else if (!showLeft.value) {
                showTop.value = false;
            }
        } else {
            if (!showLeft.value) {
                showHiddenLeft();
            }
            showTop.value = true;
        }
    } else if (t === Preview.NAVI_CHANGE) {
        showHiddenLeft();
    }
}
function workspaceWatcher(t: number, o?: any) {
    if (t === WorkSpace.FREEZE) {
        sub_loading.value = true;
    } else if (t === WorkSpace.THAW) {
        sub_loading.value = false;
    }
}

const selectionWatcher = (t: number | string) => {
    if (t === Selection.CHANGE_PAGE) {
        const ctx: Context = context;
        curPage.value = ctx.selection.selectedPage;
    }
}

function switchFullScreen() {

}
let timerForLeft: any;
const showHiddenLeft = () => {

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
    context.preview.showNavi(showLeft.value);
}

function mouseenter() {
    if (timerForLeft) {
        clearTimeout(timerForLeft);
        timerForLeft = undefined;
    }
    leftTriggleVisible.value = true;
}
function mouseleave() {
    const delay = 80;
    timerForLeft = setTimeout(() => {
        if (!timerForLeft) return;
        leftTriggleVisible.value = false;
        clearTimeout(timerForLeft);
        timerForLeft = undefined;
    }, delay);

}


function init_watcher() {

    context.preview.watch(previewWatcher);
    context.workspace.watch(workspaceWatcher);
    context.selection.watch(selectionWatcher);
}

function init_keyboard_uints() {

    uninstall_keyboard_units = keyboard(context);
}

const changeLeftWidth = (width: number) => {
    Left.value.leftWidth = width;
}

onMounted(() => {
    initpal().then(() => {
        inited.value = true;
    }).catch((e) => {
        console.log(e)
    })
    init_keyboard_uints();
    init_watcher();
})

onUnmounted(() => {
    context.preview.unwatch(previewWatcher);
    context.workspace.unwatch(workspaceWatcher);
    context.selection.unwatch(selectionWatcher);
    uninstall_keyboard_units();
})

</script>

<template>
    <div class="main" style="height: 100vh;">
        <Loading v-if="loading" :size="20"></Loading>
        <div id="top" @dblclick="switchFullScreen" v-if="showTop">
            <Toolbar :context="context" v-if="!loading"></Toolbar>
        </div>
        <ColSplitView id="center" :style="{ height: showTop ? 'calc(100% - 46px)' : '100%' }" v-if="inited"
            :left="{ width: Left.leftWidth, minWidth: Left.leftMinWidth, maxWidth: 0.4 }" :right="0" :context="context"
            @changeLeftWidth="changeLeftWidth">
            <template #slot1>
                <Navigation v-if="curPage !== undefined" id="navigation" :context="context" @mouseenter="mouseenter"
                    :page="(curPage as PageView)" :showLeft="showLeft" :leftTriggleVisible="leftTriggleVisible"
                    @showNavigation="showHiddenLeft" @switchpage="switchPage">
                </Navigation>
            </template>

            <template #slot2>
                <PreviewContent v-if="curPage !== undefined" id="content" :context="context" @mouseenter="mouseleave"
                    :showTop="showTop" :page="(curPage as PageView)"></PreviewContent>
            </template>
        </ColSplitView>
        <SubLoading v-if="sub_loading"></SubLoading>
    </div>
</template>

<style scoped lang="scss">
.main {
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
        z-index: 21;
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
    }
}
</style>