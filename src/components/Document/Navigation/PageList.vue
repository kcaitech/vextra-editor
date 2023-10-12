<script setup lang="ts">
import { Selection } from "@/context/selection";
import { Menu } from "@/context/menu";
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import PageItem, { ItemData } from "./PageItem.vue";
import { Context } from "@/context";
import { useI18n } from 'vue-i18n';
import { Page } from "@kcdesign/data";
import { Document, PageListItem } from "@kcdesign/data";
import ContextMenu from '@/components/common/ContextMenu.vue';
import { Navi } from "@/context/navigate";
import { Perm } from "@/context/workspace";
import { Tool } from "@/context/tool";
type List = InstanceType<typeof ListView>;
interface Props {
    context: Context
}
interface Emits {
    (e: "fold", fold: boolean): void;
}
interface MenuItem {
    name: string
    id: string
    disable: boolean
}
type ContextMenuEl = InstanceType<typeof ContextMenu>;
const { t } = useI18n();
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const pagelist = ref<List>();
const list_body = ref<HTMLDivElement>()
const ListH = ref<number>(0)
const pageH = ref<number>(0)
const fold = ref<boolean>(false)
const MOUSE_RIGHT = 2
const pageMenu = ref<boolean>(false)
const pageMenuPosition = ref<{ x: number, y: number }>({ x: 0, y: 0 }); //鼠标点击page所在的位置
let pageMenuItems: MenuItem[] = [];
const contextMenuEl = ref<ContextMenuEl>();
const cur_page_name = ref<string>(props.context.selection.selectedPage?.name || t('navi.page'));
const selectionWatcher = (type: number) => {
    if (type === Selection.CHANGE_PAGE) {
        cur_page_name.value = props.context.selection.selectedPage?.name || t('navi.page');
        pageSource.notify(0, 0, 0, Number.MAX_VALUE);
    }
}
const isEdit = ref(props.context.workspace.documentPerm);
const isLable = ref(props.context.tool.isLable);
const rightTarget = ref<string>('');
function document_watcher() {
    pageSource.notify(0, 0, 0, Number.MAX_VALUE);
}
class Iter implements IDataIter<ItemData> {
    private __document: Document;
    private __selection: Selection;
    private __index: number;
    constructor(context: Context, index: number) {
        this.__document = context.data;
        this.__selection = context.selection;
        this.__index = index;
    }
    hasNext(): boolean {
        return this.__index < this.__document.pagesList.length;
    }
    next(): ItemData {
        const id: PageListItem = this.__document.pagesList[this.__index];
        this.__index++;
        const slectedPage = this.__selection.selectedPage;
        return {
            name: id.name,
            id: id.id,
            selected: slectedPage !== undefined && slectedPage.id == id.id,
            context: props.context,
            rightTarget: rightTarget.value === id.id
        }
    }
}

const pageSource = new class implements IDataSource<ItemData> {
    private m_onchange?: (index: number, del: number, insert: number, modify: number) => void;
    indexOf(data: ItemData): number {
        throw new Error("Method not implemented.");
    }
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
    const editor = props.context.editor4Doc();
    const _tail = props.context.data.pagesList.length + 1;
    const id = props.context.selection.selectedPage?.id;
    const index = props.context.data.pagesList.findIndex((item) => item.id === id);
    const new_page = editor.insertPage(`${t('navi.page')} ${_tail}`, index + 1);
    props.context.comment.toggleCommentPage()
    if (new_page) {
        props.context.selection.selectPage(new_page);
        if (list_body.value) {
            ListH.value = list_body.value.clientHeight //list可视高度
        }
        if (pagelist.value && index + 1 >= 0) {
            const itemScrollH = (index + 1) * 30  //page所在高度
            if (itemScrollH + 29 >= ListH.value - pagelist.value.scroll.y) {
                if ((itemScrollH) + pagelist.value.scroll.y < ListH.value) return
                pagelist.value.clampScroll(0, -(itemScrollH + 30 - ListH.value))
            } else if (itemScrollH + 29 < -(pagelist.value.scroll.y)) {
                pagelist.value.clampScroll(0, -itemScrollH)
            }
        }
        props.context.navi.notify(Navi.ADD_PAGE);
        nextTick(() => {
            props.context.selection.reName();
        })
    }
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
    props.context.data.pagesMgr.get(id).then((p: Page | undefined) => {
        if (!p) return
        const editor = props.context.editor4Page(p);
        editor.setName(value);
    })
}

const mousedown = (id: string, e: MouseEvent) => {
    const menu = props.context.menu
    menu.menuMount();
    if (e.button === MOUSE_RIGHT) {
        e.stopPropagation()
        if (e.target instanceof Element && e.target.closest(`.Menu`)) return
        pageMenuMount(id, e)
        rightTarget.value = id;
        pageSource.notify(0, 0, 0, Number.MAX_VALUE);
    }
}
const pageMenuMount = (id: string, e: MouseEvent) => {
    const menu = props.context.menu
    menu.menuMount();
    pageMenuPosition.value.x = e.clientX
    pageMenuPosition.value.y = e.clientY - 75
    pageMenuItems = [
        { name: 'copy_link', id: id, disable: false },
        { name: 'duplicate', id: id, disable: false },
        { name: 'rename', id: id, disable: false },
        { name: 'delete', id: id, disable: false }
    ]
    if (props.context.data.pagesList.length === 1) {
        pageMenuItems[3].disable = true;
    }
    if(props.context.workspace.documentPerm !== Perm.isEdit || props.context.tool.isLable) {
        pageMenuItems = [
            { name: 'copy_link', id: id, disable: false },
        ]
    }
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
            pageSource.notify(0, 0, 0, Number.MAX_VALUE);
        })
    } else if (item === 'copy_link') {
        e?.stopPropagation();
    } else if (item === 'delete') {
        e?.stopPropagation();
        props.context.comment.toggleCommentPage()
        const pagesList = props.context.data.pagesList;
        if (pagesList.length === 1) return;
        if (id) {
            const index = pagesList.findIndex((item) => item.id === id)
            props.context.editor4Doc().delete(id)
            props.context.selection.deletePage(id, index)
        }
    }
    rightTarget.value = '';
    pageSource.notify(0, 0, 0, Number.MAX_VALUE);
    pageMenu.value = false;
}
function menu_watcher(t?: number) {
    if (t === Menu.SHUTDOWN_MENU) {
        pageMenu.value = false;
    }
}
function navi_watcher(t?: number) { }

const tool_watcher = (t?: number) => {
    if(t === Tool.LABLE_CHANGE) {
        isLable.value = props.context.tool.isLable;
    }
}
onMounted(() => {
    props.context.selection.watch(selectionWatcher);
    props.context.data.watch(document_watcher);
    props.context.menu.watch(menu_watcher);
    props.context.navi.watch(navi_watcher);
    props.context.tool.watch(tool_watcher);
    if (list_body.value) {
        pageH.value = list_body.value.clientHeight; //list可视高度
    }
});

onUnmounted(() => {
    props.context.selection.unwatch(selectionWatcher);
    props.context.data.unwatch(document_watcher);
    props.context.menu.unwatch(menu_watcher);
    props.context.navi.unwatch(navi_watcher);
    props.context.tool.unwatch(tool_watcher);
});
</script>
<template>
    <div class="pagelist-wrap" ref="pageList">
        <div class="header">
            <div class="title">{{ fold ? cur_page_name : t('navi.page') }}</div>
            <div class="space"></div>
            <div class="btn">
                <div class="add" @click.stop="addPage" :title="t('navi.add_page')" v-if="isEdit === Perm.isEdit && !isLable">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
                <div class="shrink" @click="toggle">
                    <svg-icon icon-class="down" :style="{ transform: fold ? 'rotate(-90deg)' : 'rotate(0deg)' }"></svg-icon>
                </div>
            </div>
        </div>
        <div class="body" ref="list_body" :style="{ height: fold ? 0 : 'calc(100% - 36px)' }">
            <ListView ref="pagelist" :source="pageSource" :item-view="PageItem" draging="pageList" :item-width="0" :context="props.context"
                :pageHeight="pageH" :item-height="30" :first-index="0" v-bind="$attrs" orientation="vertical"
                :allowDrag="true" location="pagelist" @rename="rename" @onMouseDown="mousedown" @after-drag="afterDrag">
            </ListView>
            <ContextMenu v-if="pageMenu" :x="pageMenuPosition.x" :y="pageMenuPosition.y" ref="contextMenuEl"
                :context="props.context" @close="pageMenuUnmount">
                <div :class="item.disable ? 'items-wrap-disable' : 'items-wrap'" v-for="(item, index) in pageMenuItems"
                    :key="index" @click="e => pageMenuUnmount(e, item.name, item.id)">
                    <span>{{ t(`pageMenu.${item.name}`) }}</span>
                </div>
            </ContextMenu>
        </div>
    </div>
</template>
    
<style scoped lang="scss">
.pagelist-wrap {
    height: 100%;
    box-sizing: border-box;

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
            height: 36px;
            font-weight: var(--font-default-bold);
            line-height: 36px;
            max-width: 150px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            margin-left: 6px;
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
                    transition: 0.5s;
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

.items-wrap-disable {
    font-size: var(--font-default-fontsize);
    line-height: 30px;
    padding: 0 10px;
    color: grey;
}
</style>
    