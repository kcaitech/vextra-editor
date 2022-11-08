<script setup lang="ts">
import { Selection } from "@/context/selection"
import { defineProps, onMounted, onUnmounted } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import PageItem, { ItemData } from "./PageItem.vue";
import { Context } from "@/context";
import { PagesMgr } from "@/data/document";

const props = defineProps<{ context: Context }>();

const selectionChange = (t: number) => {
    if (t === Selection.CHANGE_PAGE) {
        pageSource.notify(0, 0, 0, Number.MAX_VALUE);
    }
}

onMounted(() => {
    props.context.selection.watch(selectionChange);
});

onUnmounted(() => {
    props.context.selection.unwatch(selectionChange);
});

class Iter implements IDataIter<ItemData> {
    private __pagesMgr: PagesMgr;
    private __selection: Selection;
    private __index: number;
    constructor(context: Context, index: number) {
        this.__pagesMgr = context.data.pagesMgr;
        this.__selection = context.selection;
        this.__index = index;
    }
    hasNext(): boolean {
        return this.__index < this.__pagesMgr.pageCount;
    }
    next(): ItemData {
        const id = this.__pagesMgr.getPageIdByIndex(this.__index);
        const name = this.__pagesMgr.getPageNameById(id);
        this.__index++;
        const slectedPage = this.__selection.selectedPage;
        return {
            name,
            id, 
            selected: slectedPage !== undefined && slectedPage.id == id
        }
    }
}

const pageSource = new class implements IDataSource<ItemData> {

    private m_onchange?: (index: number, del: number, insert: number, modify: number) => void;
    length(): number {
        return props.context.data.pagesMgr.pageCount;
    }
    iterAt(index: number): IDataIter<ItemData> {
        return new Iter(props.context, index);
    }
    onChange(l: (index: number, del: number, insert: number, modify: number) => void): void {
        this.m_onchange = l;
    }

    notify(index: number, del: number, insert: number, modify: number) {
        this.m_onchange && this.m_onchange(index, del, insert, modify);
    }
}

</script>
    
<template>
    <ListView :source="pageSource" :item-view="PageItem" :item-width="0" :item-height="30" :first-index="0" v-bind="$attrs"
        orientation="vertical"></ListView>

</template>
    
<style scoped>

</style>
    