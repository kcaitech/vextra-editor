<script setup lang="ts">
import { Context } from "@/context";
import { Selection } from "@/context/selection"
import { Shape } from "@/data/shape";
import { defineProps, onMounted, onUnmounted } from "vue";
import ListView, { IDataSource } from "@/components/ListView.vue";
import ShapeItem from "./ShapeItem.vue";

const props = defineProps<{ context: Context }>();
const selectionChange = (t: number) => {
    if (t === Selection.CHANGE_PAGE) {
        shapeSource.notify(0, Number.MAX_VALUE, 0);
        return;
    }
    if (t === Selection.CHANGE_SHAPE) {
        shapeSource.notify(0, Number.MAX_VALUE, 0);
        return;
    }
}

onMounted(() => {
    props.context.selection.watch(selectionChange);
});

onUnmounted(() => {
    props.context.selection.unwatch(selectionChange);
});

const shapeSource = new class implements IDataSource<Shape> {
    private m_onchange?: (startIdx: number, endIdx: number, offset: number) => void;
    length(): number {
        const page = props.context.selection.selectedPage;
        return page ? page.childsCount : 0;
    }
    at(index: number): Shape {
        const page = props.context.selection.selectedPage;
        if (page === undefined) {
            throw new Error("Source Error index:" + index + " lehgth:" + "0");
        }
        return page.getChildByIndex(index);
    }
    onChange(l: (startIdx: number, endIdx: number, offset: number) => void): void {
        // throw new Error("Method not implemented.");
        this.m_onchange = l;
    }
    measure(data: Shape): { width: number; height: number; } {
        throw new Error("Method not implemented.");
    }
    select(data: Shape, shift: boolean, ctrl: boolean): void {
        // throw new Error("Method not implemented.");
        // todo
        data && props.context.selection.selectShape(data);
    }
    isSelected(data: Shape): boolean {
        return data !== undefined && props.context.selection.isSelectedShape(data);
    }

    notify(startIdx: number, endIdx: number, offset: number) {
        this.m_onchange && this.m_onchange(startIdx, endIdx, offset);
    }
}

</script>

<template>
    <ListView :source="shapeSource" :item-view="ShapeItem" :height="0" :width="0" :scroll-x="0" :scroll-y="0"
        orientation="vertical"></ListView>
</template>

<style scoped>

</style>