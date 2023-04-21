<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 17:28:05
 * @FilePath: \kcdesign\src\components\Document\Navigation\PageList.vue
-->
<script setup lang="ts">
import { Selection } from "@/context/selection";
import { defineProps, defineEmits, onMounted, onUnmounted, ref, computed, nextTick } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import PageItem, { ItemData } from "./PageItem.vue";
import { Context } from "@/context";
import { useI18n } from 'vue-i18n';
import { ResourceMgr } from "@kcdesign/data/data/basic";
import { Page } from "@kcdesign/data/data/page";
import { Document, PageListItem } from "@kcdesign/data/data/document";
import ContextMenu from '@/components/common/ContextMenu.vue'
const { t } = useI18n();
type ContextMenuEl = InstanceType<typeof ContextMenu>;
const props = defineProps<{ context: Context }>();
const emit = defineEmits<{
    (e: "fold", fold: boolean): void;
}>();

const fold = ref<boolean>(false)
const MOUSE_RIGHT = 2
const pageMenu = ref<boolean>(false)
const pageMenuPosition = ref<{ x: number, y: number }>({ x: 0, y: 0 }); //鼠标点击page所在的位置
let pageMenuItems: string[] = [];
const contextMenuEl = ref<ContextMenuEl>();
const isRename = ref(false)
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
    private __document: Document;
    private __pagesMgr: ResourceMgr<Page>;
    private __selection: Selection;
    private __index: number;
    constructor(context: Context, index: number) {
        this.__document = context.data;
        this.__pagesMgr = context.data.pagesMgr;
        this.__selection = context.selection;
        this.__index = index;
    }
    hasNext(): boolean {
        return this.__index < this.__document.pagesList.length;
    }
    next(): ItemData {
        const id: PageListItem = this.__document.pagesList[this.__index];
        // const name = this.__pagesMgr.getPageNameById(id);
        this.__index++;
        const slectedPage = this.__selection.selectedPage;
        return {
            name: id.name,
            id: id.id,
            selected: slectedPage !== undefined && slectedPage.id == id.id,
            reName: isRename.value
        }
    }
}

const pageSource = new class implements IDataSource<ItemData> {
    indexOf(data: ItemData): number {
        throw new Error("Method not implemented.");
    }

    private m_onchange?: (index: number, del: number, insert: number, modify: number) => void;
    length(): number {
        return props.context.data.pagesList.length;
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

const addPage = () => {
    const pageMgr = props.context.editor4Doc();
    const pageName = props.context.data.pagesList.length + 1
    const page = pageMgr.create(`页面 ${pageName}`);
    const id = props.context.selection.selectedPage?.id
    const index = props.context.data.pagesList.findIndex((item) => item.id === id)
    isRename.value = true
    pageMgr.insert(index + 1, page);
    props.context.selection.insertPage(page)
}

function toggle() {
    fold.value = !fold.value;
    emit('fold', fold.value)
}
function updateAfterDrag(params: { from: number, to: number, dragTarget: any }) {
    const docEditor = props.context.editor4Doc();
    docEditor.move(params.dragTarget, params.to);
}
const rename = (value: string) => { 
    const page = props.context.selection.selectedPage
    if(!page) return
    const editor = computed(() => {
        return props.context.editor4Page(page)
    });
    editor.value.setName(value)
}

const MouseDown = (e: MouseEvent, id: string) => {
    if(e.button === MOUSE_RIGHT) {
        e.stopPropagation()
        const menu = contextMenuEl.value?.menu?.className
        if(e.target instanceof Element && e.target.closest(`.${menu}`)) return
        pageMenuMount(e)
    }
    
    
}
const pageMenuMount = (e: MouseEvent) => {
    pageMenuPosition.value.x = e.clientX
    pageMenuPosition.value.y = e.clientY - 75
    pageMenuItems = ['copy_link','duplicate','rename','delete']
    pageMenu.value = true
    e.stopPropagation()
    document.addEventListener('keydown', Menuesc);
    nextTick(() => {
        if (contextMenuEl.value) {
            const el = contextMenuEl.value.menu;
            if (el) {
                el.style.borderRadius = 4 + 'px'
                el.style.width = 180 + 'px'
            }
        }
    
    })
}
function Menuesc(e: KeyboardEvent) {
    if (e.code === 'Escape') pageMenuUnmount();
}
function pageMenuUnmount(e?: MouseEvent, item?: string) {
    document.removeEventListener('keydown', Menuesc);
    pageMenu.value = false;
    if(item === 'rename') {
        e?.stopPropagation()
        
    }  
}
</script>
    
<template>
    <div class="pagelist-wrap">
        <div class="header">
            <div class="title">{{ t('navi.page') }}</div>
            <div class="space"></div>
            <div class="btn">
                <div class="add" @click="addPage">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
                <!-- <div class="file">
                    <svg-icon icon-class="file"></svg-icon>
                </div> -->
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
                @rename="rename"
                @onMouseDown="MouseDown"
            >
            </ListView>
            <ContextMenu v-if="pageMenu" :x="pageMenuPosition.x" :y="pageMenuPosition.y"  ref="contextMenuEl" @close="pageMenuUnmount">
                <div class="items-wrap" v-for="(item, index) in pageMenuItems" :key="index" @click="e => pageMenuUnmount(e, item)">
                    <span>{{ t(`pageMenu.${item}`) }}</span>
                </div>
            </ContextMenu>
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
        box-sizing: border-box;
        position: relative;
        align-items: center;
        > div:not(.space) {
            flex-shrink: 0;
        }
        overflow: hidden;
        .title {
            margin-left: 13px;
            height: 30px;
            font-weight: var(--font-default-bold);
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
.items-wrap {
    font-size: var(--font-default-fontsize);
    line-height: 30px;
    padding: 0 10px;
    &:hover {
        background-color: var(--active-color);
    }
}
</style>
    