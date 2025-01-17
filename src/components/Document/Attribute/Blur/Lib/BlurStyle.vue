<template>
    <div id="blur-lib-panel" class="blur-lib-panel">
        <PopoverHeader title="模糊样式" @create="showCreatePanel" @close="emits('close')"/>
        <div style="padding: 8px 12px; box-sizing: border-box;" @wheel.stop>
            <SearchInput :list="libs" v-model:type="currentLibs" v-model:value="keyword"/>
            <el-scrollbar>
                <div class="content">
                    <SheetPanel v-for="sheet in sheets" :key="sheet.id" :context="context"
                                :item="BlurMaskPanelItem" :data="sheet"/>
                    <div v-if="!sheets?.length && keyword" class="search-null">没有搜索到相关样式</div>
                    <div v-if="!sheets?.length && !keyword" class="data-null">暂无模糊样式</div>
                </div>
            </el-scrollbar>
        </div>
        <CreateBlurStyle v-if="createPanelStatus.visible" :context="props.context" :shapes="props.shapes"
                         @close="closeCreatePanel"/>
    </div>
</template>
<script setup lang="ts">
import { ShapeView } from "@kcdesign/data";
import { Context } from '@/context';
import { onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue';
import CreateBlurStyle from './CreateBlurStyle.vue';
import { StyleSheet } from "@kcdesign/data/dist/types/data/typesdefine";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import PopoverHeader from "@/components/common/PopoverHeader.vue";
import SearchInput from "@/components/common/SearchInput.vue";
import BlurMaskPanelItem from "@/components/Document/Attribute/Blur/Lib/BlurMaskPanelItem.vue";
import SheetPanel from "@/components/Document/Attribute/StyleLib/SheetPanel.vue";
import { SheetCatch } from "@/components/Document/Attribute/stylectx";

const props = defineProps<{
    context: Context;
    shapes: ShapeView[];
    id?: string;
}>()
const emits = defineEmits<{
    (e: 'close'): void
}>()

const keyword = ref<string>('')
const libs = ref<{ label: string, value: string }[]>([]);
const currentLibs = ref<string>('all');
const sheets = ref<SheetCatch[]>([]);

const createPanelStatus = reactive<ElementStatus>({id: '#create-blur-panel', visible: false});
const createPanelStatusMgr = new ElementManager(
    props.context,
    createPanelStatus,
    {
        offsetLeft: -442,
        whiteList: ['.new-style', '.add']
    }
);

const showCreatePanel = (e: MouseEvent) => {
    createPanelStatusMgr.showBy(e);
}
const closeCreatePanel = () => {
    createPanelStatusMgr.close();
}

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
            if (v.typeId === "blur-mask-living") cat.variables.push(v);
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
.blur-lib-panel {
    background-color: #fff;
    z-index: 9;
    width: 230px;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    border-radius: 8px;
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
</style>
