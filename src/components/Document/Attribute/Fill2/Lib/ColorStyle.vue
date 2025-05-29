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
    <div style="padding: 12px 8px; box-sizing: border-box;" @wheel.stop>
        <SearchInput :list="libs" v-model:type="currentLibs" v-model:value="keyword" />
        <el-scrollbar>
            <div class="content">
                <SheetPanel v-for="sheet in sheets" :key="sheet.id"
                            :context="context" :manager="manager" :data="sheet"
                            :list-status="manager.fillCtx.listStatus"
                            :item="manager.fillCtx.listStatus ? FillMaskGridItem : FillMaskPanelItem"/>
                <div v-if="!sheets?.length && keyword" class="search-null">{{ t('stylelib.null_search') }}</div>
                <div v-if="!sheets?.length && !keyword" class="data-null">{{ t('stylelib.null_data') }}</div>
            </div>
        </el-scrollbar>
    </div>
</template>
<script setup lang="ts">
import { Context } from '@/context';
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import SearchInput from "@/components/common/SearchInput.vue";
import SheetPanel from "@/components/Document/Attribute/StyleLib/SheetPanel.vue";
import FillMaskPanelItem from './FillMaskPanelItem.vue';
import FillMaskGridItem from '@/components/Document/Attribute/StyleLib/FillMaskGridItem.vue';
import { StyleSheet } from "@kcdesign/data"
import { FillsContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import { SheetCatch } from "@/components/Document/Attribute/stylectx";
import { useI18n } from 'vue-i18n';

/**
 * 样式列表：该组件可以展示样式、筛选样式
 * 该组件把每个表用一个SheetPanel组件展示，遍历了所有表
 */
const props = defineProps<{
    context: Context;
    manager: FillsContextMgr;
}>();

const { t } = useI18n();
const keyword = ref<string>('')
const libs = ref<{ label: string, value: string }[]>([]);
const currentLibs = ref<string>('all');
const sheets = ref<SheetCatch[]>([]);

function updateLib() {
    libs.value.length = 0;
    if (!props.context.data.stylelib) return;
    libs.value.push({ label: '全部样式', value: 'all' });
    props.context.data.stylelib.map(lib => {
        if (lib.id === props.context.data.id) {
            libs.value.push({ label: '此文件样式', value: lib.id });
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
        if (cat.id === props.context.data.id) cat.name = '此文件样式';

        for (const v of sts.variables) {
            if (v.typeId === "fill-mask" && !v.disabled) cat.variables.push(v);
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
    props.context.data.watch(stylelib_watcher);
})
onUnmounted(() => {
    props.context.data.unwatch(stylelib_watcher);
    stop();
})
</script>
<style lang="scss" scoped>
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
</style>
