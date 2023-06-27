<script setup lang="ts">
import { Context } from "@/context";
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
import { isInner } from "@/utils/content";
import { debounce } from "lodash";
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
const shapeH = ref(0)
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
const ListBody = ref<HTMLDivElement>()
const ListH = ref<number>(0)
function _notifySourceChange(t?: number | string) {
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
            if (ListBody.value) {
                ListH.value = ListBody.value.clientHeight //list可视高度
            }
            if (shapelist.value && indexItem >= 0) {
                const itemScrollH = indexItem * 30
                if (itemScrollH + 29 >= ListH.value - shapelist.value.scroll.y) {
                    if ((itemScrollH) + shapelist.value.scroll.y < ListH.value - 30) return
                    shapelist.value.clampScroll(0, -(itemScrollH + 30 - ListH.value))
                } else if (itemScrollH < -(shapelist.value.scroll.y)) {
                    shapelist.value.clampScroll(0, -itemScrollH)
                }
            }
        })
    }
    listviewSource.notify(0, 0, 0, Number.MAX_VALUE);
}

const notifySourceChange = debounce(_notifySourceChange, 20);
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


function search(e: Event) {
    // console.log((e.target as HTMLInputElement).value);
}
function toggleExpand(shape: Shape) {
    shapeDirList.toggleExpand(shape)
}
function selectShape(data: ItemData, ctrlKey: boolean, metaKey: boolean, shiftKey: boolean) {
    if (shiftKey) {
        selectShapeWhenShiftIsPressed(data);
    } else {
        props.context.selection.selectShape(data.shape, ctrlKey, metaKey);
    }
}
function selectShapeWhenShiftIsPressed(curData: ItemData) {
    const to = shapeDirList.indexOf(curData.shape);
    const selectedShapes = props.context.selection.selectedShapes;
    const selectShapesIndex = getSelectShapesIndex(selectedShapes);
    const from = selectShapesIndex.reduce((pre, cur) => {
        return Math.abs(to - cur) < Math.abs(to - pre) ? cur : pre;
    }, selectShapesIndex[0]);
    const shapes = getShapeRange(from, to);
    props.context.selection.rangeSelectShape(shapes);
}
function getSelectShapesIndex(shapes: Shape[]): number[] {
    return shapes.map(s => shapeDirList.indexOf(s));
}

function getShapeRange(start: number, end: number): Shape[] {
    const from = Math.min(start, end);
    const to = Math.max(start, end);
    const dataRange: Shape[] = [];
    const it = listviewSource.iterAt(from);
    for (let i = from; i <= to && it.hasNext(); i++) {
        dataRange.push(it.next().shape);
    }
    return dataRange;
}

function hoverShape(shape: Shape) {
    if (props.context.workspace.transforming) return;
    props.context.selection.hoverShape(shape);
    if (shapeList.value)
        shapeH.value = shapeList.value.offsetHeight

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
    const { x: sx, y: sy, height, width } = shape.frame2Page();
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

const MouseDown = (e: MouseEvent) => {
    const workspace = props.context.workspace
    workspace.menuMount(false);
    chartMenu.value = false
    if (e.button === MOUSE_RIGHT) {
        const workspace = props.context.workspace
        workspace.menuMount(false);
        e.stopPropagation();
        if (e.target instanceof Element && e.target.closest(`.Menu`)) return;
        chartMenuMount(e);
        e.stopPropagation()
    }
}

const chartMenuMount = (e: MouseEvent) => {
    chartMenuPosition.value.x = e.clientX
    chartMenuPosition.value.y = e.clientY - props.pageHeight - ListBody.value!.offsetTop - 12
    chartMenuItems = ['paste', 'copy', 'visible', 'lock', 'forward', 'back', 'top', 'bottom', 'groups', 'container', 'un_group', 'component', 'instance', 'reset', 'edit']
    chartMenu.value = true
    e.stopPropagation()
    document.addEventListener('keydown', Menuesc);
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
function afterDrag(wandererId: string, hostId: string, offsetOverhalf: boolean) {
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
function Menuesc(e: KeyboardEvent) {
    if (e.code === 'Escape') chartMenuUnmount();
}
function chartMenuUnmount() {
    document.removeEventListener('keydown', Menuesc);
    chartMenu.value = false;
}

onMounted(() => {
    props.context.selection.watch(notifySourceChange)
});

onUnmounted(() => {
    props.context.selection.unwatch(notifySourceChange)
    stopWatch();
    if (shapeDirList) shapeDirList.unwatch(notifySourceChange)
});

</script>

<template>
    <div class="shapelist-wrap" ref="shapeList">
        <div class="header">
            <div class="title">{{ t('navi.shape') }}</div>
            <div class="search">
                <svg-icon icon-class="search"></svg-icon>
                <input type="text" :placeholder="t('home.search_layer') + '…'" @change="(e: Event) => search(e)">
            </div>
        </div>
        <div class="body" ref="ListBody">
            <ListView ref="shapelist" location="shapelist" :allowDrag="true" draging="shapeList" :shapeHeight="shapeH"
                :source="listviewSource" :item-view="ShapeItem" :item-height="itemHieght" :item-width="0" :first-index="0"
                :context="props.context" @toggleexpand="toggleExpand" @selectshape="selectShape" @hovershape="hoverShape"
                @unhovershape="unHovershape" @scrolltoview="shapeScrollToContentView" @rename="rename" @isRead="isRead"
                @isLock="isLock" @onMouseDown="MouseDown" orientation="vertical" @after-drag="afterDrag">
            </ListView>
            <ContextMenu v-if="chartMenu" :x="chartMenuPosition.x" :y="chartMenuPosition.y" @close="chartMenuUnmount"
                :context="props.context" ref="contextMenuEl">
                <PageViewContextMenuItems :items="chartMenuItems" :context="props.context">
                </PageViewContextMenuItems>
            </ContextMenu>
        </div>
    </div>
</template>

<style scoped lang="scss">
.shapelist-wrap {
    height: 100%;
    background-color: #fff;

    .header {
        width: 100%;
        height: 70px;
        font-size: 10px;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;

        >div:not(.space) {
            flex-shrink: 0;
        }

        .title {
            margin-left: 13px;
            font-weight: var(--font-default-bold);
            line-height: 36px;
            height: 36px;
        }

        .search {
            width: auto;
            height: 26px;
            margin: 3px 10px;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            background-color: var(--grey-light);
            padding: 4px var(--default-padding-half);
            border-radius: 8px;

            >svg {
                width: 12px;
                height: 12px;
            }

            >input {
                flex: 1 1 auto;
                border: none;
                outline: none;
                margin-left: 4px;
                background-color: transparent;
                font-size: var(--font-default-fontsize);
            }
        }
    }

    .body {
        height: calc(100% - 64px);

        >.container {
            height: 100%;
        }
    }
}
</style>