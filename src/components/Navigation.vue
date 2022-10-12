<script setup lang="ts">
import { Shape } from "@/data/shape";
import { Selection } from "@/context/selection"
import { ComponentInternalInstance, defineProps, getCurrentInstance, onMounted, onUnmounted } from "vue";
import ListView, { IDataSource } from "./ListView.vue";
import NaviShapeItem from "./NaviShapeItem.vue";
import NaviPageItem from "./NaviPageItem.vue";
import { Context } from "@/context";

const props = defineProps<{ context: Context }>();

const selectionChange = (t: number) => {
    if (t === Selection.CHANGE_PAGE) {
        pageSource.notify(0, Number.MAX_VALUE, 0);
        shapeSource.notify(0, Number.MAX_VALUE, 0);
        return;
    }
    if (t === Selection.CHANGE_SHAPE) {
        shapeSource.notify(0, Number.MAX_VALUE, 0);
        return;
    }
}

onMounted(() => {
    // props.data.watch(updater); todo
    props.context.selection.watch(selectionChange);
    // updater();
});

onUnmounted(() => {
    // props.data.unwatch(updater);
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

const shapeSource = new class implements IDataSource<Shape | undefined> {
    private m_onchange?: (startIdx: number, endIdx: number, offset: number) => void;
    length(): number {
        const page = props.context.selection.selectedPage;
        return page ? page.childsCount : 0;
    }
    at(index: number): Shape | undefined {
        const page = props.context.selection.selectedPage;
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
        // todo
        data && props.context.selection.selectShape(data);
    }
    isSelected(data: Shape | undefined): boolean {
        return data !== undefined && props.context.selection.isSelectedShape(data);
    }

    notify(startIdx: number, endIdx: number, offset: number) {
        this.m_onchange && this.m_onchange(startIdx, endIdx, offset);
    }
}

</script>

<template>
    <div>
        <ListView class="page-navi" :source="pageSource" :item-view="NaviPageItem" :height="0" :width="0" :scroll-x="0"
            :scroll-y="0" orientation="vertical"></ListView>
        <div class="line" />
        <ListView class="shape-navi" :source="shapeSource" :item-view="NaviShapeItem" :height="0" :width="0"
            :scroll-x="0" :scroll-y="0" orientation="vertical"></ListView>
    </div>
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
    background-color: var(--theme-color-line);
    flex: 0 0 auto;
}
</style>
