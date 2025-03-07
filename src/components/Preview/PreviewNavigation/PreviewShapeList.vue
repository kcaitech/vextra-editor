/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from "@/context";
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import ShapeItem, { ItemData } from "./PreviewShapeItem.vue";
import { PageView, Shape, ShapeType, ShapeView } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import { debounce } from "lodash";
import { Navi } from "@/context/navigate";
import { ElMessage } from "element-plus";
import { Selection } from "@/context/selection";
import { getFlowInfo, getFlowPathShapes, getFlowShapes } from "@/utils/preview";
import SvgIcon from "@/components/common/SvgIcon.vue";

type List = InstanceType<typeof ListView>;

class Iter implements IDataIter<ItemData> {
    private __it: ShapeView[];
    private __index: number;

    constructor(it: ShapeView[], index: number) {
        this.__it = it;
        this.__index = index;
    }

    hasNext(): boolean {
        return this.__index < this.__it.length;
    }

    next(): ItemData {
        const shape: ShapeView = this.__it[this.__index];
        this.__index++;
        if (!shape) throw new Error("shape data is null");
        const item = {
            id: shape.id,
            shape: () => {
                return shape;
            },
            selected: props.context.preview.isSelectedShape(shape.id),
            context: props.context
        }
        return item;
    }
}

const props = defineProps<{ context: Context, page: PageView, pageHeight: number }>();
const { t } = useI18n();
const itemHieght = 52;
let arboardList: ShapeView[] = [];
const shapeList = ref<HTMLDivElement>()
const shapeH = ref(0);
const keywords = ref<string>('');
const search_el = ref<HTMLInputElement>();
const popoverVisible = ref<boolean>(false);
const search_wrap = ref<HTMLDivElement>();
const accurate = ref<boolean>(false);
const flows: Map<string, string[]> = reactive(new Map());
const flow_index = ref(0);
const flow_options = ref<string[]>([]);
const flow_descs = ref<string[]>([]);
let listviewSource = new class implements IDataSource<ItemData> {
    private m_onchange?: (index: number, del: number, insert: number, modify: number) => void;

    length(): number {
        return arboardList.length;
    }

    iterAt(index: number): IDataIter<ItemData> {
        return new Iter(arboardList, index);
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

function _notifySourceChange(t?: number | string) {

    listviewSource.notify(0, 0, 0, Number.MAX_VALUE);
}

const notifySourceChange = debounce(_notifySourceChange, 30);

function search() {
    update();
}

function inputing() {
    update();
}

const selectedShape = (shape: Shape) => {
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const s = page.childs.find(item => item.id === shape.id);
    props.context.selection.selectShape(s);
    props.context.preview.setFromShapeAction(undefined);
    listviewSource.notify(0, 0, 0, Number.MAX_VALUE);
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

const update = () => {
    arboardList = [];
    const page = props.context.selection.selectedPage;
    if (page) {
        getFlowPathShapes(props.context, flows);
        const { options, descs } = getFlowInfo(props.context, flows);

        flow_options.value = options;
        flow_descs.value = descs;
        if (flow_index.value === 0) {
            arboardList = getFrameList(page);
        } else {
            const keys = Array.from(flows.keys());
            arboardList = getFlowShapes(props.context, keys[flow_index.value - 1], flows);
        }

    }
    if (keywords.value.trim().length && arboardList.length) {
        let search_list = [];
        const mode = accurate.value ? 'mg' : 'img'
        const words = keywords.value;
        const reg = new RegExp(`${words}`, mode);
        for (let i = 0; i < arboardList.length; i++) {
            const arboard = arboardList[i];
            if (arboard.name.search(reg) > -1) {
                search_list.push(arboard);
            }
        }
        arboardList = search_list;
    }
    notifySourceChange();
    listHeight();
    updateScrollH();
}

function getFrameList(page: PageView): ShapeView[] {
    return page.childs.filter(item => item.type === ShapeType.Artboard || item.type === ShapeType.Symbol || item.type === ShapeType.SymbolRef);
}

function navi_watcher(t: number) {
    if (t === Navi.TO_SEARCH) {
        to_search();
    }
}

function clear_text() {
    keywords.value = '';
    if (search_el.value) {
        search_el.value.select();
    }
    update();
}

function input_focus() {
    if (search_wrap.value) {
        search_wrap.value.classList.add('active-box-shadow');
    }
}

function input_blur() {
    if (search_wrap.value && !keywords.value.length) {
        search_wrap.value.classList.remove('active-box-shadow');
    }
}

function to_search() {
    if (search_el.value) {
        search_el.value.focus();
        search_el.value.select();
        preto_search();
    }
}

const listHeight = () => {
    if (shapeList.value) {
        shapeH.value = shapeList.value.offsetHeight
    }
}

function accurate_shift() {
    accurate.value = !accurate.value;
    if (search_el.value) {
        search_el.value.focus();
    }
    popoverVisible.value = false;
    update();
}

const previewWatcher = (t: number | string) => {
    if (t === Selection.CHANGE_PAGE) {
        update();
    }
    if (t === Selection.CHANGE_SHAPE) {
        update();
    }
}
const updateScrollH = () => {
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    let list_h = 0;
    if (listBody.value) {
        list_h = listBody.value.clientHeight //list可视高度
    }
    const index = arboardList.findIndex(item => item.id === shape.id);
    if (shapelist.value && index >= 0) {
        const itemScrollH = index * 52
        if (itemScrollH + 49 >= list_h - shapelist.value.scroll.y) {
            if ((itemScrollH) + shapelist.value.scroll.y < list_h - 52) return
            shapelist.value.clampScroll(0, -(itemScrollH + 52 - list_h))
        } else if (itemScrollH < -(shapelist.value.scroll.y)) {
            shapelist.value.clampScroll(0, -itemScrollH)
        }
    }
    listviewSource.notify(0, 0, 0, Number.MAX_VALUE);
}

const listUpdate = (...args: any[]) => {
    if (args.includes('childs')) {
        const shape = props.context.selection.selectedShapes[0];
        const page = props.context.selection.selectedPage;
        if (!page) return;
        let shapes = getFrameList(page);
        if (flow_index.value !== 0) {
            shapes = getFlowShapes(props.context, flow_options.value[flow_index.value], flows);
        }
        if (!shape) {
            nextTick(() => {
                props.context.selection.selectShape(shapes[0]);
                props.context.preview.setFromShapeAction(undefined);
            })
            return;
        }
        const shape_index = props.context.preview.shapeIndex;
        const _shape = shapes.find(item => item.id === shape.id);

        if (!_shape) {
            if (shape_index === -1 || shape_index === shapes.length) {
                props.context.selection.selectShape(shapes[0]);
            } else {
                props.context.selection.selectShape(shapes[shape_index]);
            }
            props.context.preview.setFromShapeAction(undefined);
        }
    }
    update();
}

const isMenu = ref(false);
const activeItem = ref(0);
const showMenu = () => {
    activeItem.value = flow_index.value;
    isMenu.value = true;
    document.addEventListener('click', handleClick);
}

const toggleFlow = (index: number) => {
    if (flow_index.value !== index) {
        flow_index.value = index;
        update();
        const keys = Array.from(flows.keys());
        const page = props.context.selection.selectedPage!;
        if (flow_index.value !== 0) {
            const shape = page.getShape(keys[flow_index.value - 1]);
            props.context.selection.selectShape(shape);
        }
        props.context.preview.setNaviShapeList(arboardList);
    }
    isMenu.value = false;
}

const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.target instanceof Element && !e.target.closest('.flow-options') && close();
}
const close = () => {
    isMenu.value = false;
    document.removeEventListener('click', handleClick);
}

const stopWatch = watch(() => props.page, (value, old) => {
    old?.unwatch(listUpdate);
    value.watch(listUpdate);
}, { immediate: true });

onMounted(() => {
    update();
    props.page.watch(listUpdate);
    props.context.selection.watch(previewWatcher);
    props.context.navi.watch(navi_watcher);
});

onUnmounted(() => {
    props.page.unwatch(listUpdate);
    props.context.selection.watch(previewWatcher);
    props.context.navi.unwatch(navi_watcher);
    stopWatch();
});
import down_icon from '@/assets/icons/svg/down.svg';
import white_select_icon from '@/assets/icons/svg/white-select.svg';
import page_select_icon from '@/assets/icons/svg/page-select.svg';
import search_icon from '@/assets/icons/svg/search.svg';
import close_x_icon from '@/assets/icons/svg/close-x.svg';
</script>

<template>
    <div class="shapelist-wrap" ref="shapeList">
        <div class="flow-select">
            <div class="name">选择流程：</div>
            <div class="flow-options" @click.stop="showMenu">
                <span class="options" v-if="flow_index === 0">{{ t('preview.all') }}</span>
                <span class="options" v-else>{{ flow_options[flow_index] }}</span>
                <SvgIcon :icon="down_icon"/>
                <div class="flow-menu" v-if="isMenu" :style="{ top: -4 - (flow_index * 32) + 'px' }">
                    <div class="items" v-for="(item, index) in flow_options" :key="index"
                        @click.stop="toggleFlow(index)" @mouseenter="activeItem = index"
                        :class="{ 'active-item': activeItem === index }">
                        <div class="icon">
                            <SvgIcon v-if="flow_index === index"
                                :icon="activeItem === index ? white_select_icon : page_select_icon"/>
                        </div>
                        <div class="text" v-if="index === 0">{{ t('preview.all') }}</div>
                        <div class="text" v-else>{{ item }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="header" @click.stop>
            <div class="search" ref="search_wrap">
                <div class="tool-container" @click="preto_search">
                    <SvgIcon :icon="search_icon"/>
                </div>
                <input ref="search_el" type="text" id="xpxp" v-model="keywords"
                    :placeholder="t('home.search_layer') + '…'" @blur="leave_search" @click.stop="preto_search"
                    @change="search" @input="inputing" @focus="input_focus">
                <div @click="clear_text" class="close"
                    :style="{ opacity: keywords ? 1 : 0, cursor: keywords ? 'pointer' : 'auto' }">
                    <SvgIcon :icon="close_x_icon"/>
                </div>
                <div :style="{ opacity: keywords ? 1 : 0, cursor: keywords ? 'pointer' : 'auto' }"
                    :class="{ 'accurate': true, 'accurate-active': accurate }" @click="accurate_shift">
                    Aa
                </div>
            </div>
        </div>
        <div class="body" ref="listBody">
            <ListView ref="shapelist" location="shapelist" :shapeHeight="shapeH" :source="listviewSource"
                :item-view="ShapeItem" :item-height="itemHieght" :item-width="0" :first-index="0"
                :context="props.context" orientation="vertical" @selectShape="selectedShape">
            </ListView>
        </div>
        <div class="flow-describe" v-if="flow_index !== 0">
            <div class="name">{{ t('preview.flow_describe') }}</div>
            <div>{{ flow_descs[flow_index - 1] }}</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.shapelist-wrap {
    display: flex;
    height: 100%;
    width: 100%;
    flex-direction: column;
    background-color: #fafafa;
    //padding-bottom: 8px;
    box-sizing: border-box;
    font-size: var(--font-default-fontsize);

    .flow-select {
        width: 100%;
        box-sizing: border-box;
        position: relative;
        padding: 8px 6px 0 12px;
        box-sizing: border-box;
        border-top: 1px solid #F0F0F0;
        display: flex;
        align-items: center;
        height: 32px;

        .name {
            width: 60px;
            height: 32px;
            display: flex;
            align-items: center;
            color: #737373;
        }

        .flow-options {
            position: relative;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .options {
                margin-right: 5px;
            }

            svg {
                width: 13px;
                height: 13px;
            }

            .flow-menu {
                position: absolute;
                left: 0px;
                border-radius: 4px;
                background-color: #fff;
                box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
                z-index: 100;
                padding: 4px 0;

                .items {
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    width: 100px;
                    height: 32px;

                    .icon {
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        >svg {
                            width: 12px;
                            height: 12px;
                        }
                    }
                }
            }
        }
    }

    .header {
        width: 100%;
        box-sizing: border-box;
        position: relative;
        padding: 8px 0;
        padding-right: 6px;
        box-sizing: border-box;
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

            >input {
                width: calc(100% - 64px);
                border: none;
                outline: none;
                padding-left: 5px;
                padding-right: 5px;
                background-color: transparent;
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

    .flow-describe {
        .name {
            font-weight: bolder;
            line-height: 32px;
            color: rgba(0, 0, 0, 0.9);

        }

        & {
            border-top: 1px solid #F0F0F0;
            padding: 8px 8px 8px 16px;
            width: 100%;
            max-height: 150px;
            height: 150px;
            box-sizing: border-box;
            overflow-x: hidden;
            line-height: 18px;
            word-wrap: break-word;

        }

        &::-webkit-scrollbar {
            width: 7px;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 3.5px;
            background: #efefef;
        }
    }

    .popover {
        position: absolute;
        top: 42px;
        left: 6px;
        color: #ffffff;
        z-index: 999;
        width: 106px;
        background-color: #fff;
        border: 1px solid #EBEBEB;
        border-radius: 6px;
        outline: none;
        padding: 4px 0;
        transition: 0.3s;
        box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);

    }
}

.active-item {
    background-color: var(--active-color);

    >.icon {
        >.choose {
            border-color: #fff;
        }
    }

    .text {
        color: #fff;
    }
}
</style>