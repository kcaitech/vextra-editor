<script setup lang="ts">
import { Selection } from "@/context/selection"
import { ComponentInternalInstance, defineProps, getCurrentInstance, onMounted, onUnmounted } from "vue";
import ListView, { IDataSource } from "@/components/ListView.vue";
import PageItem from "./PageItem.vue";
import { Context } from "@/context";

const props = defineProps<{ context: Context }>();

const selectionChange = (t: number) => {
    if (t === Selection.CHANGE_PAGE) {
        pageSource.notify(0, Number.MAX_VALUE, 0);
    }
}

onMounted(() => {
    props.context.selection.watch(selectionChange);
});

onUnmounted(() => {
    props.context.selection.unwatch(selectionChange);
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const pageSource = new class implements IDataSource<{ name: string; id: string }> {

    private m_onchange?: (startIdx: number, endIdx: number, offset: number) => void;
    length(): number {
        return props.context.data.pagesMgr.pageCount;
    }
    at(index: number): { name: string; id: string } {
        const pagesMgr = props.context.data.pagesMgr;
        const id = pagesMgr.getPageIdByIndex(index);
        const name = pagesMgr.getPageNameById(id);
        return { name, id };
    }
    onChange(l: (startIdx: number, endIdx: number, offset: number) => void): void {
        this.m_onchange = l;
    }
    measure(data: { name: string; id: string }): { width: number; height: number; } {
        throw new Error("Method not implemented.");
    }
    select(data: { name: string; id: string; }, shift: boolean, ctrl: boolean): void {
        // props.select(data.id);
        proxy?.$emit("switchpage", data.id);
    }
    isSelected(data: { name: string; id: string; }): boolean {
        const slectedPage = props.context.selection.selectedPage;
        return slectedPage !== undefined && slectedPage.id == data.id;
    }
    notify(startIdx: number, endIdx: number, offset: number) {
        this.m_onchange && this.m_onchange(startIdx, endIdx, offset);
    }
}

</script>
    
<template>
    <ListView :source="pageSource" :item-view="PageItem" :height="0" :width="0" :scroll-x="0" :scroll-y="0"
        orientation="vertical"></ListView>

</template>
    
<style scoped>

</style>
    