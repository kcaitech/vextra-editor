<script setup lang="ts">
import { Context } from "@/context";
import { Selection } from "@/context/selection"
import { defineProps, onMounted, onUnmounted } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import ShapeItem, { ItemData } from "./ShapeItem.vue";

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
    private __context: Context;
    private __index: number;
    constructor(context: Context, index: number) {
        this.__context = context;
        this.__index = index;
    }
    hasNext(): boolean {
        // throw new Error("Method not implemented.");
        const page = this.__context.selection.selectedPage;
        return !!(page && this.__index < page.childsCount);
    }
    next(): ItemData {
        // throw new Error("Method not implemented.");
        const page = this.__context.selection.selectedPage;
        if (page === undefined) {
            throw new Error("Source Error index:" + this.__index + " lehgth:" + "0");
        }
        const shape =  page.getChildByIndex(this.__index);
        this.__index++;
        let level = 0;
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
    // hasPrev(): boolean {
    //     throw new Error("Method not implemented.");
    // }
    // prev(): ItemData {
    //     throw new Error("Method not implemented.");
    // }
}

const shapeSource = new class implements IDataSource<ItemData> {
    private m_onchange?: (index: number, del: number, insert: number, modify: number) => void;
    length(): number {
        const page = props.context.selection.selectedPage;
        // if (!page) {
        //     return 0;
        // }
        return page ? page.childsCount : 0;
    }
    iterAt(index: number): IDataIter<ItemData> {
        return new Iter(props.context, index);
    }
    onChange(l: (index: number, del: number, insert: number, modify: number) => void): void {
        // throw new Error("Method not implemented.");
        this.m_onchange = l;
    }
    measure(data: ItemData, vw: number, vh: number): { width: number; height: number; } {
        // return ShapeItem.measure(data);
        return {width: 100, height: 30}
    }
    onClick(data: ItemData, shift: boolean, ctrl: boolean): void {
        // throw new Error("Method not implemented.");
        // todo
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