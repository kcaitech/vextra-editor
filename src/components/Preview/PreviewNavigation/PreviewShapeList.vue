<script setup lang="ts">
import { Context } from "@/context";
import { onMounted, onUnmounted, ref, watch } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import ShapeItem, { ItemData } from "./PreviewShapeItem.vue";
import { PageView, Shape, ShapeType, adapt2Shape } from "@kcdesign/data";
import { ShapeView } from "@kcdesign/data";
import { useI18n } from 'vue-i18n';
import { debounce } from "lodash";
import { Navi } from "@/context/navigate";
import { Preview } from "@/context/preview";

type List = InstanceType<typeof ListView>;

class Iter implements IDataIter<ItemData> {
    private __it: Shape[];
    private __index: number;
    constructor(it: Shape[], index: number) {
        this.__it = it;
        this.__index = index;
    }

    hasNext(): boolean {
        return this.__index < this.__it.length;
    }

    next(): ItemData {
        const shape: Shape = this.__it[this.__index];
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
let arboardList: Shape[] = [];
const shapeList = ref<HTMLDivElement>()
const shapeH = ref(0);
const keywords = ref<string>('');
const search_el = ref<HTMLInputElement>();
const popoverVisible = ref<boolean>(false);
const search_wrap = ref<HTMLDivElement>();
const accurate = ref<boolean>(false);
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
    const page = props.context.preview.selectedPage;
    if(!page) return;
    const s = page.data.childs.find(item => item.id === shape.id);
    props.context.preview.selectShape(s);
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
    const page = props.context.preview.selectedPage;
    if (page) {
        arboardList = getFrameList(page);
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
function getFrameList(page: PageView): Shape[] {
    return page.data.childs.filter(item => item.type === ShapeType.Artboard || item.type === ShapeType.Symbol || item.type === ShapeType.SymbolRef);
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
    if (t === Preview.CHANGE_PAGE) {
        update();
    }
    if (t === Preview.CHANGE_SHAPE) {
        update();
    }
}
const updateScrollH = () => {
    const shape = props.context.preview.selectedShape;
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

const listUpdate= (...args: any[]) => {
    if(args.includes('childs')) {
        const shape = props.context.preview.selectedShape;
        const page = props.context.preview.selectedPage;
        if (!shape || !page) return;
        const shapes = getFrameList(page);    
        const shape_index = props.context.preview.shapeIndex;
        const _shape = shapes.find(item => item.id === shape.id);
        if(!_shape) {
            if(shape_index === -1 || shape_index === shapes.length) {
                props.context.preview.selectShape(shapes[0]);
            } else {
                props.context.preview.selectShape(shapes[shape_index]);
            }
        }
    }
    update();
}

const stopWatch = watch(() => props.page, (value, old) => {
    old?.unwatch(update);
    value.watch(update);
}, { immediate: true });

onMounted(() => {
    update();
    props.page.watch(listUpdate);
    props.context.preview.watch(previewWatcher);
    props.context.navi.watch(navi_watcher);
});

onUnmounted(() => {
    props.page.unwatch(listUpdate);
    props.context.preview.watch(previewWatcher);
    props.context.navi.unwatch(navi_watcher);
    stopWatch();
});

</script>

<template>
    <div class="shapelist-wrap" ref="shapeList">
        <div class="header" @click.stop>
            <div class="search" ref="search_wrap">
                <div class="tool-container" @click="preto_search">
                    <svg-icon icon-class="search"></svg-icon>
                </div>
                <input ref="search_el" type="text" id="xpxp" v-model="keywords"
                    :placeholder="t('home.search_layer') + '…'" @blur="leave_search" @click.stop="preto_search"
                    @change="search" @input="inputing" @focus="input_focus">
                <div @click="clear_text" class="close"
                    :style="{ opacity: keywords ? 1 : 0, cursor: keywords ? 'pointer' : 'auto' }">
                    <svg-icon icon-class="close-x"></svg-icon>
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
        box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);

    }
}
</style>