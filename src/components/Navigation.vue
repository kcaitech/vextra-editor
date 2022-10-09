<script setup lang="ts">
import { Document } from "@/data/document";
import { Shape } from "@/data/shape";
import { Selection } from "@/edit/selection"
import { defineProps, onMounted, onUnmounted } from "vue";
import ListView, { IDataSource } from "./ListView.vue";
import NaviShapeItem from "./NaviShapeItem.vue";
import NaviPageItem from "./NaviPageItem.vue";

const props = defineProps<{ data: Document, selection: Selection, select: Function }>();
// const list = ref({ val: new Array<{ name: string; id: string, selected: boolean }>() });

// const updater = () => {
//     const pagesMgr = props.data.pagesMgr;
//     const pc = pagesMgr.pageCount;
//     const l = [];
//     for (let i = 0; i < pc; i++) {
//         const page = pagesMgr.peekPageByIndex(i);
//         const id = pagesMgr.getPageIdByIndex(i);
//         const name = pagesMgr.getPageNameById(id);
//         const selected = page !== undefined && page === props.selection.selectedPage;
//         // console.log(i, selected);
//         l.push({ name, id, selected });
//     }
//     list.value.val = l;
// };

const selectionChange = (t: number) => {
    if (t !== Selection.CHANGE_PAGE) {
        return;
    }
    // updater();
    pageSource.notify(0, Number.MAX_VALUE, 0);
    shapeSource.notify(0, Number.MAX_VALUE, 0);
}

onMounted(() => {
    // props.data.watch(updater); todo
    props.selection.watch(selectionChange);
    // updater();
});

onUnmounted(() => {
    // props.data.unwatch(updater);
    props.selection.unwatch(selectionChange);
});

// function onClick(id: string) {
//     props.select(id);
// }

const pageSource = new class implements IDataSource<{ name: string; id: string }> {

    private m_onchange?: (startIdx: number, endIdx: number, offset: number) => void;
    length(): number {
        return props.data.pagesMgr.pageCount;
    }
    at(index: number): { name: string; id: string } {
        const pagesMgr = props.data.pagesMgr;
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
        props.select(data.id);
    }
    isSelected(data: { name: string; id: string; }): boolean {
        const pagesMgr = props.data.pagesMgr;
        const page = pagesMgr.getPageById(data.id);
        return page !== undefined && page === props.selection.selectedPage;
    }
    notify(startIdx: number, endIdx: number, offset: number) {
        this.m_onchange && this.m_onchange(startIdx, endIdx, offset);
    }
}

const shapeSource = new class implements IDataSource<Shape | undefined> {
    private m_onchange?: (startIdx: number, endIdx: number, offset: number) => void;
    length(): number {
        const page = props.selection.selectedPage;
        return page ? page.childsCount : 0;
    }
    at(index: number): Shape | undefined {
        const page = props.selection.selectedPage;
        return page ? page.getChildByIndex(index) : undefined;
    }
    onChange(l: (startIdx: number, endIdx: number, offset: number) => void): void {
        // throw new Error("Method not implemented.");
        this.m_onchange = l;
    }
    measure(data: Shape | undefined): { width: number; height: number; } {
        throw new Error("Method not implemented.");
    }
    select(data: Shape | undefined, shift: boolean, ctrl: boolean): void {
        // throw new Error("Method not implemented.");
    }
    isSelected(data: Shape | undefined): boolean {
        // throw new Error("Method not implemented.");
        return false;
    }

    notify(startIdx: number, endIdx: number, offset: number) {
        this.m_onchange && this.m_onchange(startIdx, endIdx, offset);
    }
}

</script>

<template>
    <ListView class="page-navi" :source="pageSource" :item-view="NaviPageItem" :height="0" :width="0" :scroll-x="0"
        :scroll-y="0" orientation="vertical"></ListView>
    <div class="line" />
    <ListView class="shape-navi" :source="shapeSource" :item-view="NaviShapeItem" :height="0" :width="0" :scroll-x="0"
        :scroll-y="0" orientation="vertical"></ListView>
</template>

<style scoped>

.page-navi {
    flex: 0 0 auto;
}

.shape-navi {
    width: 100%;
    height: 100%;
    flex: 1 1 auto;
}

div.line {
    width: 100%;
    height: 1px;
    background-color: var(--theme-color);
    flex: 0 0 auto;
}
</style>
