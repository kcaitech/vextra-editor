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
type List = InstanceType<typeof ListView>;
const { t } = useI18n();
type ContextMenuEl = InstanceType<typeof ContextMenu>;
interface MenuItem {
    name: string, id: string
}
const props = defineProps<{ context: Context }>();
const emit = defineEmits<{
    (e: "fold", fold: boolean): void;
}>();
const pagelist = ref<List>();
const ListBody = ref<HTMLDivElement>()
const ListH = ref<number>(0)
const pageH = ref<number>(0)
const fold = ref<boolean>(false)
const MOUSE_RIGHT = 2
const pageMenu = ref<boolean>(false)
const pageMenuPosition = ref<{ x: number, y: number }>({ x: 0, y: 0 }); //鼠标点击page所在的位置
let pageMenuItems: MenuItem[] = [];
const contextMenuEl = ref<ContextMenuEl>();
const selectionChange = (t: number) => {
    if (t === Selection.CHANGE_PAGE) {
        pageSource.notify(0, 0, 0, Number.MAX_VALUE);
    } else if (t === Selection.PAGE_RENAME) {
        pageSource.notify(0, 0, 0, Number.MAX_VALUE);
    }
}

onMounted(() => {
    props.context.selection.watch(selectionChange);
    if (ListBody.value) {
        pageH.value = ListBody.value.clientHeight //list可视高度
    }
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
            context: props.context
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
    pageMgr.insert(index + 1, page);
    if (ListBody.value) {
        ListH.value = ListBody.value.clientHeight //list可视高度
    }
    if (pagelist.value && index + 1 >= 0) {
        const itemScrollH = (index + 1) * 30  //page所在高度
        if (itemScrollH + 29 >= ListH.value - pagelist.value.scroll.y) {
            if ((itemScrollH) + pagelist.value.scroll.y < ListH.value) return
            pagelist.value.clampScroll(0, -(itemScrollH + 30 - ListH.value))
        } else if (itemScrollH + 29 < -(pagelist.value.scroll.y)) {
            pagelist.value.clampScroll(0, -itemScrollH)
            console.log(-itemScrollH);
        }
    }
    props.context.selection.insertPage(page);

    nextTick(() => {
        props.context.selection.reName();
    })
}
function toggle() {
    fold.value = !fold.value;
    emit('fold', fold.value)
}
function afterDrag(wandererId: string, hostId: string, offsetOverhalf: boolean) {
    const docEditor = props.context.editor4Doc();
    docEditor.pageListDrag(wandererId, hostId, offsetOverhalf);
    pageSource.notify(0, 0, 0, Number.MAX_VALUE);
}
const rename = (value: string, id: string) => {
    // const page = props.context.selection.selectedPage
    props.context.data.pagesMgr.get(id).then((p: Page | undefined) => {
        if (!p) return
        const editor = computed(() => {
            return props.context.editor4Page(p)
        });
        editor.value.setName(value)
        props.context.selection.rename();
    })

}

const MouseDown = (id: string, e: MouseEvent) => {
    const workspace = props.context.workspace
    workspace.menuMount(false);
    if (e.button === MOUSE_RIGHT) {
        e.stopPropagation()
        if (e.target instanceof Element && e.target.closest(`.Menu`)) return
        pageMenuMount(id, e)
    }
}
const pageMenuMount = (id: string, e: MouseEvent) => {
    const workspace = props.context.workspace
    workspace.menuMount(false);
    pageMenuPosition.value.x = e.clientX
    pageMenuPosition.value.y = e.clientY - 75
    pageMenuItems = [{ name: 'copy_link', id: id }, { name: 'duplicate', id: id }, { name: 'rename', id: id }, { name: 'delete', id: id }]
    pageMenu.value = true
    e.stopPropagation()
    document.addEventListener('keydown', Menuesc);
    nextTick(() => {
        if (contextMenuEl.value) {
            const el = contextMenuEl.value.menu;
            if (el) {
                el.style.borderRadius = 4 + 'px'
                el.style.width = 160 + 'px'
            }
        }

    })
}
function Menuesc(e: KeyboardEvent) {
    if (e.code === 'Escape') pageMenuUnmount();
}
function pageMenuUnmount(e?: MouseEvent, item?: string, id?: string) {
    document.removeEventListener('keydown', Menuesc);
    pageMenu.value = false;
    if (item === 'rename') {
        e?.stopPropagation();
        props.context.selection.reName(id);

    } else if (item === 'duplicate') {
        e?.stopPropagation()
        const pageMgr = props.context.editor4Doc();
        const pageName = props.context.data.pagesList.find(p => p.id === id)
        let name = `${pageName?.name}_${t('navi.copy')}`;
        const repeats = props.context.data.pagesList.filter(i => i.name.slice(0, -1) === name);
        if (repeats.length) {
            name = `${name}${!repeats[0] ? ' ' : repeats.length + 1}`;
        }
        let page: Page | undefined;
        id && props.context.data.pagesMgr.get(id).then((p: Page | undefined) => {
            page = p && pageMgr.copy(p, name);
            const index = props.context.data.pagesList.findIndex((item) => item.id === id);
            page && pageMgr.insert(index + 1, page);
            props.context.selection.insertPage(page);
        })
    } else if (item === 'copy_link') {
        e?.stopPropagation()
    } else if (item === 'delete') {
        e?.stopPropagation()
        const index = props.context.data.pagesList.findIndex((item) => item.id === id)
        id && props.context.editor4Doc().delete(id)
        id && props.context.selection.deletePage(id, index)
    }
}
</script>
    
<template>
    <div class="pagelist-wrap" ref="pageList">
        <div class="header">
            <div class="title">{{ t('navi.page') }}</div>
            <div class="space"></div>
            <div class="btn">
                <div class="add" @click.stop="addPage" :title="t('navi.add_page')">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
                <!-- <div class="file">
                    <svg-icon icon-class="file"></svg-icon>
                </div> -->
                <div class="shrink" @click="toggle">
                    <svg-icon icon-class="down" :style="{ transform: fold ? 'rotate(90deg)' : 'rotate(0deg)' }"></svg-icon>
                </div>
            </div>
        </div>
        <div class="body" ref="ListBody" :style="{ height: fold ? 0 : 'calc(100% - 30px)' }">
            <ListView ref="pagelist" :source="pageSource" :item-view="PageItem" draging="pageList" :item-width="0" :pageHeight="pageH"
                :item-height="30" :first-index="0" v-bind="$attrs" orientation="vertical" :allowDrag="true"
                location="pagelist" @rename="rename" @onMouseDown="MouseDown" @after-drag="afterDrag">
            </ListView>
            <ContextMenu v-if="pageMenu" :x="pageMenuPosition.x" :y="pageMenuPosition.y" ref="contextMenuEl"
                :context="props.context" @close="pageMenuUnmount">
                <div class="items-wrap" v-for="(item, index) in pageMenuItems" :key="index"
                    @click="e => pageMenuUnmount(e, item.name, item.id)">
                    <span>{{ t(`pageMenu.${item.name}`) }}</span>
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

        >div:not(.space) {
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

            >div {
                margin-left: 8px;
            }

            .add {
                height: 14px;
                width: 14px;

                >svg {
                    width: 80%;
                    height: 80%;
                }
            }

            .file {
                height: 14px;
                width: 14px;

                >svg {
                    width: 80%;
                    height: 80%;
                }
            }

            .shrink {
                height: 14px;
                width: 14px;

                >svg {
                    width: 80%;
                    height: 80%;
                }
            }
        }
    }

    .body {
        height: calc(100% - 30px);

        >.container {
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
    