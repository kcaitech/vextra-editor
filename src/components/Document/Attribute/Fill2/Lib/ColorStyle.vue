<template>
    <div style="padding: 8px 12px; box-sizing: border-box;" @wheel.stop>
        <SearchInput :list="libs" v-model:type="currentLibs" v-model:value="keyword"/>
        <el-scrollbar>
            <div class="content">
                <SheetPanel v-for="sheet in sheets" :key="sheet.id" :context="context" :item="FillMaskPanelItem"
                            :data="sheet"/>
                <div v-if="!sheets?.length && keyword" class="search-null">没有搜索到相关样式</div>
                <div v-if="!sheets?.length && !keyword" class="data-null">暂无颜色样式</div>
            </div>
        </el-scrollbar>
    </div>
</template>
<script setup lang="ts">
import { Context } from '@/context';
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import SearchInput from "@/components/common/SearchInput.vue";
import { SheetCatch } from "@/components/Document/Attribute/Fill2/Lib/ctx";
import SheetPanel from "@/components/Document/Attribute/StyleLib/SheetPanel.vue";
import FillMaskPanelItem from './FillMaskPanelItem.vue';
import { StyleSheet } from "@kcdesign/data"

const props = defineProps<{
    context: Context;
}>();
const keyword = ref<string>('')
const libs = ref<{ label: string, value: string }[]>([]);
const currentLibs = ref<string>('all');
const sheets = ref<SheetCatch[]>([]);

function updateLib() {
    libs.value.length = 0;
    if (!props.context.data.stylelib) return;
    libs.value.push({label: '全部样式', value: 'all'});
    props.context.data.stylelib.map(lib => {
        if (lib.id === props.context.data.id) {
            libs.value.push({label: '此文件样式', value: lib.id});
        } else {
            libs.value.push({label: lib.name, value: lib.id});
        }
    })
}
function update() {
    updateLib();

    const sheet = currentLibs.value;
    const word = keyword.value;

    let _sheets: StyleSheet [] = [...props.context.data.stylelib ?? []] as StyleSheet[];
    if (sheet !== 'all') _sheets = _sheets.filter(i => i.id === sheet);

    sheets.value = _sheets.map(sts => {
        const cat: any = {
            name: sts.name,
            id: sts.id,
            variables: []
        };
        if (cat.id === props.context.data.id) cat.name = '此文件样式';

        for (const v of sts.variables) {
            if (v.typeId === "fill-mask-living") cat.variables.push(v);
        }
        if (word) {
            const reg = new RegExp(`${word}`, 'img');
            cat.variables = cat.variables.filter((i: any) => i.name.search(reg) > -1);
        }
        return cat as SheetCatch;
    }).filter(sc => sc);
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
