/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from "@/context";
import { Menu } from "@/context/menu";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import ShapeItem, { ItemData } from "./ShapeItem.vue";
import {
    adapt2Shape,
    ArtboardView,
    PageView,
    Shape,
    ShapeDirList2 as ShapeDirList,
    ShapeDirListIter2 as ShapeDirListIter,
    ShapeType,
    ShapeView
} from "@kcdesign/data";
import { useI18n } from 'vue-i18n';
import { Selection } from '@/context/selection';
import ContextMenu from '@/components/Document/Menu/ContextMenu.vue';
import SearchPanel from "./Search/SearchPanel.vue";
import { is_shape_in_selection, selection_types } from "@/utils/shapelist";
import { Navi } from "@/context/navigate";
import ShapeTypes from "./Search/ShapeTypes.vue";
import {
    DragDetail,
    hover,
    modify_after_drag,
    modify_shape_lock_status,
    modify_shape_visible_status,
    multi_select_shape,
    range_select_shape
} from "@/utils/listview";
import { v4 } from "uuid";
import { menu_locate2 } from "@/utils/common";
import { one_of_is_symbolref } from "@/utils/symbol";
import { locateShape } from "@/space/locate";
import { MenuItemType } from "../Menu";

type List = InstanceType<typeof ListView>;
type ContextMenuEl = InstanceType<typeof ContextMenu>;

class Iter implements IDataIter<ItemData> {
    private __it: ShapeDirListIter | undefined;
    // 优化下level
    private __preShape?: ShapeView;
    private __preLevel?: number;

    constructor(it: ShapeDirListIter | undefined) {
        this.__it = it;
    }

    hasNext(): boolean {
        return this.__it != undefined && this.__it.hasNext();
    }

    next(): ItemData {
        const data = (this.__it as ShapeDirListIter).next();
        const shape: ShapeView = data.data;
        let level = 0; // todo
        let p = shape.parent;
        const prep = this.__preShape?.parent;
        if (prep === p || (prep && p && prep.id === p.id)) {
            level = this.__preLevel!;
        } else {
            while (p) {
                level++
                p = p.parent;
            }
            this.__preShape = shape;
            this.__preLevel = level;
        }
        const _shape = adapt2Shape(shape);
        if (!_shape) throw new Error("shape data is null");
        return {
            id: shape.id,
            shape: () => {
                return _shape;
            },
            view: () => {
                return shape
            },
            selected: props.context.selection.isSelectedShape(shape.id),
            expand: !data.fold,
            level,
            context: props.context
        };
    }
}

const props = defineProps<{ context: Context, page: PageView, pageHeight: number }>();
const { t } = useI18n();
const itemHeight = 32;
const MOUSE_RIGHT = 2;
const shapeListMap: Map<string, ShapeDirList> = new Map();
const chartMenu = ref<boolean>(false)
const contextMenuEl = ref<ContextMenuEl>();
const shapeList = ref<HTMLDivElement>()
const shapeH = ref(0);
const keywords = ref<string>('');
const search_el = ref<HTMLInputElement>();
const includes_type = ref<ShapeType[]>([]);
const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const search_wrap = ref<HTMLDivElement>();
const accurate = ref<boolean>(false);
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
const shapelist = ref<List>();
const listBody = ref<HTMLDivElement>()

const searching = computed<boolean>(() => {
    return !!(keywords.value.length || includes_type.value.length);
});

function notifySourceChange(t?: number | string) {
    if (searching.value) return;
    if (t === Selection.CHANGE_SHAPE || t === 'changed') {
        locate();
        if (t === 'changed') props.context.navi.notify(Navi.COMP_LIST_CHANGED);
        listviewSource.notify(0, 0, 0, Number.MAX_VALUE);
    }
}

function locate() {
    const shape = props.context.selection.selectedShapes[props.context.selection.selectedShapes.length - 1];
    if (!shape) return;
    const parents: ShapeView[] = [];
    let parent = shape.parent;
    while (parent) {
        parents.unshift(parent);
        parent = parent.parent;
    }
    for (const parent of parents)
        parent.type !== ShapeType.Page && !shapeDirList.isExpand(parent.id) && toggleExpand(parent.id);

    const index = shapeDirList.indexOf(shape.id);
    const h = listBody.value!.clientHeight;
    const itemScrollH = index * 32;
    const list = shapelist.value!;

    if (itemScrollH + 29 > h - list.scroll.y) {
        if (itemScrollH + list.scroll.y < h - 32) return;
        list.clampScroll(0, -(itemScrollH + 32 - h));
    } else if (itemScrollH < -list.scroll.y) {
        list.clampScroll(0, -itemScrollH);
    }
}

function search() {
    props.context.navi.notify(Navi.SEARCHING);
    props.context.navi.set_keywords(keywords.value);
}

function input() {
    props.context.navi.notify(Navi.SEARCHING);
}

function toggleExpand(shape: string | Shape) {
    shapeDirList.toggleExpand(typeof shape === 'string' ? shape : shape.id);
    listviewSource.notify(0, 0, 0, Number.MAX_VALUE);
}

function selectShape(shape: ShapeView, is_ctrl: boolean, shiftKey: boolean) {
    if (shiftKey) return range_select_shape(props.context, shapeDirList, listviewSource, shape);
    if (is_ctrl) return multi_select_shape(props.context, shape);
    props.context.selection.selectShape(shape);
}

function hoverShape(shape: ShapeView) {
    hover(props.context, shape);

    if (shapeList.value) {
        shapeH.value = shapeList.value.offsetHeight
    }
}

function unHoverShape() {
    props.context.selection.unHoverShape();
}

const rename = (value: string, shape: ShapeView) => {
    const editor = props.context.editor4Shape(shape);
    editor.setName(value)
    props.context.selection.rename();
}

const modify_lock_status = (shape: ShapeView) => {
    modify_shape_lock_status(props.context, shape);
}

const modify_visible_status = (shape: ShapeView) => {
    modify_shape_visible_status(props.context, shape);
}

function shapeScrollToContentView(shape: ShapeView) {
    locateShape(props.context, shape);
}

function select_shape_right(shape: ShapeView, shiftKey: boolean) {
    const selection = props.context.selection;
    if (is_shape_in_selection(selection.selectedShapes, shape)) {
        return;
    }

    if (shiftKey) {
        range_select_shape(props.context, shapeDirList, listviewSource, shape);
    } else {
        selection.selectShape(shape);
    }
}

/**
 * @description 打开右键菜单
 */
const contextMenuItems = ref<Set<MenuItemType>>(new Set());
const list_mousedown = (e: MouseEvent, shape: ShapeView) => {
    const menu = props.context.menu;
    menu.menuMount();
    chartMenu.value = false
    if (e.button === MOUSE_RIGHT) {
        e.stopPropagation();
        menu.menuMount();
        if (e.target instanceof Element && e.target.closest('.__context-menu')) return;
        select_shape_right(shape, e.shiftKey);
        const selected = props.context.selection.selectedShapes;
        contextMenuItems.value.clear();
        contextMenuItems.value = new Set([MenuItemType.All, MenuItemType.Replace, MenuItemType.Visible, MenuItemType.Lock, MenuItemType.Copy, MenuItemType.Groups, MenuItemType.Container, MenuItemType.Component, MenuItemType.Forward, MenuItemType.Back, MenuItemType.Top, MenuItemType.Bottom, MenuItemType.Mask, MenuItemType.Outline]);
        if (selected.length === 1) {
            if (selected[0].type === ShapeType.SymbolRef) {
                contextMenuItems.value.add(MenuItemType.EditComps);
            }
            const type = selected[0].type;
            if (type === ShapeType.Symbol || type === ShapeType.SymbolUnion) {
                const index = contextMenuItems.value.has(MenuItemType.Component);
                if (index) contextMenuItems.value.delete(MenuItemType.Component);
            }
            if (type === ShapeType.Table) {
                contextMenuItems.value.delete(MenuItemType.Outline);
            }
            if (selected[0].mask) {
                contextMenuItems.value.add(MenuItemType.UnMask);
                contextMenuItems.value.delete(MenuItemType.Mask);
            }

            const s = selected[0] as ArtboardView;
            if (s.autoLayout) {
                contextMenuItems.value.add(MenuItemType.UnAutoLayout);
            } else {
                contextMenuItems.value.add(MenuItemType.AutoLayout);
            }
        }
        if (selected.length > 1) {
            contextMenuItems.value.add(MenuItemType.AutoLayout);
        }
        const types = selection_types(selected);
        if (types & 1) contextMenuItems.value.add(MenuItemType.UnGroup);
        if (types & 2) contextMenuItems.value.add(MenuItemType.Dissolution);
        if ((types & 4) && one_of_is_symbolref(selected)) contextMenuItems.value.add(MenuItemType.Instance);
        if (types & 8) {
            const index = contextMenuItems.value.has(MenuItemType.Component);
            if (index) contextMenuItems.value.delete(MenuItemType.Component);
        }
        if (props.context.readonly || props.context.tool.isLabel) {
            contextMenuItems.value.clear();
            contextMenuItems.value = new Set([MenuItemType.All, MenuItemType.Copy]);
        }
        chartMenuMount(e);
    }
}

const chartMenuMount = (e: MouseEvent) => {
    e.stopPropagation();
    chartMenu.value = true;
    props.context.menu.menuMount('shapelist');
    nextTick(() => {
        menu_locate2(e, contextMenuEl.value?.menu, shapeList.value);
        props.context.escstack.save(v4(), close);
    })
}

function menu_watcher(t: number) {
    if (t === Menu.SHUTDOWN_MENU) close();
}

function close() {
    let exe_result: boolean = false;
    if (chartMenu.value) {
        exe_result = true;
    }
    chartMenu.value = false;
    return exe_result;
}

function reset_selection() {
    props.context.selection.resetSelectShapes();
}

function esc(e: KeyboardEvent) {
    if (e.code === 'Escape') {
        keywords.value = '';
        if (search_el.value) {
            search_el.value.blur()
        }
    }
}

function pre_search() {
    popoverVisible.value = false;
    if (search_el.value) {
        search_el.value.select();
    }
    document.addEventListener('keydown', esc);
}

function leave_search() {
    input_blur();
    document.removeEventListener('keydown', esc)
}

function navi_watcher(t: number) {
    if (t === Navi.SEARCH_PRE) {
        if (search_el.value) {
            search_el.value.select();
        }
    } else if (t === Navi.SHAPELIST_UPDATE) {
        listviewSource.notify(0, 0, 0, Number.MAX_VALUE);
    } else if (t === Navi.MODULE_CHANGE) {
        const curr_module = props.context.navi.current_navi_module;
        if (curr_module === "Shape") {
            setTimeout(() => {
                listviewSource.notify(0, 0, 0, Number.MAX_VALUE);
            }, 200)
        }
    } else if (t === Navi.TO_SEARCH) {
        to_search();
    }
}

function clear_text() {
    keywords.value = '';
    props.context.navi.set_focus_text();
    if (search_el.value) {
        search_el.value.select();
    }
}

function show_types() {
    if (popoverVisible.value) return popoverVisible.value = false;
    if (search_el.value) {
        popoverVisible.value = true;
        nextTick(() => {
            if (popover.value && search_el.value) {
                popover.value.style.left = 6 + 'px';
                popover.value.style.top = search_el.value.offsetHeight + 26 + 'px';
                popover.value.style.height = 'auto';
            }
        })
        document.addEventListener('click', onMenuBlur);
    }

}

function update_types(st: ShapeType, push: boolean, shiftKey: boolean) {
    if (push) {
        const index = includes_type.value.findIndex(i => i === st);
        if (index === -1) {
            includes_type.value.push(st);
        }
    } else {
        const index = includes_type.value.findIndex(i => i === st);
        if (index > -1) {
            includes_type.value.splice(index, 1);
        }
    }
    if (!shiftKey) {
        popoverVisible.value = false;
    }
    document.addEventListener('keydown', esc);
    props.context.navi.notify(Navi.CHANGE_TYPE);
}

function reset_types() {
    includes_type.value.length = 0;
    props.context.navi.notify(Navi.CHANGE_TYPE);
}

function onMenuBlur(e: MouseEvent) {
    if (e.target instanceof Element && !e.target.closest('.popover') && !e.target.closest('.menu-f')) {
        const timer = setTimeout(() => {
            popoverVisible.value = false;
            document.removeEventListener('click', onMenuBlur);
            clearTimeout(timer);
        }, 30)
    }

}

function input_focus() {
    if (search_wrap.value) {
        search_wrap.value.classList.add('active-box-shadow');
    }
}

function input_blur() {
    if (search_wrap.value && !keywords.value.length) {
        search_wrap.value.classList.remove('active-box-shadow');
        props.context.navi.set_focus_text();
    }
}

function to_search() {
    if (search_el.value) {
        search_el.value.focus();
        search_el.value.select();
        pre_search();
    }
}

function accurate_shift() {
    accurate.value = !accurate.value;
    if (search_el.value) {
        search_el.value.focus();
    }
    popoverVisible.value = false;
    props.context.navi.setMode(accurate.value);
    props.context.navi.notify(Navi.SEARCHING);
}

function start_to_drag() {
    props.context.navi.set_dragging_status(true);
}

function after_drag(detail: DragDetail) {
    modify_after_drag(props.context, detail);
}

const allow_to_drag = () => {
    return !props.context.readonly && !props.context.tool.isLabel;
}

const stopWatch = watch(() => props.page, () => {
    let source = shapeListMap.get(props.page.id)
    if (!source) {
        source = new ShapeDirList(props.page);
        shapeListMap.set(props.page.id, source);
    }
    if (shapeDirList) shapeDirList.unwatch(notifySourceChange);

    shapeDirList = source;
    // for debug
    (window as any).__sd = shapeDirList;
    shapeDirList.watch(notifySourceChange)
    listviewSource.notify(0, 0, 0, Number.MAX_VALUE);
}, { immediate: true });
onMounted(() => {
    props.context.selection.watch(notifySourceChange)
    props.context.menu.watch(menu_watcher);
    props.context.navi.watch(navi_watcher);
});
onUnmounted(() => {
    props.context.selection.unwatch(notifySourceChange)
    props.context.menu.unwatch(menu_watcher);
    props.context.navi.unwatch(navi_watcher);
    stopWatch();
    if (shapeDirList) shapeDirList.unwatch(notifySourceChange);
});

import SvgIcon from '@/components/common/SvgIcon.vue';
import search_icon from '@/assets/icons/svg/search.svg';
import down_icon from '@/assets/icons/svg/down.svg';
import close_x_icon from '@/assets/icons/svg/close-x.svg';
import close_white from '@/assets/icons/svg/close-white.svg';

import delete_type_icon from '@/assets/icons/svg/delete-type.svg';
</script>

<template>
<div class="shapelist-wrap" ref="shapeList">
    <div class="header" @click.stop="reset_selection">
        <div class="search" ref="search_wrap">
            <div class="tool-container" @click="pre_search">
                <SvgIcon :icon="search_icon"/>
            </div>
            <div class="menu-f" @click="show_types">
                <SvgIcon :icon="down_icon"/>
            </div>
            <input ref="search_el" type="text" v-model="keywords"
                   :placeholder="t('home.search_layer') + '…'" @blur="leave_search" @click.stop="pre_search"
                   @change="search" @input="input" @focus="input_focus">
            <div @click="clear_text" class="close"
                 :style="{ opacity: keywords ? 1 : 0, cursor: keywords ? 'pointer' : 'auto' }">
                <SvgIcon :icon="close_x_icon"/>
            </div>
            <div :style="{ opacity: keywords ? 1 : 0, cursor: keywords ? 'pointer' : 'auto' }"
                 :class="{ 'accurate': true, 'accurate-active': accurate }" @click="accurate_shift">
                Aa
            </div>
        </div>
        <div ref="popover" class="popover" tabindex="-1" v-if="popoverVisible">
            <ShapeTypes :context="props.context" :selected="includes_type" @update-types="update_types" />
        </div>
        <div class="blocks" v-if="includes_type.length">
            <div class="block-wrap" v-for="(item, index) in includes_type" :key="index"
                 @click="(e) => update_types(item, false, e.shiftKey)">
                <div class="block">
                    <div class="content">{{ t(`shape.${item}`) }}</div>
                    <div class="close" @click.stop="(e) => update_types(item, false, e.shiftKey)">
                        <SvgIcon :icon="close_white"/>
                    </div>
                </div>
            </div>
            <div class="block-wrap" v-if="includes_type.length > 1" @click="reset_types">
                <div class="block reset">
                    <SvgIcon :icon="delete_type_icon"/>
                </div>
            </div>
        </div>
    </div>
    <div class="body" ref="listBody" @mousedown="reset_selection">
        <SearchPanel v-if="searching" :keywords="keywords" :context="props.context"
                     :shape-types="includes_type" :accurate="accurate" @item-mousedown="list_mousedown"/>
        <ListView v-else ref="shapelist" :allow-drag="allow_to_drag()" :shapeHeight="shapeH"
                  :source="listviewSource" :item-view="ShapeItem" :item-height="itemHeight" :item-width="0"
                  :first-index="0" :context="props.context" @toggleexpand="toggleExpand" @selectshape="selectShape"
                  @hovershape="hoverShape" @unhovershape="unHoverShape" @scrolltoview="shapeScrollToContentView"
                  @rename="rename" @set-visible="modify_visible_status" @set-lock="modify_lock_status"
                  @item-mousedown="list_mousedown" orientation="vertical" @drag-start="start_to_drag"
                  @after-drag-2="after_drag"/>
        <ContextMenu v-if="chartMenu" @close="close" :context="props.context" ref="contextMenuEl" @click.stop
                     :items="contextMenuItems" />
    </div>
</div>
</template>

<style scoped lang="scss">
.shapelist-wrap {
    display: flex;
    height: 100%;
    width: 100%;
    flex-direction: column;
    background-color: #fff;
    box-sizing: border-box;

    .header {
        width: 100%;
        font-size: var(--font-default-fontsize);
        box-sizing: border-box;
        position: relative;
        padding: 8px 6px;
        border-top: 1px solid #F0F0F0;

        .search {
            height: 32px;
            display: flex;
            align-items: center;
            background-color: var(--grey-light);
            border-radius: 8px;
            box-sizing: border-box;
            padding: 6px;
            overflow: hidden;
            transition: 0.32s;

            > .tool-container {
                margin-right: 2px;
                flex-shrink: 0;
                display: flex;
                align-items: center;

                > svg {
                    width: 12px;
                    height: 12px;
                }
            }

            .menu-f {
                flex-shrink: 0;
                width: 12px;
                height: 100%;
                display: flex;
                margin-left: 2px;
                justify-content: center;
                align-items: center;
                transition: 0.3s;
                cursor: pointer;

                > svg {
                    width: 12px;
                    height: 12px;
                }
            }

            .menu-f:hover {
                transform: translateY(2px);
            }

            > input {
                width: calc(100% - 64px);
                border: none;
                outline: none;
                padding-left: 5px;
                padding-right: 5px;
                background-color: transparent;
                font-size: var(--font-default-fontsize);
                caret-color: var(--active-color);
                color: var(--active-color);
                transition: 0.3s;
            }

            > .close {
                flex-shrink: 0;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background-color: var(--grey-dark);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: 0.15s;

                > img {
                    width: 10px;
                    height: 10px;
                }
            }

            > .accurate {
                flex-shrink: 0;
                user-select: none;
                background-color: var(--grey-dark);
                border-radius: 4px;
                width: 22px;
                text-align: center;
                color: rgb(111, 111, 111);
                transition: 0.15s;
                margin-left: 4px;
                line-height: 18px;
                height: 18px;
            }

            .accurate-active {
                background-color: var(--active-color);
                color: #fff;
            }
        }

        .blocks {
            margin-top: 4px;
            padding: 0 3px;

            .block-wrap {
                display: inline-block;
                border-radius: 4px;
                background-color: rgba($color: #1878F5, $alpha: 1);
                max-width: 96px;
                padding: 2px 4px;
                height: 22px;
                font-size: var(--font-default-fontsize);
                box-sizing: border-box;
                margin-right: 3px;
                margin-top: 4px;
                overflow: hidden;

                .block {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    align-items: center;

                    .content {
                        height: 100%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        color: #fff;
                    }

                    .close {
                        height: 100%;
                        width: 14px;
                        text-align: center;
                        cursor: pointer;
                        color: #fff;
                        display: flex;
                        align-items: center;
                        justify-content: flex-end;
                        margin-left: auto;

                        > img {
                            width: 12px;
                            height: 14px;
                        }
                    }


                }

                .reset {
                    cursor: pointer;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    width: 14px;
                    color: #fff;

                    > svg {
                        text-align: center;
                        height: 14px;
                    }
                }
            }
        }
    }

    .body {
        padding-left: 6px;
        flex-grow: 1;
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;

        > .container {
            height: 100%;
        }
    }

    .popover {
        position: absolute;
        top: 42px;
        left: 6px;
        color: #ffffff;
        z-index: 999;
        width: 106px;
        font-size: var(--font-default-fontsize);
        background-color: #fff;
        border: 1px solid #EBEBEB;
        border-radius: 6px;
        outline: none;
        padding: 4px 0;
        transition: 0.3s;
        box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.08);
    }
}
</style>