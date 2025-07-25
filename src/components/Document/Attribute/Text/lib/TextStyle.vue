/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<template>
    <div id="text-lib-panel" class="text-lib-panel">
        <PopoverHeader :title="t('stylelib.format')" @create="showCreatePanel" @close="emits('close')" />
        <div style="padding: 12px 8px; box-sizing: border-box;" @wheel.stop>
            <SearchInput :list="libs" v-model:type="currentLibs" v-model:value="keyword" />
            <el-scrollbar>
                <div class="content">
                    <SheetPanel v-for="sheet in sheets" :key="sheet.id" :context="context" :manager="manager"
                        :item="TextMaskPanelItem" :data="sheet" @update="update" />
                    <div v-if="!sheets?.length && keyword" class="search-null">{{ t('stylelib.null_search') }}</div>
                    <div v-if="!sheets?.length && !keyword" class="data-null">{{ t('stylelib.null_data') }}</div>
                </div>
            </el-scrollbar>
        </div>
        <CreateBlurStyle v-if="createPanelStatus.visible" :manager="manager" :context="context"
            @close="closeCreatePanel" />
    </div>

</template>
<script setup lang="ts">
import { Context } from '@/context';
import { onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { StyleSheet } from "@kcaitech/vextra-core/dist/types/data/typesdefine";
import { TextContextMgr } from "../ctx";
import { SheetCatch } from "@/components/Document/Attribute/stylectx";
import SearchInput from "@/components/common/SearchInput.vue";
import SheetPanel from "@/components/Document/Attribute/StyleLib/SheetPanel.vue";
import PopoverHeader from "@/components/common/PopoverHeader.vue";
import CreateBlurStyle from './ModifyTextMaskPanel.vue';
import TextMaskPanelItem from './TextMaskPanelItem.vue';

const props = defineProps<{
    context: Context;
    manager: TextContextMgr;
}>()

const emits = defineEmits<{
    (e: 'close'): void
}>()

const { t } = useI18n()
const keyword = ref<string>('')
const libs = ref<{ label: string, value: string }[]>([]);
const currentLibs = ref<string>('all');
const sheets = ref<SheetCatch[]>([]);

const all = t('stylelib.all');
const local = t('stylelib.local_style');

const createPanelStatus = reactive<ElementStatus>({ id: '#modify-text-panel', visible: false });
const createPanelStatusMgr = new ElementManager(
    props.context,
    createPanelStatus,
    {
        offsetLeft: -422,
        whiteList: ['.modify-text-panel', '.add']
    }
);
props.manager.catchPanel(createPanelStatusMgr);

const showCreatePanel = (e: MouseEvent) => {
    createPanelStatusMgr.showBy(e);
}
const closeCreatePanel = () => {
    createPanelStatusMgr.close();
}

function updateLib() {
    libs.value.length = 0;
    if (!props.context.data.stylelib) return;
    libs.value.push({ label: all, value: 'all' });
    props.context.data.stylelib.map(lib => {
        if (lib.id === props.context.data.id) {
            libs.value.push({ label: local, value: lib.id });
        } else {
            libs.value.push({ label: lib.name, value: lib.id });
        }
    })
}

function update() {
    updateLib();

    const sheet = currentLibs.value;
    const word = keyword.value;

    let _sheets: StyleSheet[] = [...props.context.data.stylelib ?? []] as StyleSheet[];
    if (sheet !== 'all') _sheets = _sheets.filter(i => i.id === sheet);

    sheets.value = _sheets.map(sts => {
        const cat: any = {
            name: sts.name,
            id: sts.id,
            variables: []
        };
        if (cat.id === props.context.data.id) cat.name = local;

        for (const v of sts.variables) {
            if (v.typeId === "text-mask-living" && !v.disabled) cat.variables.push(v);
        }
        if (word) {
            const reg = new RegExp(`${word}`, 'img');
            cat.variables = cat.variables.filter((i: any) => i.name.search(reg) > -1);
        }
        return cat as SheetCatch;
    }).filter(sc => sc.variables.length);
}

function stylelib_watcher(t: number | string) {
    if (t === 'stylelib') update();
}

const stop = watchEffect(update);

onMounted(() => {
    update();
    props.context.data.watch(stylelib_watcher);
})
onUnmounted(() => {
    props.context.data.unwatch(stylelib_watcher);
    createPanelStatusMgr.unmounted();
    stop();
})

</script>
<style lang="scss" scoped>
.text-lib-panel {
    position: fixed;
    background-color: #fff;
    z-index: 9;
    width: 230px;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    border-radius: 8px;
    margin-bottom: 8px;
    box-sizing: border-box;

    .content {
        display: flex;
        flex-direction: column;
        max-height: 380px;
        min-height: 120px;
        box-sizing: border-box;
        padding: 8px 0;

        .search-null {
            margin: auto;
        }

        .data-null {
            margin: auto;
        }
    }

}

.active {
    background-color: #f5f5f5;

    .editor {
        visibility: visible !important;
        background-color: #e5e5e5;
    }
}
</style>
