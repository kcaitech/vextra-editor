/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

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
import ContextMenu from '@/components/Document/Menu/ContextMenu.vue';
import { Tool } from "@/context/tool";
import { copyLink } from "@/utils/clipboard";
import { v4 } from "uuid";
import { menu_locate2 } from "@/utils/common";
import Tooltip from "@/components/common/Tooltip.vue";

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
const emits = defineEmits<Emits>();
const pagelist = ref<List>();
const list_body = ref<HTMLDivElement>()
const fold = ref<boolean>(props.context.user.pageListSpace.fold)
const pageMenu = ref<boolean>(false)
const pageMenuPosition = ref<{ x: number, y: number }>({ x: 0, y: 0 });
let pageMenuItems: MenuItem[] = [];
const contextMenuEl = ref<ContextMenuEl>();
const cur_page_name = ref<string>(t('navi.page'));
const selectionWatcher = (type: number | string) => {
    if (type === Selection.CHANGE_PAGE) {
        getPageName();
        pageSource.notify(0, 0, 0, Number.MAX_VALUE);
    }
}
const getPageName = () => {
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const pages = props.context.data.pagesList
    const name = pages.find(item => item.id === page.id)?.name
    cur_page_name.value = name || t('navi.page');
}

const isLable = ref(props.context.tool.isLable);
const rightTarget = ref<string>('');
const pageList = ref<HTMLDivElement>()

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
        const selectedPage = this.__selection.selectedPage;
        return {
            name: id.name,
            id: id.id,
            selected: selectedPage !== undefined && selectedPage.id == id.id,
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
    const id = props.context.selection.selectedPage!.id;
    const index = props.context.data.pagesList.findIndex((item) => item.id === id);
    const new_page = editor.insertPage(`${t('navi.page')} ${_tail}`, index + 1);
    if (!new_page) return;
    props.context.selection.selectPage(props.context.getPageDom(new_page).dom);
    const height = list_body.value!.clientHeight;
    if (pagelist.value && index + 1 >= 0) {
        const itemScrollH = (index + 1) * 32;
        if (itemScrollH + 32 >= height - pagelist.value.scroll.y) {
            if ((itemScrollH) + pagelist.value.scroll.y >= height) {
                pagelist.value.clampScroll(0, -(itemScrollH + 32 - height));
            }
        } else if (itemScrollH + 32 < -(pagelist.value.scroll.y)) {
            pagelist.value.clampScroll(0, -itemScrollH)
        }
        pageSource.notify(0, 0, 0, Number.MAX_VALUE);
    }
    nextTick(() => props.context.selection.reName());
}

function toggle() {
    fold.value = !fold.value;
    getPageName();
    emits('fold', fold.value);
    nextTick(() => {
        const id = props.context.selection.selectedPage?.id;
        const index = props.context.data.pagesList.findIndex((item) => item.id === id);
        scrollList(index);
    })
    if (!fold.value) {
        const timer = setTimeout(() => {
            pageSource.notify(0, 0, 0, Number.MAX_VALUE);
            clearTimeout(timer);
        }, 100);
    }
}

function afterDrag(wandererId: string, hostId: string, offsetOverHalf: boolean) {
    const docEditor = props.context.editor4Doc();
    docEditor.pageListDrag(wandererId, hostId, offsetOverHalf);
    pageSource.notify(0, 0, 0, Number.MAX_VALUE);
}

const rename = (value: string, id: string) => {
    props.context.editor4Doc().setPageName(value, id);
}

const mousedown = (id: string, e: MouseEvent) => {
    const menu = props.context.menu
    menu.menuMount();
    if (e.button === 2) {
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
    pageMenuPosition.value.y = e.clientY - 85
    pageMenuItems = [
        { name: 'copy_link', id: id, disable: false },
        { name: 'duplicate', id: id, disable: false },
        { name: 'rename', id: id, disable: false },
        { name: 'delete', id: id, disable: false }
    ]
    if (props.context.data.pagesList.length === 1) {
        pageMenuItems[3].disable = true;
    }
    if (props.context.readonly || props.context.tool.isLable) {
        pageMenuItems = [
            { name: 'copy_link', id: id, disable: false },
        ]
    }
    pageMenu.value = true
    e.stopPropagation()
    boardMgr.addEventListener('keydown', menuEsc);
    document.addEventListener('mousedown', handleClickOutside);
    chartMenuMount(e);
}

const chartMenuMount = (e: MouseEvent) => {
    e.stopPropagation();
    props.context.menu.menuMount('pagelist');
    nextTick(() => {
        if (contextMenuEl.value) {
            const el = contextMenuEl.value.menu;
            menu_locate2(e, el, pageList.value);
            props.context.escstack.save(v4(), () => {
                const achieve = pageMenu.value;
                pageMenu.value = false;
                return achieve;
            });
        }
    })
}

function menuEsc(e: KeyboardEvent) {
    if (e.code === 'Escape') pageMenuUnmount();
}

function handleClickOutside(event: MouseEvent) {
    event.stopPropagation()
    if (event.target instanceof Element && !event.target.closest('.context_menu')) {
        pageMenu.value = false;
        document.removeEventListener('mousedown', handleClickOutside);
    }
}
const boardMgr = new KeyboardMgr(props.context);
function pageMenuUnmount(e?: MouseEvent, item?: string, id?: string) {
    boardMgr.removeEventListener('keydown', menuEsc);
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
        const page_url = location.href + ' ' + `邀请您进入《${document.title}》，点击链接开始协作`
        copyLink(page_url, t);
    } else if (item === 'delete') {
        e?.stopPropagation();
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

function navi_watcher(t?: number) {
}

const tool_watcher = (t?: number) => {
    if (t === Tool.LABLE_CHANGE) {
        isLable.value = props.context.tool.isLable;
    }
}
const allow_to_drag = () => {
    return !props.context.readonly && !props.context.tool.isLable;
}
const scrollList = (index: number) => {
    const itemScrollH = index * 32;
    const list = pagelist.value!;
    const containerH = list_body.value!.clientHeight;
    const bottom = itemScrollH + 32;
    if (bottom > containerH) list.clampScroll(0, -(bottom - containerH));
}

function scrollToCurrentPage() {
    nextTick(() => {
        const page = props.context.selection.selectedPage!;
        scrollList(props.context.data.pagesList.findIndex((item) => item.id === page.id));
    });
}

onMounted(() => {
    getPageName();
    scrollToCurrentPage();
    props.context.selection.watch(selectionWatcher);
    props.context.data.watch(document_watcher);
    props.context.menu.watch(menu_watcher);
    props.context.navi.watch(navi_watcher);
    props.context.tool.watch(tool_watcher);
});

onUnmounted(() => {
    props.context.selection.unwatch(selectionWatcher);
    props.context.data.unwatch(document_watcher);
    props.context.menu.unwatch(menu_watcher);
    props.context.navi.unwatch(navi_watcher);
    props.context.tool.unwatch(tool_watcher);
});

import SvgIcon from '@/components/common/SvgIcon.vue';
import add_icon from '@/assets/icons/svg/add.svg';
import down_icon from '@/assets/icons/svg/down.svg';
import { KeyboardMgr } from "@/keyboard";
</script>

<template>
<div class="pagelist-wrap" ref="pageList">
    <div class="header">
        <div class="title">{{ fold ? cur_page_name : t('navi.page') }}</div>
        <div class="btn">
            <Tooltip v-if="!context.readonly && !isLable" :content="t('navi.add_page')">
                <div class="add" @click.stop="addPage">
                    <SvgIcon :icon="add_icon"/>
                </div>
            </Tooltip>
            <div class="shrink" @click="toggle">
                <SvgIcon :icon="down_icon"
                          :style="{ transform: fold ? 'rotate(-90deg)' : 'rotate(0deg)' }"/>
            </div>
        </div>
    </div>
    <div class="body" ref="list_body" :style="{ height: fold ? 0 : 'calc(100% - 40px)' }">
        <ListView ref="pagelist" :source="pageSource"
                  :item-view="PageItem" :item-width="0" :item-height="32"
                  :first-index="0" v-bind="$attrs" orientation="vertical"
                  :allowDrag="allow_to_drag()"
                  @rename="rename" @onMouseDown="mousedown" @after-drag="afterDrag">
        </ListView>
        <div class="context_menu" v-if="pageMenu" ref="contextMenuEl"
             :style="{ top: pageMenuPosition.y + 'px', left: pageMenuPosition.x + 'px' }">
            <div :class="item.disable ? 'items-wrap-disable' : 'items-wrap'" v-for="(item, index) in pageMenuItems"
                 :key="index" @click="e => pageMenuUnmount(e, item.name, item.id)">
                <span>{{ t(`pageMenu.${item.name}`) }}</span>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped lang="scss">
.pagelist-wrap {
    height: 100%;
    box-sizing: border-box;
    padding-left: 6px;

    .header {
        width: 100%;
        height: 40px;
        display: flex;
        padding-right: 6px;
        font-size: var(--font-default-fontsize);
        box-sizing: border-box;
        align-items: center;
        justify-content: space-between;
        overflow: hidden;
        color: #434343;

        .title {
            height: 40px;
            line-height: 40px;
            max-width: calc(100% - 70px);
            margin-left: 8px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }

        .btn {
            display: flex;
            height: 100%;
            align-items: center;

            > div {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--default-radius);

                &:hover {
                    background-color: #F5F5F5;
                }

                > svg {
                    width: 16px;
                    height: 16px;
                }
            }
        }
    }

    .body {
        > .container {
            height: 100%;
        }

        .context_menu {
            position: absolute;
            z-index: 99;
            color: #262626;
            width: 196px;
            display: flex;
            flex-direction: column;
            border-radius: 8px;
            box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.08);
            background-color: #FFFFFF;
            border: 1px solid #EBEBEB;
            padding: 6px 0;

            cursor: auto !important;
        }
    }

    :deep(.port) {
        transform: translateX(-6px);
    }
}

.items-wrap {
    font-size: var(--font-default-fontsize);
    height: 32px;
    line-height: 32px;
    padding: 0 24px;
    box-sizing: border-box;

    &:hover {
        background-color: var(--active-color);
        color: #ffffff;
    }
}

.items-wrap-disable {
    font-size: var(--font-default-fontsize);
    height: 32px;
    padding: 0 24px;
    line-height: 32px;
    box-sizing: border-box;
    color: grey;
}
</style>