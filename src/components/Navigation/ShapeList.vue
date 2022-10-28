<script setup lang="ts">
import { Context } from "@/context";
import { Selection } from "@/context/selection"
import { defineProps, onMounted, onUnmounted } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import ShapeItem, { ItemData } from "./ShapeItem.vue";
import { Page } from "@/data/page";
import { ShapeNaviIter } from "@/data/shadow";

const props = defineProps<{ context: Context }>();

const selectionChange = (t: number) => {
    if (t === Selection.CHANGE_PAGE) {
        shapeSource.notify(0, 0, 0, Number.MAX_VALUE);
        return;
    }
    if (t === Selection.CHANGE_SHAPE) {
        shapeSource.notify(0, 0, 0, Number.MAX_VALUE);
        return;
    }
}

onMounted(() => {
    props.context.selection.watch(selectionChange);
});

onUnmounted(() => {
    props.context.selection.unwatch(selectionChange);
});

class Iter implements IDataIter<ItemData> {
    private __it: ShapeNaviIter | undefined;
    constructor(it: ShapeNaviIter | undefined) {
        this.__it = it;
    }
    hasNext(): boolean {
        return this.__it != undefined && this.__it.hasNext();
    }
    next(): ItemData {
        const shape = (this.__it as ShapeNaviIter).next();
        let level = 0; // todo
        let p = shape.parent;
        while (p) {
            level++
            p = p.parent;
        }
        return {
            id: shape.id,
            shape,
            selected: props.context.selection.isSelectedShape(shape),
            expand: false,
            level
        }
    }
}

const shapeSource = new class implements IDataSource<ItemData> {
    
    private m_onchange?: (index: number, del: number, insert: number, modify: number) => void;
    
    length(): number {
        const page = props.context.selection.selectedPage;
        if (page == undefined) {
            return 0;
        }
        const shadows = props.context.shadows;
        const sd = shadows.get(page);
        return sd.length;
    }
    iterAt(index: number): IDataIter<ItemData> {
        const shadows = props.context.shadows;
        const page = props.context.selection.selectedPage;
        if (page == undefined) {
            return new Iter(undefined);
        }
        const sd = shadows.get(page as Page);
        return new Iter(sd.iterAt(index));
    }
    onChange(l: (index: number, del: number, insert: number, modify: number) => void): void {
        this.m_onchange = l;
    }
    measure(data: ItemData, vw: number, vh: number): { width: number; height: number; } {
        return {width: 100, height: 30}
    }
    onClick(data: ItemData, shift: boolean, ctrl: boolean): void {
        data && props.context.selection.selectShape(data.shape);
    }
    onHover(data: ItemData, shift: boolean, ctrl: boolean): void {
        
    }

    notify(index: number, del: number, insert: number, modify: number) {
        this.m_onchange && this.m_onchange(index, del, insert, modify);
    }
}

</script>

<template>
    <ListView :source="shapeSource" :item-view="ShapeItem" :item-height="30" :item-width="0" :first-index="0"
        orientation="vertical"></ListView>
</template>

<style scoped>

</style>