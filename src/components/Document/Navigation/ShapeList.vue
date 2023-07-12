<script setup lang="ts">
import { Context } from "@/context";
import { Menu } from "@/context/menu";
import { onMounted, onUnmounted, ref, watch, computed, nextTick } from "vue";
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
import { isInner } from "@/utils/content";
import { debounce } from "lodash";
import { is_shape_in_selection, selection_types } from "@/utils/shapelist";
import { Navi } from "@/context/navigate";
import ShapeTypes from "./Search/ShapeTypes.vue";
type List = InstanceType<typeof ListView>;
type ContextMenuEl = InstanceType<typeof ContextMenu>;
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
        const item = {
            id: shape.id,
            shape,
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
const itemHieght = 30;
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
const show_accrate_btn = ref<boolean>(false);
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
                const itemScrollH = indexItem * 30
                if (itemScrollH + 29 >= list_h.value - shapelist.value.scroll.y) {
                    if ((itemScrollH) + shapelist.value.scroll.y < list_h.value - 30) return
                    shapelist.value.clampScroll(0, -(itemScrollH + 30 - list_h.value))
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

const notifySourceChange = debounce(_notifySourceChange, 48);
const stopWatch = watch(() => props.page, () => {
    let source = shapeListMap.get(props.page.id)
    if (!source) {
        source = new ShapeDirList(props.page);
        shapeListMap.set(props.page.id, source);
    }
    if (shapeDirList) shapeDirList.unwatch(notifySourceChange)
    shapeDirList = source;
    (window as any).sd = shapeDirList;
    shapeDirList.watch(notifySourceChange)
    notifySourceChange();
}, { immediate: true })


function search() {
    props.context.navi.notify(Navi.SEARCHING);
}
function inputing() {
    props.context.navi.notify(Navi.SEARCHING);
}

function toggleExpand(shape: Shape) {
    shapeDirList.toggleExpand(shape)
}
function selectShape(shape: Shape, ctrlKey: boolean, metaKey: boolean, shiftKey: boolean) {
    if (shiftKey) {
        selectShapeWhenShiftIsPressed(shape);
    } else {
        if (ctrlKey || metaKey) {
            const selected_map: Map<string, Shape> = new Map();
            const selected = props.context.selection.selectedShapes;
            for (let i = 0; i < selected.length; i++) {
                if (selected[i].id === shape.id) {
                    props.context.selection.unSelectShape(shape); // 元素本身被选中的话就取消选中
                    return;
                }
                selected_map.set(selected[i].id, selected[i]);
            }
            let p = shape.parent;
            while (p && p.type !== ShapeType.Page) { // 元素有父级被选中就不需要在选中了
                if (selected_map.get(p.id)) {
                    return;
                }
                p = p.parent;
            }
            selected.push(shape);
            selected_map.set(shape.id, shape);
            for (let i = 0; i < selected.length; i++) {
                const s = selected[i];
                let need_remove = false;
                let p = s.parent;
                while (p && p.type !== ShapeType.Page) {
                    if (selected_map.get(p.id)) {
                        need_remove = true;
                        break;
                    }
                    p = p.parent;
                }
                if (need_remove) selected_map.delete(s.id);
            }
            props.context.selection.rangeSelectShape(Array.from(selected_map.values()));
        } else {
            props.context.selection.selectShape(shape);
        }
    }
}
function selectShapeWhenShiftIsPressed(shape: Shape) {
    const to = shapeDirList.indexOf(shape);
    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length) {
        const selectShapesIndex = getSelectShapesIndex(selectedShapes);
        const from = selectShapesIndex.reduce((pre, cur) => {
            return Math.abs(to - cur) < Math.abs(to - pre) ? cur : pre;
        }, selectShapesIndex[0]);
        const shapes = getShapeRange(from, to);
        props.context.selection.rangeSelectShape(shapes);
    } else {
        props.context.selection.selectShape(shape);
    }
}
function getSelectShapesIndex(shapes: Shape[]): number[] {
    return shapes.map(s => shapeDirList.indexOf(s));
}

function getShapeRange(start: number, end: number): Shape[] {
    const from = Math.min(start, end);
    const to = Math.max(start, end);
    const range: Map<string, Shape> = new Map();
    const it = listviewSource.iterAt(from);
    for (let i = from; i <= to && it.hasNext(); i++) {
        const shape = it.next().shape;
        const childs = shape.childs;
        if (childs && childs.length) {
            for (let c_i = 0; c_i < childs.length; c_i++) {
                range.delete(childs[c_i].id);
            }
        }
        let need_set = true;
        let p = shape.parent;
        while (p && p.type !== ShapeType.Page) {
            if (range.get(p.id)) {
                need_set = false;
                break;
            }
            p = p.parent;
        }
        if (need_set) {
            range.set(shape.id, shape);
        }
    }
    return Array.from(range.values());
}

function hoverShape(shape: Shape) {
    if (props.context.workspace.transforming) return;
    props.context.selection.hoverShape(shape);
    if (shapeList.value) {
        shapeH.value = shapeList.value.offsetHeight
    }
}

function unHovershape() {
    props.context.selection.unHoverShape();
}
const rename = (value: string, shape: Shape) => {
    const editor = computed(() => {
        return props.context.editor4Shape(shape);
    });
    editor.value.setName(value)
}

const isLock = (lock: boolean, shape: Shape) => {
    const editor = computed(() => {
        return props.context.editor4Shape(shape);
    });
    editor.value.toggleLock();
    listviewSource.notify(0, 0, 0, Number.MAX_VALUE);
}

const isRead = (read: boolean, shape: Shape) => {
    let timer: any;
    timer && clearTimeout(timer);
    const editor = computed(() => {
        return props.context.editor4Shape(shape);
    });
    editor.value.toggleVisible();
    if (!read) {
        props.context.selection.unSelectShape(shape);
        props.context.selection.unHoverShape();
        props.context.workspace.translating(true);
        timer = setTimeout(() => {
            props.context.workspace.translating(false);
            clearTimeout(timer);
            timer = null;
        }, 350)
    }
    listviewSource.notify(0, 0, 0, Number.MAX_VALUE);
}
function shapeScrollToContentView(shape: Shape) {
    if (isInner(props.context, shape)) {
        props.context.selection.selectShape(shape);
        return;
    }
    const workspace = props.context.workspace;
    const { x: sx, y: sy, height, width } = shape.frame2Root();
    const shapeCenter = workspace.matrix.computeCoord(sx + width / 2, sy + height / 2); // 计算shape中心点相对contenview的位置
    const { x, y, bottom, right } = workspace.root;
    const contentViewCenter = { x: (right - x) / 2, y: (bottom - y) / 2 }; // 计算contentview中心点的位置
    const transX = contentViewCenter.x - shapeCenter.x, transY = contentViewCenter.y - shapeCenter.y;
    if (transX || transY) {
        props.context.selection.unHoverShape();
        props.context.selection.selectShape();
        const pageViewEl = props.context.workspace.pageView;
        if (pageViewEl) {
            pageViewEl.classList.add('transition-400');
            props.context.workspace.translating(true);
            workspace.matrix.trans(transX, transY);
            const timer = setTimeout(() => {
                props.context.selection.selectShape(shape);
                pageViewEl.classList.remove('transition-400');
                props.context.workspace.translating(false);
                clearTimeout(timer);
            }, 400);
        } else {
            workspace.matrix.trans(transX, transY);
        }
        workspace.matrixTransformation();
    }

}
function selectshape_right(shape: Shape, shiftKey: boolean) {
    const selection = props.context.selection;
    if (is_shape_in_selection(selection.selectedShapes, shape)) return;
    if (shiftKey) {
        selectShapeWhenShiftIsPressed(shape);
    } else {
        selection.selectShape(shape);
    }
}
const list_mousedown = (e: MouseEvent, shape: Shape) => {
    const menu = props.context.menu;
    menu.menuMount(false);
    chartMenu.value = false
    if (e.button === MOUSE_RIGHT) {
        e.stopPropagation(); // 右键事件到这就不上去了
        menu.menuMount(false);
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
        chartMenuMount(e);
    }
}

const chartMenuMount = (e: MouseEvent) => {
    e.stopPropagation()
    chartMenuPosition.value.x = e.clientX
    chartMenuPosition.value.y = e.clientY - props.pageHeight - listBody.value!.offsetTop - 12
    chartMenu.value = true;
    props.context.menu.menuMount(true);
    document.addEventListener('keydown', menu_unmount);
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
        }
    })
}
function after_drag(wandererId: string, hostId: string, offsetOverhalf: boolean) {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (page) {
        const wanderer = selection.getShapeById(wandererId);
        const host = selection.getShapeById(hostId);
        if (wanderer && host) {
            const editor = props.context.editor4Page(page);
            editor.shapeListDrag(wanderer, host, offsetOverhalf);
        }
    }
}
function menu_watcher(t: number) {
    if (t === Menu.SHUTDOWN_MENU) {
        close();
    }
}
function menu_unmount(e: KeyboardEvent) {
    if (e.code === 'Escape') {
        close();
    }
}
function close() {
    document.removeEventListener('keydown', menu_unmount);
    chartMenu.value = false;
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
    }
}
function clear_text() {
    keywords.value = '';
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
                popover.value.style.left = search_el.value.offsetLeft - 16 + 'px';
                popover.value.style.top = search_el.value.offsetHeight + 50 + 'px';
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
    props.context.navi.notify(Navi.SEARCH);
    document.addEventListener('keydown', esc);
    if (!shiftKey) {
        popoverVisible.value = false;
    }
}
function reset_types() {
    includes_type.value = [];
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
    if (search_wrap.value) {
        if (!keywords.value.length) {
            search_wrap.value.classList.remove('active-box-shadow');
        }
    }
}
function keyboard_watcher(e: KeyboardEvent) {
    if (e.code === 'KeyF' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
    }
    if (e.target instanceof HTMLInputElement) return;
    if (e.code === 'KeyF' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (search_el.value) {
            search_el.value.focus();
            search_el.value.select();
            preto_search();
        }
    }
}
function accurate_shift() {
    accurate.value = !accurate.value;
    if (search_el.value) {
        search_el.value.focus();
    }
    popoverVisible.value = false;
    props.context.menu.setMode(accurate.value);
}
function search_el_mouseenter() {
    show_accrate_btn.value = true;
}
function search_el_mouseleave() {
    show_accrate_btn.value = false;
}
onMounted(() => {
    props.context.selection.watch(notifySourceChange)
    props.context.menu.watch(menu_watcher);
    props.context.navi.watch(navi_watcher);
    document.addEventListener('keydown', keyboard_watcher);
});

onUnmounted(() => {
    props.context.selection.unwatch(notifySourceChange)
    props.context.menu.unwatch(menu_watcher);
    props.context.navi.unwatch(navi_watcher);
    stopWatch();
    if (shapeDirList) { shapeDirList.unwatch(notifySourceChange) }
    document.removeEventListener('keydown', keyboard_watcher);
});

</script>

<template>
    <div class="shapelist-wrap" ref="shapeList">

        <div class="header" @click.stop="reset_selection">
            <div class="title">{{ t('navi.shape') }}</div>
            <div class="search" ref="search_wrap" @mouseenter="search_el_mouseenter" @mouseleave="search_el_mouseleave">
                <div class="tool-container">
                    <svg-icon icon-class="search"></svg-icon>
                </div>
                <div class="menu-f" @click="show_types">
                    <svg-icon icon-class="down"></svg-icon>
                </div>
                <input ref="search_el" type="text" v-model="keywords" :placeholder="t('home.search_layer') + '…'"
                    @blur="leave_search" @click="preto_search" @change="search" @input="inputing" @focus="input_focus">
                <div @click="clear_text" class="close" v-if="show_accrate_btn && keywords">
                    <svg-icon icon-class="close"></svg-icon>
                </div>
                <div v-if="show_accrate_btn && keywords" :class="{ 'accurate': true, 'accurate-active': accurate }"
                    @click="accurate_shift">
                    Aa
                </div>
            </div>
            <div ref="popover" class="popover" tabindex="-1" v-if="popoverVisible">
                <ShapeTypes :context="props.context" :selected="includes_type" @update-types="update_types"></ShapeTypes>
            </div>
            <div class="blocks">
                <div class="block-wrap" v-for="(item, index) in includes_type" :key="index">
                    <div class="block">
                        <div class="content">{{ t(`shape.${item}`) }}</div>
                        <div class="close" @click="(e) => update_types(item, false, e.shiftKey)">x</div>
                    </div>
                </div>
                <div class="block-wrap" v-if="includes_type.length > 1" @click="reset_types">
                    <div class="block reset">
                        <svg-icon icon-class="delete-type"></svg-icon>
                    </div>
                </div>
            </div>
        </div>
        <div class="body" ref="listBody" @click="reset_selection">
            <SearchPanel :keywords="keywords" :context="props.context" v-if="keywords" :shape-types="includes_type"
                :accurate="accurate">
            </SearchPanel>
            <ListView v-else ref="shapelist" location="shapelist" :allow-drag="true" draging="shapeList"
                :shapeHeight="shapeH" :source="listviewSource" :item-view="ShapeItem" :item-height="itemHieght"
                :item-width="0" :first-index="0" :context="props.context" @toggleexpand="toggleExpand"
                @selectshape="selectShape" @hovershape="hoverShape" @unhovershape="unHovershape"
                @scrolltoview="shapeScrollToContentView" @rename="rename" @isRead="isRead" @isLock="isLock"
                @item-mousedown="list_mousedown" orientation="vertical" @after-drag="after_drag">
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

    .header {
        width: 100%;
        font-size: 10px;
        box-sizing: border-box;
        position: relative;

        .title {
            height: 36px;
            margin-left: 13px;
            font-weight: var(--font-default-bold);
            line-height: 36px;
            box-sizing: border-box;
            overflow: hidden;
        }

        .search {
            height: 26px;
            margin: 3px 13px;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            background-color: var(--grey-light);
            padding: 4px var(--default-padding-half);
            border-radius: 8px;
            box-sizing: border-box;
            overflow: hidden;
            transition: 0.32s;

            >.tool-container {
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
                width: 10px;
                height: 28px;
                display: flex;
                margin-left: 4px;
                justify-content: center;
                align-items: center;
                transition: 0.3s;
                cursor: pointer;

                >svg {
                    width: 80%;
                    height: 60%;
                }
            }

            .menu-f:hover {
                transform: translateY(2px);
            }

            >input {
                flex: 1 1 auto;
                border: none;
                outline: none;
                margin-left: 4px;
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
                cursor: pointer;

                >svg {
                    width: 60%;
                    height: 60%;
                }
            }

            >.accurate {
                flex-shrink: 0;
                cursor: pointer;
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
            }

            .accurate-active {
                background-color: var(--active-color);
                color: #fff;
            }
        }

        .blocks {
            padding: 2px 13px;

            .block-wrap {
                display: inline-block;
                border-radius: 4px;
                background-color: rgba($color: #0d99ff, $alpha: 1);
                max-width: 96px;
                padding: 2px 4px;
                height: 20px;
                font-size: var(--font-default-fontsize);
                box-sizing: border-box;
                margin-right: 4px;
                margin-bottom: 4px;
                overflow: hidden;

                .block {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    align-items: center;

                    .content {
                        flex-wrap: 1;
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
        flex-grow: 1;
        width: 100%;
        overflow: hidden;

        >.container {
            height: 100%;
        }
    }

    .popover {
        position: absolute;
        color: #ffffff;
        z-index: 999;
        width: 202px;
        font-size: var(--font-default-fontsize);
        background-color: var(--theme-color);
        border-radius: 4px;
        outline: none;
        padding: var(--default-padding-half) 0;
    }
}
</style>