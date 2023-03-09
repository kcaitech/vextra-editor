<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 17:28:05
 * @FilePath: \kcdesign\src\components\Document\Navigation\PageList.vue
-->
<script setup lang="ts">
import { Selection } from "@/context/selection";
import { defineProps, onMounted, onUnmounted } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import PageItem, { ItemData } from "./PageItem.vue";
import { Context } from "@/context";
import { PagesMgr } from "@/data/data/document";
import "@/assets/icons/svg/file.svg";
import "@/assets/icons/svg/add.svg";
import "@/assets/icons/svg/down.svg";

const props = defineProps<{ context: Context }>();

const selectionChange = (t: number) => {
    if (t === Selection.CHANGE_PAGE) {
        pageSource.notify(0, 0, 0, Number.MAX_VALUE);
    }
}

onMounted(() => {
    props.context.selection.watch(selectionChange);
});

onUnmounted(() => {
    props.context.selection.unwatch(selectionChange);
});

class Iter implements IDataIter<ItemData> {
    private __pagesMgr: PagesMgr;
    private __selection: Selection;
    private __index: number;
    constructor(context: Context, index: number) {
        this.__pagesMgr = context.data.pagesMgr;
        this.__selection = context.selection;
        this.__index = index;
    }
    hasNext(): boolean {
        return this.__index < this.__pagesMgr.pageCount;
    }
    next(): ItemData {
        const id = this.__pagesMgr.getPageIdByIndex(this.__index);
        const name = this.__pagesMgr.getPageNameById(id);
        this.__index++;
        const slectedPage = this.__selection.selectedPage;
        return {
            name,
            id,
            selected: slectedPage !== undefined && slectedPage.id == id
        }
    }
}

const pageSource = new class implements IDataSource<ItemData> {
    indexOf(data: ItemData): number {
        throw new Error("Method not implemented.");
    }

    private m_onchange?: (index: number, del: number, insert: number, modify: number) => void;
    length(): number {
        return props.context.data.pagesMgr.pageCount;
    }
    iterAt(index: number): IDataIter<ItemData> {
        return new Iter(props.context, index);
    }
    onChange(l: (index: number, del: number, insert: number, modify: number) => void): void {
        this.m_onchange = l;
    }

    notify(index: number, del: number, insert: number, modify: number) {
        this.m_onchange && this.m_onchange(index, del, insert, modify);
    }
}

function updateAfterDrag(params: { from: number, to: number, dragTarget: any }) {
    console.log('newlist', params);
}

</script>
    
<template>
    <div class="header">
        <div class="title">页面</div>
        <div class="space"></div>
        <div class="btn">
            <div class="add">
                <svg-icon icon-class="add"></svg-icon>
            </div>
            <div class="file">
                <svg-icon icon-class="file"></svg-icon>
            </div>
            <div class="shrink">
                <svg-icon icon-class="down"></svg-icon>
            </div>
        </div>
        
    </div>
    <ListView
        :source="pageSource"
        :item-view="PageItem"
        :item-width="0"
        :item-height="30"
        :first-index="0"
        v-bind="$attrs"
        orientation="vertical"
        :allowDrag="true"
        location="pagelist"
        @update-after-drag="updateAfterDrag"
    >
    </ListView>

</template>
    
<style scoped lang="scss">
.header {
    width: 100%;
    height: 36px;
    display: flex;
    font-size: 10px;
    padding: 0 13px;
    box-sizing: border-box;
    position: relative;
    align-items: center;
    > div:not(.space) {
        flex-shrink: 0;
    }
    .title {
        font-weight: 700;
        line-height: 30px;
    }
    .btn {
        position: absolute;
        right: 13px;
        display: flex;
        flex-direction: row;
        > div {
            margin-left: 8px;
        }
        .add {
            height: 14px;
            width: 14px;
            > svg {
                width: 80%;
                height: 80%;
            }
        }
        .file {
            height: 14px;
            width: 14px;
            > svg {
                width: 80%;
                height: 80%;
            }
        }
        .shrink {
            height: 14px;
            width: 14px;
            > svg {
                width: 80%;
                height: 80%;
            }
        }
    }
}
</style>
    