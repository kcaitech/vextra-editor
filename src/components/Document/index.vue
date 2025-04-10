/*
* Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
*
* This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
* The full license text can be found in the LICENSE file in the root directory of this source tree.
*
* For more information about the AGPL-3.0 license, please visit:
* https://www.gnu.org/licenses/agpl-3.0.html
*/

<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, ref, watch } from 'vue';
import ContentView from "./ContentView.vue";
import { Context } from '@/context';
import Navigation from './Navigation/index.vue';
import { Selection } from '@/context/selection';
import Attribute from './Attribute/RightTabs.vue';
import Toolbar from './Toolbar/index.vue'
import { PageView } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import Loading from '@/components/common/Loading.vue';
import Bridge from "@/components/Document/Bridge.vue";
import { Component } from '@/context/component';
import { initDataModule } from '@/basic/initmodule';
import { setup as keyboardUnits } from '@/utils/keyboardUnits';
import { Tool } from '@/context/tool';
import { ContextEvents, IContext } from '@/openapi';
import EditorLayout from "@/components/Document/Layout/EditorLayout.vue";
import { fontNameListEn, fontNameListZh, timeSlicingTask } from './Attribute/Text/FontNameList';

const emit = defineEmits<{
    (e: 'changeCmdId', id: string): void;
}>()

const props = defineProps<{ context: IContext, isDesktop?: boolean, fontCache?: string[], active?: boolean }>()
const { t } = useI18n();
const curPage = shallowRef<PageView | undefined>(undefined);
const rightWidth = ref(0);
const docInfo: any = ref({});
const showHint = ref(false);
const countdown = ref(10);
const loading = ref<boolean>(true);
const contentVisible = ref<boolean>(false);
const bridge = ref<boolean>(false);
const fileName = ref<string>(t('product.name'));

const customLoading = ref(false);

let uninstall_keyboard_units: () => void = () => {
};

function switchPage(id?: string, frame_id?: string) {
    if (!id) return
    const ctx: Context = props.context as Context;
    if (ctx.selection.selectedPage?.id === id) return;
    ctx.selection.selectPage(id);
    // todo delay show loading
    loading.value = true;
}

function selectionWatcher(t: number | string) {
    const ctx: Context = props.context as Context;
    if (t === Selection.CHANGE_PAGE) {
        curPage.value = ctx.selection.selectedPage;
        curPage.value?.m_ctx.setIsDoc(true); // 区分原型页和文档页
    }
}

const isLable = ref<boolean>(false);

function initUI() {
}

function init_keyboard_units() {
    const ctx: Context = props.context as Context;
    ctx.setActive(props.active);
    uninstall_keyboard_units = keyboardUnits(ctx)
}

watch(() => props.active, () => {
    const ctx: Context = props.context as Context;
    ctx.setActive(props.active);
})
const not_perm_hidden_right = () => {
    const readonly = (props.context as Context).readonly;
    if (readonly && !isLable.value) {
        rightWidth.value = 0
    } else if (isLable.value && readonly) {
        rightWidth.value = 240
    } else if (!isLable.value && !readonly) {
        rightWidth.value = 240
    }
}

const tool_watcher = (t: number) => {
    const ctx: Context = props.context as Context;
    if (t === Tool.LABLE_CHANGE) {
        isLable.value = ctx.tool.isLable;
        not_perm_hidden_right();
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
    ctx.data.watch(documentWatcher);
    ctx.repo.setOnChange((id: string) => {
        emit('changeCmdId', id);
    });
}

function workspaceWatcher(t: number, o?: any) {
    // if (t === WorkSpace.HIDDEN_UI) o ? keyToggleLR() : keyToggleTB();
}

let loopNet: any = null
//监听网络状态
let netErr: any = null

const closeLoading = () => {
    loading.value = false;
    contentVisible.value = true;
}
const onContentVisible = () => {
    contentVisible.value = true;
}

function component_watcher(t: number) {
    const ctx: Context = props.context as Context;
    if (t === Component.BRIDGE_CHANGE) {
        bridge.value = ctx.component.bridge;
    }
}

const stop = watch(fileName, (newVal) => {
    if (newVal) {
        (window as any).wx.miniProgram.postMessage({
            data: {
                name: newVal,
                id: docInfo.value.document.id
            }
        });
    }
})

function documentWatcher(...args: any[]) {
    if (args.includes['name']) (props.context as Context).notify(ContextEvents.document_name_change);
}

watch(() => props.fontCache, (newVal) => {
    if (newVal) {
        const ctx: Context = props.context as Context;
        ctx.workspace.setUserLocalFontList(newVal, props.isDesktop);
    }
})

onMounted(() => {
    initUI();
    init_watcher();
    init_keyboard_units();
    // sessionStorage.setItem('project_id', ''); // 不是editor要处理的
    initDataModule().catch((e) => {
        console.error(e)
    });
    const ctx: Context = props.context as Context;
    if (ctx.customLoading) {
        customLoading.value = true;
        ctx.watchCustomLoading((v) => {
            customLoading.value = v;
        })
    }
    if (!props.isDesktop) {
        timeSlicingTask(ctx, fontNameListZh, 'zh');
        timeSlicingTask(ctx, fontNameListEn, 'en');
    }
})

onUnmounted(() => {
    const ctx: Context = props.context as Context;
    window.document.title = t('product.name');
    ctx.selection.unwatch(selectionWatcher);
    ctx.workspace.unwatch(workspaceWatcher);
    ctx.tool.unwatch(tool_watcher);
    ctx.data.unwatch(documentWatcher);
    clearInterval(timer);
    localStorage.removeItem('docId')
    showHint.value = false;
    countdown.value = 10;
    clearInterval(loopNet);
    clearInterval(netErr);
    ctx.component.unwatch(component_watcher);
    uninstall_keyboard_units();
    clearInterval(updateDocumentKeyTimer); // 清除更新文档密钥定时器
    stop();
})
</script>

<template>
    <EditorLayout :context="(context as Context)">
        <template #top>
            <Toolbar v-if="contentVisible" :context="(context as Context)" />
        </template>
        <template #left>
            <Navigation v-if="curPage && contentVisible" :context="(context as Context)" @switchpage="switchPage"
                :page="(curPage as PageView)" />
        </template>
        <template #center>
            <ContentView v-if="curPage && !customLoading" :context="(context as Context)" :page="(curPage as PageView)"
                @closeLoading="closeLoading" @contentVisible="onContentVisible" />
        </template>
        <template #right>
            <Attribute v-if="contentVisible" :context="(context as Context)" />
        </template>
    </EditorLayout>
    <Bridge v-if="bridge" :context="(context as Context)" />
    <Loading v-if="loading || customLoading" :size="20" />
</template>