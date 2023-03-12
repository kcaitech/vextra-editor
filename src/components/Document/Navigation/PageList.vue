<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 17:28:05
 * @FilePath: \kcdesign\src\components\Document\Navigation\PageList.vue
-->
<script setup lang="ts">
import { Selection } from "@/context/selection";
import { defineProps, defineEmits, onMounted, onUnmounted, ref } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import PageItem, { ItemData } from "./PageItem.vue";
import { Context } from "@/context";
import { PagesMgr } from "@/data/data/document";
import "@/assets/icons/svg/file.svg";
import "@/assets/icons/svg/add.svg";
import "@/assets/icons/svg/down.svg";
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps<{ context: Context }>();
const emit = defineEmits<{
    (e: "fold", fold: boolean): void;
}>();

const fold = ref<boolean>(false)

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

function toggle() {
    fold.value = !fold.value;
    emit('fold', fold.value)
}

function updateAfterDrag(params: { from: number, to: number, dragTarget: any }) {
    const docEditor = props.context.editor4Doc();
    docEditor.move(params.dragTarget, params.to);
}

</script>
    
<template>
    <div class="pagelist-wrap">
        <div class="header">
            <div class="title">{{ t('navi.page') }}</div>
            <div class="space"></div>
            <div class="btn">
                <div class="add">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
                <div class="file">
                    <svg-icon icon-class="file"></svg-icon>
                </div>
                <div class="shrink" @click="toggle">
                    <svg-icon icon-class="down" :style="{transform: fold ? 'rotate(90deg)' : 'rotate(0deg)'}"></svg-icon>
                </div>
            </div>
        </div>
        <div class="body" :style="{height: fold ? 0 : 'calc(100% - 30px)'}">
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
        </div>
    </div>
</template>
    
<style scoped lang="scss">
.pagelist-wrap {
    height: 100%;
    .header {
        width: 100%;
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
            height: 30px;
            font-weight: 700;
            line-height: 36px;
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
    .body {
        height: calc(100% - 30px);
        > .container {
            height: 100%;
        }
    }
}

</style>
    