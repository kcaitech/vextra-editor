<script setup lang="ts">
import { Context } from "@/context";
import { Selection } from "@/context/selection"
import { defineProps, onMounted, onUnmounted, ref } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import ShapeItem, { ItemData } from "./ShapeItem.vue";
import { Page } from "@/data/data/page";
import { ShapeNaviIter } from "@/data/data/shadow/shapeNavi"
import { Shape } from "@/data/data/shape";
import "@/assets/icons/svg/search.svg";
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

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

    indexOf(data: ItemData): number {
        const shadows = props.context.shadows;
        const page = props.context.selection.selectedPage;
        if (page == undefined) {
            return -1;
        }
        const sd = shadows.get(page as Page);
        return sd.indexOf(data.shape);
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
function search(e: Event) {
    console.log((e.target as HTMLInputElement).value);
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
function selectShape(data: ItemData) {
    if (props.context.selection.onShift) {
        selectShapeWhenShiftIsPressed(data);
        return;
    }
    props.context.selection.selectShape(data.shape);
}
function selectShapeWhenShiftIsPressed(curData: ItemData) {
    const to = shapeSource.indexOf(curData);
    const selectedShapes = props.context.selection.selectedShapes;
    const selectShapesIndex = getSelectShapesIndex(selectedShapes);
    const from = selectShapesIndex.reduce((pre, cur) => {
        return Math.abs(to - cur) < Math.abs(to - pre) ? cur : pre
    }, selectShapesIndex[0]);
    // console.log('from-to:', `${from}-${to}`);
    const shapes = getShapeRange(from, to);
    props.context.selection.rangeSelectShape(shapes);

}
function getSelectShapesIndex(shapes: Shape[]): number[] {
    return shapes.map(s => shapeIndexOf(s));
}
function shapeIndexOf(shape: Shape): number {
    const shadows = props.context.shadows;
    const page = props.context.selection.selectedPage;
    if (page == undefined) {
        return -1;
    }
    const sd = shadows.get(page as Page);
    return sd.indexOf(shape);
}
function getShapeRange(start: number, end: number): Shape[] {
    let dataRange: Shape[] = [];
    for (let i = start; i <= end; i++) {
        dataRange.push((shapeSource.iterAt(i) as any).__it.__node.__shape);
    }
    return dataRange;
}

function hoverShape(shape: Shape) {
    props.context.selection.hoverShape(shape);
}

function unHovershape(shape: Shape) {
    props.context.selection.unHoverShape(shape);
}

function changeControlPressStatus(e: KeyboardEvent, down: boolean) {        
    if (e.code === 'MetaLeft' || e.code === 'ControlLeft') {  
        props.context?.selection.setControlStatus(down)
    }
}
function changeShiftPressStatus(e: KeyboardEvent, down: boolean) {
    if (e.code === 'ShiftLeft') {  
        props.context?.selection.setShiftStatus(down)
    }
}


function onKeyDown(e: KeyboardEvent) {
    changeControlPressStatus(e, true);
    changeShiftPressStatus(e, true);
    
}
function onKeyUp(e: KeyboardEvent) {
    changeControlPressStatus(e, false)
    changeShiftPressStatus(e, false);
}

onMounted(() => {
    props.context.selection.watch(selectionChange);
    listInstance = shapelist.value?.container;
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
    <div class="shapelist-wrap">
        <div class="header">
            <div class="title">{{ t('navi.shape') }}</div>
            <div class="search">
                <svg-icon icon-class="search"></svg-icon>
                <input type="text" @change="e => search(e)">
            </div>
        </div>
        <div class="body">
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
                @hovershape="hoverShape"
                @unhovershape="unHovershape"
                orientation="vertical"
            >
            </ListView>
        </div>
    </div>

</template>

<style scoped lang="scss">
.shapelist-wrap {
    height: 100%;
    .header {
        width: 100%;
        height: 64px;
        font-size: 10px;
        padding: 0 13px;
        box-sizing: border-box;
        position: relative;
        > div:not(.space) {
            flex-shrink: 0;
        }
        .title {
            font-weight: 700;
            line-height: 30px;
            height: 30px;
        }
        .search {
            width: 100%;
            height: 32px;
            margin: 1px 0px;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            background-color: var(--theme-color2);
            padding: 4px var(--default-padding);
            border-radius: 8px;
            > svg {
                height: 20px;
                flex: 0 0 20px;
            }
            > input {
                flex: 1 1 auto;
                border: none;
                outline: none;
                margin-left: 4px;
                background-color: transparent;
            }
        }
    }
    .body {
        height: calc(100% - 64px);
        > .container {
            height: 100%;
        }
    }
}

</style>