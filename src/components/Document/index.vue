/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

/*
* Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
*
* This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
* The full license text can be found in the LICENSE file in the root directory of this source tree.
*
* For more information about the AGPL-3.0 license, please visit:
* https://www.gnu.org/licenses/agpl-3.0.html
*/

<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import ContentView from "./ContentView.vue";
import { Context } from '@/context';
import Navigation from './Navigation/index.vue';
import { Selection } from '@/context/selection';
import Attribute from './Attribute/RightTabs.vue';
import Toolbar from './Toolbar/index.vue'
import { PageView } from '@kcaitech/vextra-core';
import { useI18n } from 'vue-i18n';
import Loading from '@/components/common/Loading.vue';
import Bridge from "@/components/Document/Bridge.vue";
import { Component } from '@/context/component';
import { initDataModule } from '@/basic/initmodule';
import { setup as keyboardUnits } from '@/utils/keyboardUnits';
import { Tool } from '@/context/tool';
import { ContextEnvironment, ContextEvents, IContext } from '@/openapi';
import EditorLayout from "@/components/Document/Layout/EditorLayout.vue";
import { fontNameListEn, fontNameListZh, timeSlicingTask } from './Attribute/Text/FontNameList';

const emit = defineEmits<{
    (e: 'changeCmdId', id: string): void;
}>()

const props = defineProps<{ context: IContext, fontCache?: string[] }>()
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
        curPage.value?.ctx.setIsDoc(true); // 区分原型页和文档页
    }
}

const label = ref<boolean>(false);

function initUI() {
}

function init_keyboard_units() {
    const ctx: Context = props.context as Context;
    uninstall_keyboard_units = keyboardUnits(ctx)
}

const not_perm_hidden_right = () => {
    const readonly = (props.context as Context).readonly;
    if (readonly && !label.value) {
        rightWidth.value = 0
    } else if (label.value && readonly) {
        rightWidth.value = 240
    } else if (!label.value && !readonly) {
        rightWidth.value = 240
    }
}

const tool_watcher = (t: number) => {
    const ctx: Context = props.context as Context;
    if (t === Tool.LABEL_CHANGE) {
        label.value = ctx.tool.isLabel;
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
    ctx.repo.onChange((id: string) => {
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
        (window as any).wx?.miniProgram.postMessage({
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
        ctx.workspace.setUserLocalFontList(newVal);
    }
})

onMounted(() => {
    initUI();
    init_watcher();
    init_keyboard_units();
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
    if (ctx.env === ContextEnvironment.Web) {
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