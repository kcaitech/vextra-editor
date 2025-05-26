/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { ref, watch, onUnmounted, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import ResultItem, { ItemData } from "./ResultItem.vue";
import TextResultItem, { TItemData } from "./TextResultItem.vue";
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { ShapeType, ShapeView, TextShapeView } from '@kcdesign/data';
import { Navi } from '@/context/navigate';
import { locateShape } from "@/space/locate";
import { multi_select_shape } from "@/utils/listview";

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
        return {
            id: shape.id,
            shape,
            selected: props.context.selection.isSelectedShape(shape),
            context: props.context,
            keywords: props.keywords
        };
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
        return {
            id: shape.id,
            shape,
            context: props.context,
            keywords: props.keywords,
            focus: Boolean(focus && (focus.shape.id === shape.id))
        };
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
const show_content = ref<boolean>(false);
const chartMenu = ref<boolean>(false);
const height_shape = ref<string>('50%');
const fold1 = ref<boolean>(false);
const fold2 = ref<boolean>(false);
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

function range_select_shape(context: Context, shape: ShapeView) {
    const to = result_by_shape.findIndex(i => i.id === shape.id);
    const selectedShapes = context.selection.selectedShapes;
    if (selectedShapes.length) {
        const selectShapesIndex = selectedShapes.map(j => result_by_shape.findIndex(i => i.id === j.id));
        const from = selectShapesIndex.reduce((pre, cur) => {
            return Math.abs(to - cur) > Math.abs(to - pre) ? cur : pre;
        }, selectShapesIndex[0]);
        const shapes = result_by_shape.filter((_, i) => from < to ? i >= from && i <= to : i >= to && i <= from);
        context.selection.rangeSelectShape(shapes);
    } else {
        context.selection.selectShape(shape);
    }
}

function selectShape(shape: ShapeView, is_ctrl: boolean, shiftKey: boolean) {
    if (shiftKey) return range_select_shape(props.context, shape);
    if (is_ctrl) return multi_select_shape(props.context, shape);
    props.context.selection.selectShape(shape);
}

function hoverShape(shape: ShapeView) {
    if (props.context.workspace.transforming) return;
    props.context.selection.hoverShape(shape);
}

function unHovershape() {
    props.context.selection.unHoverShape();
}

function shapeScrollToContentView(shape: ShapeView) {
    locateShape(props.context, shape);
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
    result_by_shape = [];
    result_by_content = [];
    height_shape.value = '50%';
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
            height_shape.value = 'calc(100% - 76px)';
        }
        if (!result_by_content.length && fold1.value) {
            height_shape.value = '56px';
        }
    }
    if (result_by_content.length) {
        valid_result_by_content.value = true;
        show_content.value = true;
        if (!result_by_shape.length) {
            height_shape.value = '76px';
        } else {
            if (fold1.value) {
                height_shape.value = '56px';
            }
            if (fold2.value && !fold1.value) {
                height_shape.value = 'calc(100% - 76px)';
            }
        }
    }

    if (!valid_result_by_shape.value && !valid_result_by_content.value) {
        height_shape.value = '76px';
    }
    source_by_shape.notify(0, 0, 0, Number.MAX_VALUE);
    source_by_content.notify(0, 0, 0, Number.MAX_VALUE);
}

function menu_unmount(e: KeyboardEvent) {
    if (e.code === 'Escape') close();
}

function close() {
    document.removeEventListener('keydown', menu_unmount);
    chartMenu.value = false;
}

function toggle1() {
    fold1.value = !fold1.value;
    update();
}

function toggle2() {
    fold2.value = !fold2.value;
    update();
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
    if (t === Navi.CHANGE_TYPE || t === Navi.SEARCHING || Navi.TEXT_SELECTION_CHANGE) update();
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

import SvgIcon from '@/components/common/SvgIcon.vue';
import down_icon from "@/assets/icons/svg/down.svg"
</script>
<template>
    <div class="result-wrap">
        <div class="result-by-name" :style="{ height: height_shape }">
            <div class="tips">
                <div class="font-wrap" v-if="props.keywords">
                    <div class="font">{{ t('system.title_includes') }}</div>
                    <div class="keywords">“{{ props.keywords }}</div>
                    <div class="end">”</div>
                    <div class="shrink" @click.stop="toggle1" v-if="valid_result_by_shape">
                        <SvgIcon :icon="down_icon"
                                  :style="{ transform: fold1 ? 'rotate(-90deg)' : 'rotate(0deg)' }"/>
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
                          @unhovershape="unHovershape" @scrolltoview="shapeScrollToContentView" @rename="rename"
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
                        <SvgIcon :icon="down_icon"
                                  :style="{ transform: fold2 ? 'rotate(-90deg)' : 'rotate(0deg)' }"/>
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