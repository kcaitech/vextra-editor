<script setup lang="ts">
import { Context } from "@/context";
import { Selection } from "@/context/selection"
import { defineProps, onMounted, onUnmounted, ref } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import ShapeItem, { ItemData } from "./ShapeItem.vue";
import { Page } from "@/data/page";
import { ShapeNaviIter } from "@/data/shadow";
import { Shape } from "@/data/shape";
import { debounce }  from 'lodash';

type List = InstanceType<typeof ListView>

const props = defineProps<{ context: Context }>();

const shapelist = ref<List>();
let listInstance: HTMLDivElement | undefined;
let savePage: Page | undefined;


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

const shadowChange = () => {
    shapeSource.notify(0, 0, 0, Number.MAX_VALUE);
}
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
function hoverShape(shape: Shape) {
    props.context.selection.hoverShape(shape);
}

const debounceEmitHoverShape = debounce(hoverShape, 200);

function unHovershape(shape: Shape) {
    props.context.selection.unHoverShape(shape);
}

const changeControlPressStatus = (e: KeyboardEvent, down: boolean) => {        
    if (e.code === 'MetaLeft' || e.code === 'ControlLeft') {        
        props.context?.selection.setControlStatus(down)
    }
}
function onKeyDown(e: KeyboardEvent) {
    changeControlPressStatus(e, true);
}
function onKeyUp(e: KeyboardEvent) {
    changeControlPressStatus(e, false)
}

onMounted(() => {
    props.context.selection.watch(selectionChange);
    listInstance = shapelist.value?.container
    if (listInstance) {
        listInstance.addEventListener("keydown", onKeyDown);
        listInstance.addEventListener("keyup", onKeyUp);
    }
});

onUnmounted(() => {
    props.context.selection.unwatch(selectionChange);
    if (savePage) {
        const sd = props.context.shadows.get(savePage);
        sd.unwatch(shadowChange);
        savePage = undefined;
    }
    if (listInstance) {
        listInstance.removeEventListener("keydown", onKeyDown);
        listInstance.removeEventListener("keyup", onKeyUp);
    }
});

</script>

<template>
    <ListView
        ref="shapelist"
        location="shapelist"
        :source="shapeSource"
        :item-view="ShapeItem"
        :item-height="30"
        :item-width="0"
        :first-index="0"
        :context="props.context"
        @toggleexpand="toggleExpand"
        @selectshape="selectShape"
        @hovershape="debounceEmitHoverShape"
        @unhovershape="unHovershape"
        orientation="vertical"
    >
    </ListView>
</template>

<style scoped lang="scss">
</style>