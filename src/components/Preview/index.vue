<script setup lang="ts">
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { PageView } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import { initDataModule } from '@/components/common/initmodule';
import Toolbar from '@/components/Preview/PreviewToolbar/index.vue'
import ColSplitView from '@/components/common/ColSplitView.vue';
import Loading from '@/components/common/Loading.vue';
import Navigation from '@/components/Preview/PreviewNavigation/index.vue'
import { Preview } from '@/context/preview';
import PreviewContent from '@/components/Display/PreviewContent.vue';
import { keyboard, selectedShape } from '@/utils/preview';
import { IContext } from '@/openapi';
import { Selection } from '@/context/selection';

const props = defineProps<{ context: IContext }>();
const context = props.context as Context;

const { t } = useI18n();
const loading = ref<boolean>(false);
const showLeft = ref<boolean>(true);
const curPage = shallowRef<PageView | undefined>(undefined);
const leftTriggleVisible = ref<boolean>(false);
let uninstall_keyboard_units: () => void = () => {
};
const showTop = ref<boolean>(true);
const Left = ref({ leftMin: 250, leftWidth: 250, leftMinWidth: 250 });
const inited = ref(false);

function switchPage(id?: string) {
    if (!id) return
    const cur_page = context.selection.selectedPage;
    if (cur_page && cur_page.id === id) return;
    context.selection.selectPage(id).then(p => {
        if (!p) return;
        selectedShape(context, p, t);
        curPage.value = p;
    })
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

const selectionWatcher = (t: number | string) => {
    if (t === Selection.CHANGE_PAGE) {
        curPage.value = context.selection.selectedPage;
    }
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
    context.selection.watch(selectionWatcher);
}

function init_keyboard_units() {
    uninstall_keyboard_units = keyboard(context);
}

const changeLeftWidth = (width: number) => {
    Left.value.leftWidth = width;
}

onMounted(() => {
    initDataModule().then(() => {
        inited.value = true;
    }).catch((e) => {
        console.log(e)
    })
    init_keyboard_units();
    init_watcher();
})

onUnmounted(() => {
    context.preview.unwatch(previewWatcher);
    context.selection.unwatch(selectionWatcher);
    uninstall_keyboard_units();
})

</script>

<template>
<div class="main" style="height: 100vh;">
    <div id="top" v-if="showTop">
        <Toolbar :context="context" v-if="!loading"></Toolbar>
    </div>
    <ColSplitView v-if="inited" id="center" :style="{ height: showTop ? 'calc(100% - 46px)' : '100%' }"
                  :left="{ width: Left.leftWidth, minWidth: Left.leftMinWidth, maxWidth: 0.4 }" :right="0"
                  :context="context"
                  @changeLeftWidth="changeLeftWidth">
        <template #slot1>
            <Navigation v-if="curPage" id="navigation" :context="context" @mouseenter="mouseenter"
                        :page="curPage as PageView" :showLeft="showLeft" :leftTriggleVisible="leftTriggleVisible"
                        @showNavigation="showHiddenLeft" @switchpage="switchPage">
            </Navigation>
        </template>

        <template #slot2>
            <PreviewContent v-if="curPage" id="content" :context="context" @mouseenter="mouseleave"
                            :showTop="showTop" :page="curPage as PageView" mode="preview"/>
        </template>
    </ColSplitView>
    <Loading v-if="loading" :size="20"></Loading>
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