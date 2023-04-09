<script setup lang="ts">
import { Context } from "@/context";
import { defineProps, onMounted, onUnmounted, ref, watch } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import ShapeItem, { ItemData } from "./ShapeItem.vue";
import { Page } from "@kcdesign/data/data/page";
import { ShapeDirListIter, ShapeDirList } from "@kcdesign/data/service/shapedirlist"
import { Shape } from "@kcdesign/data/data/shape";
import { useI18n } from 'vue-i18n';
type List = InstanceType<typeof ListView>;

class Iter implements IDataIter<ItemData> {
    private __it: ShapeDirListIter | undefined;
    constructor(it: ShapeDirListIter | undefined) {
        this.__it = it;
    }
    hasNext(): boolean {
        return this.__it != undefined && this.__it.hasNext();
    }
    next(): ItemData {
        const data = (this.__it as ShapeDirListIter).next();
        const shape = data.data;
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
            expand: !data.fold,
            level
        }
    }
}

const props = defineProps<{ context: Context, page: Page }>();
const { t } = useI18n();

const shapeListMap: Map<string, ShapeDirList> = new Map();

let shapeDirList: ShapeDirList;
let listviewSource = new class implements IDataSource<ItemData> {

    private m_onchange?: (index: number, del: number, insert: number, modify: number) => void;

    length(): number {
        return shapeDirList && shapeDirList.length || 0;
    }
    iterAt(index: number): IDataIter<ItemData> {
        return new Iter(shapeDirList.iterAt(index));
    }
    onChange(l: (index: number, del: number, insert: number, modify: number) => void): void {
        this.m_onchange = l;
    }

    notify(index: number, del: number, insert: number, modify: number) {
        this.m_onchange && this.m_onchange(index, del, insert, modify);
    }
}

function notifySourceChange() {
    listviewSource.notify(0, 0, 0, Number.MAX_VALUE)
}

const stopWatch = watch(() => props.page, () => {
    let source = shapeListMap.get(props.page.id)
    if (!source) {
        source = new ShapeDirList(props.page);
        shapeListMap.set(props.page.id, source);
    }
    if (shapeDirList) shapeDirList.unwatch(notifySourceChange)
    shapeDirList = source;
    shapeDirList.watch(notifySourceChange)
    notifySourceChange();

}, { immediate: true })

const shapelist = ref<List>();

function search(e: Event) {
    console.log((e.target as HTMLInputElement).value);
}
function toggleExpand(shape: Shape) {
    shapeDirList.toggleExpand(shape)
}
function selectShape(data: ItemData, ctrlKey: boolean, metaKey: boolean, shiftKey: boolean) {
    if (shiftKey) {
        selectShapeWhenShiftIsPressed(data);
    } else {
        props.context.selection.selectShape(data.shape, ctrlKey, metaKey);
    }
}
function selectShapeWhenShiftIsPressed(curData: ItemData) {
    const to = shapeDirList.indexOf(curData.shape);
    const selectedShapes = props.context.selection.selectedShapes;
    const selectShapesIndex = getSelectShapesIndex(selectedShapes);
    const from = selectShapesIndex.reduce((pre, cur) => {
        return Math.abs(to - cur) < Math.abs(to - pre) ? cur : pre;
    }, selectShapesIndex[0]);
    const shapes = getShapeRange(from, to);
    props.context.selection.rangeSelectShape(shapes);
}
function getSelectShapesIndex(shapes: Shape[]): number[] {
    return shapes.map(s => shapeDirList.indexOf(s));
}

function getShapeRange(start: number, end: number): Shape[] {
    const from = Math.min(start, end);
    const to = Math.max(start, end);
    const dataRange: Shape[] = [];
    const it = listviewSource.iterAt(from);
    for (let i = from; i <= to && it.hasNext(); i++) {
        dataRange.push(it.next().shape);
    }
    return dataRange;
}

function hoverShape(shape: Shape) {
    props.context.selection.hoverShape(shape);
}

function unHovershape(shape: Shape) {
    props.context.selection.unHoverShape(shape);
}

onMounted(() => {
    props.context.selection.watch(notifySourceChange)
});

onUnmounted(() => {
    props.context.selection.unwatch(notifySourceChange)
    stopWatch();
    if (shapeDirList) shapeDirList.unwatch(notifySourceChange)
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
            <ListView ref="shapelist" location="shapelist" :source="listviewSource" :item-view="ShapeItem" :item-height="30"
                :item-width="0" :first-index="0" :context="props.context" @toggleexpand="toggleExpand"
                @selectshape="selectShape" @hovershape="hoverShape" @unhovershape="unHovershape" orientation="vertical">
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

        >div:not(.space) {
            flex-shrink: 0;
        }

        .title {
            font-weight: var(--font-default-bold);
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
            background-color: var(--grey-light);
            padding: 4px var(--default-padding);
            border-radius: 8px;

            >svg {
                height: 20px;
                flex: 0 0 20px;
            }

            >input {
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

        >.container {
            height: 100%;
        }
    }
}
</style>