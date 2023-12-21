<script setup lang="ts">
import { Context } from "@/context";
import { Menu } from "@/context/menu";
import { onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import ShapeItem, { ItemData } from "./ShapeItem.vue";
import { Page } from "@kcdesign/data";
import { ShapeDirListIter, ShapeDirList } from "@kcdesign/data";
import { Shape } from "@kcdesign/data";
import { useI18n } from 'vue-i18n';
import { ShapeType } from '@kcdesign/data';
import { Selection } from '@/context/selection';
import ContextMenu from '@/components/common/ContextMenu.vue';
import PageViewContextMenuItems from '@/components/Document/Menu/PageViewContextMenuItems.vue';
import SearchPanel from "./Search/SearchPanel.vue";
import { debounce } from "lodash";
import { is_shape_in_selection, selection_types } from "@/utils/shapelist";
import { Navi } from "@/context/navigate";
import { Perm } from "@/context/workspace"
import ShapeTypes from "./Search/ShapeTypes.vue";
import { DragDetail, hover, modify_after_drag, modify_shape_lock_status, modify_shape_visible_status, multi_select_shape, range_select_shape, scroll_to_view } from "@/utils/listview";
import { v4 } from "uuid";

type List = InstanceType<typeof ListView>;
type ContextMenuEl = InstanceType<typeof ContextMenu>;

class Iter implements IDataIter<ItemData> {
    private __it: ShapeDirListIter | undefined;
    // 优化下level
    private __preShape?: Shape;
    private __preLevel?: number;

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
        const item = {
            id: shape.id,
            shape: () => {
                return shape
            },
            selected: props.context.selection.isSelectedShape(shape),
            expand: !data.fold,
            level,
            context: props.context
        }
        return item;
    }
}

const props = defineProps<{ context: Context, page: Page, pageHeight: number }>();
const { t } = useI18n();
const itemHieght = 32;
const MOUSE_RIGHT = 2;
const shapeListMap: Map<string, ShapeDirList> = new Map();
const chartMenu = ref<boolean>(false)
const chartMenuPosition = ref<{ x: number, y: number }>({ x: 0, y: 0 }); //鼠标点击page所在的位置
let chartMenuItems: string[] = [];
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
const list_h = ref<number>(0)

function _notifySourceChange(t?: number | string, shape?: Shape) {
    if (t === Selection.CHANGE_SHAPE || t === 'changed') {
        const shapes = props.context.selection.selectedShapes
        shapes.forEach(item => {
            let parent = item.parent
            let parents = []
            while (parent) {
                parents.unshift(parent);
                parent = parent.parent;
            }
            parents.forEach(p => {
                p.type !== ShapeType.Page && !shapeDirList.isExpand(p) && toggleExpand(p);
            })
            const indexItem = shapeDirList.indexOf(item)
            if (listBody.value) {
                list_h.value = listBody.value.clientHeight //list可视高度
            }
            if (shapelist.value && indexItem >= 0) {
                const itemScrollH = indexItem * 36
                if (itemScrollH + 29 >= list_h.value - shapelist.value.scroll.y) {
                    if ((itemScrollH) + shapelist.value.scroll.y < list_h.value - 36) return
                    shapelist.value.clampScroll(0, -(itemScrollH + 36 - list_h.value))
                } else if (itemScrollH < -(shapelist.value.scroll.y)) {
                    shapelist.value.clampScroll(0, -itemScrollH)
                }
            }
        })
    } else if (t === Selection.EXTEND) {
        if (shape) {
            toggleExpand(shape)
        }
    }
    listviewSource.notify(0, 0, 0, Number.MAX_VALUE);
}

const notifySourceChange = debounce(_notifySourceChange, 30);

function search() {
    props.context.navi.notify(Navi.SEARCHING);
    props.context.navi.set_keywords(keywords.value);
}

function inputing() {
    props.context.navi.notify(Navi.SEARCHING);
}

function toggleExpand(shape: Shape) {
    shapeDirList.toggleExpand(shape)
}

function selectShape(shape: Shape, is_ctrl: boolean, shiftKey: boolean) {
    if (shiftKey) {
        range_select_shape(props.context, shapeDirList, listviewSource, shape);
        return;
    }

    if (is_ctrl) {
        multi_select_shape(props.context, shape);
        return;
    }

    props.context.selection.selectShape(shape);
}

function hoverShape(shape: Shape) {
    hover(props.context, shape);

    if (shapeList.value) {
        shapeH.value = shapeList.value.offsetHeight
    }
}

function unHovershape() {
    props.context.selection.unHoverShape();
}

const rename = (value: string, shape: Shape) => {
    const editor = props.context.editor4Shape(shape);
    editor.setName(value)
}

const modify_lock_status = (shape: Shape) => {
    modify_shape_lock_status(props.context, shape);
}

const modify_visible_status = (shape: Shape) => {
    modify_shape_visible_status(props.context, shape);
}

function shapeScrollToContentView(shape: Shape) {
    scroll_to_view(props.context, shape);
}

function selectshape_right(shape: Shape, shiftKey: boolean) {
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

const list_mousedown = (e: MouseEvent, shape: Shape) => {
    const menu = props.context.menu;
    menu.menuMount();
    chartMenu.value = false
    if (e.button === MOUSE_RIGHT) {
        e.stopPropagation(); // 右键事件到这就不上去了
        menu.menuMount();
        if (e.target instanceof Element && e.target.closest('.__context-menu')) return;
        selectshape_right(shape, e.shiftKey);
        const selected = props.context.selection.selectedShapes;
        chartMenuItems = ['all', 'replace', 'visible', 'lock', 'copy', 'groups', 'container'];
        if (selected.length === 1) {
            chartMenuItems.push('forward', 'back', 'top', 'bottom');
        }
        const types = selection_types(selected);
        if (types & 1) chartMenuItems.push('un_group');
        if (types & 2) chartMenuItems.push('dissolution');
        if (props.context.workspace.documentPerm !== Perm.isEdit || props.context.tool.isLable) {
            chartMenuItems = ['all', 'copy'];
        }
        chartMenuMount(e);
    }
}

const chartMenuMount = (e: MouseEvent) => {
    e.stopPropagation()
    chartMenuPosition.value.x = e.clientX
    chartMenuPosition.value.y = e.clientY - props.pageHeight - listBody.value!.offsetTop - 12
    chartMenu.value = true;
    props.context.menu.menuMount('shapelist');
    nextTick(() => {
        if (contextMenuEl.value) {
            const el = contextMenuEl.value.menu;
            let sy = document.documentElement.clientHeight - e.clientY //点击图形列表剩余的高度
            if (el) {
                const height = el.offsetHeight //菜单高度
                if (sy < height) {
                    let top = height - sy
                    el.style.top = chartMenuPosition.value.y - top + 'px'
                }
                el.style.borderRadius = 4 + 'px'
                el.style.width = 200 + 'px'
            }
            props.context.esctask.save(v4(), close);
        }
    })
}

function menu_watcher(t: number) {
    if (t === Menu.SHUTDOWN_MENU) {
        close();
    }
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

function preto_search() {
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
        preto_search();
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
    return props.context.workspace.documentPerm === Perm.isEdit && !props.context.tool.isLable;
}

const stopWatch = watch(() => props.page, () => {
    let source = shapeListMap.get(props.page.id)
    if (!source) {
        source = new ShapeDirList(props.page);
        shapeListMap.set(props.page.id, source);
    }

    if (shapeDirList) {
        shapeDirList.unwatch(notifySourceChange);
    }

    shapeDirList = source;
    (window as any).sd = shapeDirList;
    shapeDirList.watch(notifySourceChange)
    notifySourceChange();
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
    if (shapeDirList) {
        shapeDirList.unwatch(notifySourceChange)
    }
});

</script>

<template>
    <div class="shapelist-wrap" ref="shapeList">
        <div class="header" @click.stop="reset_selection">
            <div class="search" ref="search_wrap">
                <div class="tool-container" @click="preto_search">
                    <svg-icon icon-class="search"></svg-icon>
                </div>
                <div class="menu-f" @click="show_types">
                    <svg-icon icon-class="down"></svg-icon>
                </div>
                <input ref="search_el" type="text" id="xpxp" v-model="keywords" :placeholder="t('home.search_layer') + '…'"
                    @blur="leave_search" @click.stop="preto_search" @change="search" @input="inputing" @focus="input_focus">
                <div @click="clear_text" class="close"
                    :style="{ opacity: keywords ? 1 : 0, cursor: keywords ? 'pointer' : 'auto' }">
                    <svg-icon icon-class="close-x"></svg-icon>
                </div>
                <div :style="{ opacity: keywords ? 1 : 0, cursor: keywords ? 'pointer' : 'auto' }"
                    :class="{ 'accurate': true, 'accurate-active': accurate }" @click="accurate_shift">
                    Aa
                </div>
            </div>
            <div ref="popover" class="popover" tabindex="-1" v-if="popoverVisible">
                <ShapeTypes :context="props.context" :selected="includes_type" @update-types="update_types"></ShapeTypes>
            </div>
            <div class="blocks" v-if="includes_type.length">
                <div class="block-wrap" v-for="(item, index) in includes_type" :key="index"
                    @click="(e) => update_types(item, false, e.shiftKey)">
                    <div class="block">
                        <div class="content">{{ t(`shape.${item}`) }}</div>
                        <div class="close" @click.stop="(e) => update_types(item, false, e.shiftKey)">
                            <svg-icon icon-class="close-x"></svg-icon>
                        </div>
                    </div>
                </div>
                <div class="block-wrap" v-if="includes_type.length > 1" @click="reset_types">
                    <div class="block reset">
                        <svg-icon icon-class="delete-type"></svg-icon>
                    </div>
                </div>
            </div>
        </div>
        <div class="body" ref="listBody" @mousedown="reset_selection">
            <SearchPanel :keywords="keywords" :context="props.context" v-if="keywords || includes_type.length"
                :shape-types="includes_type" :accurate="accurate">
            </SearchPanel>
            <ListView v-else ref="shapelist" location="shapelist" :allow-drag="allow_to_drag()" :shapeHeight="shapeH"
                :source="listviewSource" :item-view="ShapeItem" :item-height="itemHieght" :item-width="0" :first-index="0"
                :context="props.context" @toggleexpand="toggleExpand" @selectshape="selectShape" @hovershape="hoverShape"
                @unhovershape="unHovershape" @scrolltoview="shapeScrollToContentView" @rename="rename"
                @set-visible="modify_visible_status" @set-lock="modify_lock_status" @item-mousedown="list_mousedown"
                orientation="vertical" @drag-start="start_to_drag" @after-drag-2="after_drag">
            </ListView>
            <ContextMenu v-if="chartMenu" :x="chartMenuPosition.x" :y="chartMenuPosition.y" @close="close"
                :context="props.context" ref="contextMenuEl" @click.stop>
                <PageViewContextMenuItems :items="chartMenuItems" :context="props.context" @close="close">
                </PageViewContextMenuItems>
            </ContextMenu>
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
        padding: 8px 0;
        padding-right: 6px;
        box-sizing: border-box;
        border-top: 1px solid #F0F0F0;
        padding-left: 6px;

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

            >.tool-container {
                margin-right: 2px;
                flex-shrink: 0;
                display: flex;
                align-items: center;

                >svg {
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

                >svg {
                    width: 12px;
                    height: 12px;
                }
            }

            .menu-f:hover {
                transform: translateY(2px);
            }

            >input {
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

            >.close {
                flex-shrink: 0;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background-color: var(--grey-dark);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: 0.15s;

                >svg {
                    color: rgb(111, 111, 111);
                    width: 10px;
                    height: 10px;
                }
            }

            >.accurate {
                flex-shrink: 0;
                user-select: none;
                height: 100%;
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
            padding: 0 6px;

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

                        >svg {
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
                    width: 18px;
                    color: #fff;

                    >svg {
                        text-align: center;
                        height: 18px;
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
        >.container {
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
    }
}
</style>