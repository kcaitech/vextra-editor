<script setup lang="ts">
import { Context } from "@/context";
import { Selection } from "@/context/selection"
import { defineProps, onMounted, onUnmounted } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import ShapeItem, { ItemData } from "./ShapeItem.vue";
import { Page } from "@/data/page";
import { ShapeNaviIter } from "@/data/shadow";
import { Shape } from "@/data/shape";

const props = defineProps<{ context: Context }>();

const shadowChange = () => {
    // todo
    shapeSource.notify(0, 0, 0, Number.MAX_VALUE);
}

let savePage: Page | undefined;
const selectionChange = (t: number) => {
    if (t === Selection.CHANGE_PAGE) {
        shapeSource.notify(0, 0, 0, Number.MAX_VALUE);

        if (savePage) {
            const sd = props.context.shadows.get(savePage);
            // console.log("unwatch shadow")
            sd.unwatch(shadowChange);
            savePage = undefined;
        }
        const page = props.context.selection.selectedPage;
        if (page) {
            const sd = props.context.shadows.get(page);
            // console.log("watch shadow")
            sd.watch(shadowChange);
            savePage = page;
        }
    }
    else if (t === Selection.CHANGE_SHAPE) {
        shapeSource.notify(0, 0, 0, Number.MAX_VALUE);
    }
}

onMounted(() => {
    props.context.selection.watch(selectionChange);
});

onUnmounted(() => {
    props.context.selection.unwatch(selectionChange);
    if (savePage) {
        // console.log("unwatch shadow 1")
        const sd = props.context.shadows.get(savePage);
        sd.unwatch(shadowChange);
        savePage = undefined;
    }
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
        const data = (this.__it as ShapeNaviIter).next();
        const shape = data.shape;
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
            expand: data.expand,
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

    notify(index: number, del: number, insert: number, modify: number) {
        this.m_onchange && this.m_onchange(index, del, insert, modify);
    }
}

function toggleExpand(shape: Shape) {
    const page = props.context.selection.selectedPage;
    if (page == undefined) {
        return 0;
    }
    const shadows = props.context.shadows;    
    const sd = shadows.get(page);
    sd.toggleExpand(shape);
}

function selectShape(shape: Shape) {
    props.context.selection.selectShape(shape);
}

</script>

<template>
    <ListView
        :source="shapeSource"
        :item-view="ShapeItem"
        :item-height="30"
        :item-width="0"
        :first-index="0"
        @toggleexpand="toggleExpand"
        @selectshape="selectShape"
        orientation="vertical"
    >
        <template #header>
            <div class="shape-header">
                <span>图层</span>
            </div>
        </template>
    </ListView>
</template>

<style scoped lang="scss">
.shape-header {
    padding: 4px 8px;
}
</style>