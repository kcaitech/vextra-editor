<script lang="ts" setup>
import { ref, watch, onUnmounted, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import ResultItem, { ItemData } from "./ResultItem.vue";
import TextResultItem, { TItemData } from "./TextResultItem.vue";
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { Shape, ShapeType, ShapeView, TextShape, TextShapeView } from '@kcdesign/data';
import { isInner } from '@/utils/content';
import { is_shape_in_selection, selection_types, fit } from '@/utils/shapelist';
import { Navi } from '@/context/navigate';
import { get_words_index_selection_sequence } from '@/utils/search';
import { WorkSpace } from '@/context/workspace';

interface Props {
    keywords: string
    context: Context
    shapeTypes: ShapeType[]
    accurate: boolean
}

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
        const item = {
            id: shape.id,
            shape,
            selected: props.context.selection.isSelectedShape(shape),
            context: props.context,
            keywords: props.keywords
        }
        return item;
    }
}

class TIter implements IDataIter<TItemData> {
    private __it: ShapeView[];
    private __index: number;

    constructor(it: ShapeView[], index: number) {
        this.__it = it;
        this.__index = index;
    }

    hasNext(): boolean {
        return this.__index < this.__it.length;
    }

    next(): TItemData {
        const shape: ShapeView = this.__it[this.__index];
        const focus = props.context.navi.focusText;
        this.__index++;
        const item = {
            id: shape.id,
            shape,
            context: props.context,
            keywords: props.keywords,
            focus: Boolean(focus && (focus.shape.id === shape.id))
        }
        return item;
    }
}
const emit = defineEmits<{
    (e: "item-mousedown", event: MouseEvent, shape: ShapeView): void;
}>()
const props = defineProps<Props>();
const { t } = useI18n();
let result_by_shape: ShapeView[] = [];
let result_by_content: ShapeView[] = [];
const valid_result_by_shape = ref<boolean>(false);
const valid_result_by_content = ref<boolean>(false);
const loading_by_shape = ref<boolean>(false);
const loading_by_content = ref<boolean>(false);
const show_content = ref<boolean>(false);
const chartMenu = ref<boolean>(false);
const height_shpae = ref<string>('50%');
let chartMenuItems: string[] = [];
const fold1 = ref<boolean>(false);
const fold2 = ref<boolean>(false);
let wait_fited = false;
// 针对图形的搜索结果
let source_by_shape = new class implements IDataSource<ItemData> {

    private m_onchange?: (index: number, del: number, insert: number, modify: number) => void;

    length(): number {
        return result_by_shape.length;
    }

    iterAt(index: number): IDataIter<ItemData> {
        return new Iter(result_by_shape, index);
    }

    onChange(l: (index: number, del: number, insert: number, modify: number) => void): void {
        this.m_onchange = l;
    }

    notify(index: number, del: number, insert: number, modify: number) {
        this.m_onchange && this.m_onchange(index, del, insert, modify);
    }
}
// 针对文本的搜索结果
let source_by_content = new class implements IDataSource<TItemData> {

    private m_onchange?: (index: number, del: number, insert: number, modify: number) => void;

    length(): number {
        return result_by_content.length;
    }

    iterAt(index: number): IDataIter<TItemData> {
        return new TIter(result_by_content, index);
    }

    onChange(l: (index: number, del: number, insert: number, modify: number) => void): void {
        this.m_onchange = l;
    }

    notify(index: number, del: number, insert: number, modify: number) {
        this.m_onchange && this.m_onchange(index, del, insert, modify);
    }
}

function selectShapeWhenShiftIsPressed(shape: ShapeView) {
    const to = result_by_shape.findIndex(i => i.id === shape.id);
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

function getShapeRange(start: number, end: number): ShapeView[] {
    const from = Math.min(start, end);
    const to = Math.max(start, end);
    const range: Map<string, ShapeView> = new Map();
    const it = source_by_shape.iterAt(from);
    for (let i = from; i <= to && it.hasNext(); i++) {
        const shape = it.next().shape;
        const childs = (shape as any).childs;
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

function getSelectShapesIndex(shapes: ShapeView[]): number[] {
    return shapes.map(s => result_by_shape.findIndex(i => i.id === s.id));
}

function selectShape(shape: ShapeView, ctrlKey: boolean, metaKey: boolean, shiftKey: boolean) {
    if (shiftKey) {
        selectShapeWhenShiftIsPressed(shape);
    } else {
        if (ctrlKey || metaKey) {
            const selected_map: Map<string, ShapeView> = new Map();
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

function hoverShape(shape: ShapeView) {
    if (props.context.workspace.transforming) return;
    props.context.selection.hoverShape(shape);
}

function unHovershape() {
    props.context.selection.unHoverShape();
}

function shapeScrollToContentView_1(shape: ShapeView) {
    const is_p2 = props.context.navi.isPhase2(shape);
    if (is_p2 && !wait_fited) {
        wait_fited = true;
        fit(props.context, shape);
        const timer = setTimeout(() => {
            wait_fited = false;
            clearTimeout(timer);
        }, 450);
        return;
    }
    if (isInner(props.context, shape)) {
        props.context.selection.selectShape(shape);
        props.context.navi.set_phase(shape.id);
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
        // eslint-disable-next-line
        workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
        props.context.navi.set_phase('');
    }

}

function set_focus(shape: ShapeView) {
    const len = (shape as TextShapeView).text.length;
    const src = (shape as TextShapeView).text.getText(0, len);
    const slice = get_words_index_selection_sequence(src, props.keywords, props.accurate);
    props.context.navi.set_focus_text({ shape, slice });
}

function shapeScrollToContentView(shape: ShapeView) {
    const is_p2 = props.context.navi.isPhase2(shape);
    if (is_p2 && !wait_fited) {
        wait_fited = true;
        fit(props.context, shape);
        const timer = setTimeout(() => {
            wait_fited = false;
            clearTimeout(timer);
        }, 450);
        return;
    }
    if (isInner(props.context, shape)) {
        props.context.selection.selectShape(shape);
        props.context.navi.set_phase(shape.id);
        if (shape.type === ShapeType.Text) {
            set_focus(shape);
        }
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
                if (shape.type === ShapeType.Text) {
                    set_focus(shape);
                } else {
                    props.context.navi.set_focus_text();
                }
                clearTimeout(timer);
            }, 400);
        } else {
            workspace.matrix.trans(transX, transY);
        }
        // eslint-disable-next-line
        workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
        props.context.navi.set_phase('');
    }

}

function rename(value: string, shape: ShapeView) {
    const editor = props.context.editor4Shape(shape);
    editor.setName(value)
}

function isLock(lock: boolean, shape: ShapeView) {
    const editor = props.context.editor4Shape(shape);
    editor.toggleLock();
    source_by_shape.notify(0, 0, 0, Number.MAX_VALUE);
}

function list_mousedown(e: MouseEvent, shape: ShapeView) {
    const menu = props.context.menu;
    menu.menuMount();
    chartMenu.value = false;
    if (e.button === 2) {
       emit('item-mousedown', e, shape);
    }
}

function isRead(read: boolean, shape: ShapeView) {
    let timer: any;
    timer && clearTimeout(timer);
    const editor = props.context.editor4Shape(shape);
    editor.toggleVisible();
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
    source_by_shape.notify(0, 0, 0, Number.MAX_VALUE);
}

function update() {
    show_content.value = false;
    valid_result_by_shape.value = false;
    valid_result_by_content.value = false;
    // fold1.value = false;
    // fold2.value = false;
    result_by_shape = [];
    result_by_content = [];
    height_shpae.value = '50%';
    const mode = props.accurate ? 'mg' : 'img'
    const words = props.keywords;
    const types = props.shapeTypes;
    const reg = new RegExp(`${words}`, mode);
    const shapes = props.context.selection.selectedPage?.shapes;

    if (shapes) {
        shapes.forEach((v) => {
            if (types.length) {
                if (!types.includes(v.type)) {
                    return;
                }
            }
            if (!words.length) {
                if (types.includes(v.type)) {
                    result_by_shape.unshift(v);
                    return;
                }
                return;
            }
            if (v.name.search(reg) > -1) {
                result_by_shape.unshift(v);
            }
            if (v.type === ShapeType.Text) {
                const length = (v as TextShapeView).text.length;
                const text = (v as TextShapeView).text.getText(0, length).replaceAll('\n', '');
                if (text.search(reg) > -1) {
                    result_by_content.unshift(v);
                }
            }
        })
    }
    if (result_by_shape.length) {
        valid_result_by_shape.value = true;
        if (!result_by_content.length && !fold1.value) {
            height_shpae.value = 'calc(100% - 76px)';
        }
        if (!result_by_content.length && fold1.value) {
            height_shpae.value = '56px';
        }
    }
    if (result_by_content.length) {
        valid_result_by_content.value = true;
        show_content.value = true;
        if (!result_by_shape.length) {
            height_shpae.value = '76px';
        } else {
            if (fold1.value) {
                height_shpae.value = '56px';
            }
            if (fold2.value && !fold1.value) {
                height_shpae.value = 'calc(100% - 76px)';
            }
        }
    }

    if (!valid_result_by_shape.value && !valid_result_by_content.value) {
        height_shpae.value = '76px';
    }
    source_by_shape.notify(0, 0, 0, Number.MAX_VALUE);
    source_by_content.notify(0, 0, 0, Number.MAX_VALUE);
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

function toggle1() {
    fold1.value = !fold1.value;
    update();
    // if (fold1.value) {
    //   height_shpae.value = '56px';
    //   if (valid_result_by_content.value) {
    //     if (fold2.value) {
    //       fold2.value = false;
    //     }
    //   }
    // } else {
    //   if (valid_result_by_content.value) {
    //     if (fold2.value) {
    //       height_shpae.value = 'calc(100% - 56px)';
    //     } else {
    //       height_shpae.value = '50%';
    //     }
    //   } else {
    //     height_shpae.value = '100%';
    //   }
    // }
}

function toggle2() {
    fold2.value = !fold2.value;
    update();
    // if (fold2.value) {
    //   height_shpae.value = 'calc(100% - 56px)';
    //   if (fold1.value) {
    //     fold1.value = false;
    //   }
    // } else {
    //   if (fold1.value) {
    //     height_shpae.value = '56px';
    //   } else {
    //     height_shpae.value = '50%';
    //   }
    // }
}

function selection_watcher(t?: number | string) {
    if (t === Selection.CHANGE_PAGE) {
        update();
    } else if (t === Selection.CHANGE_SHAPE) {
        props.context.navi.set_focus_text();
        source_by_content.notify(0, 0, 0, Number.MAX_VALUE);
    }
}

function navi_watcher(t?: number) {
    if (t === Navi.CHANGE_TYPE || t === Navi.SEARCHING || Navi.TEXT_SELECTION_CHANGE) {
        update();
    }
}

const stop1 = watch(() => props.keywords, update, { immediate: true });
const stop2 = watch(() => props.accurate, update, { immediate: true });
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.navi.watch(navi_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.navi.unwatch(navi_watcher);
    stop1();
    stop2();
})
</script>
<template>
    <div class="result-wrap">
        <div class="result-by-name" :style="{ height: height_shpae }">
            <div class="tips">
                <div class="font-wrap" v-if="props.keywords">
                    <div class="font">{{ t('system.title_includes') }}</div>
                    <div class="keywords">“{{ props.keywords }}</div>
                    <div class="end">”</div>
                    <div class="shrink" @click.stop="toggle1" v-if="valid_result_by_shape">
                        <svg-icon icon-class="down"
                                  :style="{ transform: fold1 ? 'rotate(-90deg)' : 'rotate(0deg)' }"></svg-icon>
                    </div>
                </div>
                <div class="result-count" v-if="valid_result_by_shape">
                    {{ t('search.result_count').replace('xx', result_by_shape.length.toString()) }}
                </div>
            </div>
            <div class="list-wrap">
                <ListView v-if="valid_result_by_shape" :source="source_by_shape" :item-view="ResultItem"
                          :item-height="32"
                          :item-width="0" :first-index="0" :context="props.context" @selectshape="selectShape"
                          @hovershape="hoverShape"
                          @unhovershape="unHovershape" @scrolltoview="shapeScrollToContentView_1" @rename="rename"
                          @isRead="isRead"
                          @isLock="isLock" @item-mousedown="list_mousedown" orientation="vertical">
                </ListView>
                <div v-else class="null-result">
                    {{ t('search.search_results') }}
                </div>
            </div>
        </div>
        <div class="result-by-context" v-if="props.keywords">
            <div class="tips">
                <div class="font-wrap">
                    <div class="font">{{ t('system.content_includes') }}</div>
                    <div class="keywords">“{{ props.keywords }}</div>
                    <div class="end">”</div>
                    <div class="shrink" @click.stop="toggle2" v-if="valid_result_by_content">
                        <svg-icon icon-class="down"
                                  :style="{ transform: fold2 ? 'rotate(-90deg)' : 'rotate(0deg)' }"></svg-icon>
                    </div>
                </div>
                <div class="result-count" v-if="valid_result_by_content">
                    {{ t('search.result_count').replace('xx', result_by_content.length.toString()) }}
                </div>
            </div>
            <div class="list-wrap">
                <ListView v-if="valid_result_by_content" :source="source_by_content" :item-view="TextResultItem"
                          :item-height="64"
                          :item-width="0" :first-index="0" :context="props.context" @selectshape="selectShape"
                          @hovershape="hoverShape"
                          @unhovershape="unHovershape" @scrolltoview="shapeScrollToContentView" @rename="rename"
                          @isRead="isRead"
                          @isLock="isLock" @item-mousedown="list_mousedown" orientation="vertical">
                </ListView>
                <div v-else class="null-result">
                    {{ t('search.search_results') }}
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.result-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    > .result-by-name {
        flex-shrink: 0;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: 0.3s;

        > .tips {
            display: block;
            font-size: var(--font-default-fontsize);
            width: 100%;
            border-top: 1px solid var(--grey-light);
            box-sizing: border-box;
            flex-shrink: 0;

            .font-wrap {
                display: flex;
                height: 28px;
                padding: 0 6px;
                font-weight: 500;
                white-space: nowrap;
                width: 100%;
                box-sizing: border-box;
                align-items: center;

                > .font {
                    flex-shrink: 0;
                }

                > .keywords {
                    flex-grow: 1px;
                    color: #1878F5;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                > .end {
                    flex-shrink: 0;
                    color: #1878F5;
                }

                > .shrink {
                    margin-left: auto;
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;

                    > svg {
                        transition: 0.5s;
                        width: 12px;
                        height: 12px;
                    }
                }
            }

            .result-count {
                height: 28px;
                padding: 0 6px;
                width: 100%;
                display: flex;
                align-items: center;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                font-size: 10px;
                color: #8C8C8C;
                box-sizing: border-box;
            }

        }

        > .list-wrap {
            flex-grow: 1;
            position: relative;
            overflow: hidden;

            .container {
                height: 100%;
            }

            .null-result {
                width: 100%;
                text-align: center;
                margin-top: 16px;
                font-size: 10px;
                color: #8C8C8C;
            }
        }
    }

    > .result-by-context {
        flex-grow: 1;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: 0.3s;

        > .tips {
            display: block;
            font-size: var(--font-default-fontsize);
            width: 100%;
            box-sizing: border-box;
            border-top: 1px solid var(--grey-light);
            flex-shrink: 0;

            .font-wrap {
                display: flex;
                height: 28px;
                padding: 0 6px;
                font-weight: 500;
                white-space: nowrap;
                width: 100%;
                box-sizing: border-box;
                align-items: center;

                > .font {
                    flex-shrink: 0;
                }

                > .keywords {
                    flex-grow: 1px;
                    color: #1878F5;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                > .end {
                    flex-shrink: 0;
                    color: #1878F5;
                }

                > .shrink {
                    margin-left: auto;
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;

                    > svg {
                        transition: 0.5s;
                        width: 12px;
                        height: 12px;
                    }
                }
            }

            .result-count {
                height: 28px;
                padding: 0 6px;
                width: 100%;
                display: flex;
                align-items: center;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                font-size: 10px;
                color: #8C8C8C;
                box-sizing: border-box;
            }

        }


        > .list-wrap {
            flex-grow: 1;
            position: relative;
            overflow: hidden;

            .container {
                height: 100%;
            }

            .null-result {
                width: 100%;
                text-align: center;
                margin-top: 16px;
                font-size: 10px;
                color: #8C8C8C;
            }
        }
    }
}
</style>