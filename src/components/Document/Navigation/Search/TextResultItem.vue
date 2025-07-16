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
import { ref, nextTick, InputHTMLAttributes, watch, onUnmounted, onMounted, onUpdated } from "vue";
import { Shape, ShapeType, ShapeView, SymbolUnionShape, TextShape, TextShapeView } from '@kcdesign/data';
import { Context } from "@/context";
import { Navi } from "@/context/navigate";
import { is_parent_locked, is_parent_unvisible, is_valid_data } from "@/utils/shapelist";
import { is_state } from "@/utils/symbol";
import { is_component_class } from "@/utils/listview";
import { Selection } from "@/context/selection";
// import { Perm } from "@/context/workspace";
import { Tool } from "@/context/tool";

export interface TItemData {
    id: string
    shape: ShapeView
    focus: boolean
    context: Context
    keywords: string
}

interface Props {
    data: TItemData
}

interface Slice {
    content: string
    isKeywords: boolean
}

const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement | null>(null)
const props = defineProps<Props>();
const esc = ref<boolean>(false);
const tips = ref<Slice[]>([]);
const title = ref<string>('');
const lock_status = ref<number>(0) // 1：锁 2：继承锁 -1：不锁
const visible_status = ref<number>(1) // 1：隐藏 2： 继承隐藏 -1：显示
const is_tool_visible = ref<boolean>()
// const isread = ref(false)
// const canComment = ref(false)
// const isEdit = ref(false)
const isEdit = !props.data.context.readonly;
const emit = defineEmits<{
    (e: "toggleexpand", shape: ShapeView): void;
    (e: "selectshape", shape: ShapeView, ctrl: boolean, shift: boolean): void;
    (e: "hovershape", shape: ShapeView): void;
    (e: "unhovershape"): void;
    (e: "isLock", isLock: boolean, shape: ShapeView): void;
    (e: "isRead", isRead: boolean, shape: ShapeView): void;
    (e: "rename", name: string, shape: ShapeView, event?: KeyboardEvent): void;
    (e: "scrolltoview", shape: ShapeView): void;
    (e: "item-mousedown", event: MouseEvent, shape: ShapeView): void;
}>();

function updater(t?: any) {
    if (t === 'frame') return;
    lock_status.value = props.data.shape.isLocked ? 1 : 0;
    visible_status.value = props.data.shape.isVisible ? 0 : 1;
    // if (is_parent_locked(props.data.shape) && !lock_status.value) {
    //     lock_status.value = 2;
    // }
    // if (is_parent_unvisible(props.data.shape) && !visible_status.value) {
    //     visible_status.value = 2;
    // }
}

const watchedShapes = new Map();

function watchShapes() {
    const needWatchShapes = new Map();
    let shape = props.data.shape;
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
        needWatchShapes.set(p.id, p);
        p = p.parent;
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(updater);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(updater);
        watchedShapes.set(k, v);
    })
}

const stop = watch(() => props.data.shape, (value, old) => {
    old && old.unwatch(updater);
    value.watch(updater);
    watchShapes();
}, { immediate: true })

const toggleContainer = (e: MouseEvent) => {
    e.stopPropagation()
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    emit('scrolltoview', props.data.shape);
}

function selectShape(e: MouseEvent) {
    e.stopPropagation();
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    const { ctrlKey, metaKey, shiftKey } = e;
    emit("selectshape", props.data.shape, (ctrlKey || metaKey), shiftKey);
}

function hoverShape(e: MouseEvent) {
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    const working = !props.data.context.workspace.isTranslating;
    if (working) {
        is_tool_visible.value = true;
    }
}

function unHoverShape(e: MouseEvent) {
    e.stopPropagation();
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    is_tool_visible.value = false
}

const setLock = (e: MouseEvent) => {
    e.stopPropagation();
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    const shape = props.data.shape;
    const editor = props.data.context.editor4Shape(shape);
    editor.toggleLock();
}
const setVisible = (e: MouseEvent) => {
    e.stopPropagation();
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    const shape = props.data.shape;
    const editor = props.data.context.editor4Shape(shape);
    editor.toggleVisible();
}
const onRename = () => {
    if (is_state(props.data.shape)
        || !isEdit
        || props.data.context.tool.isLabel
        || props.data.shape.isVirtualShape) return;
    isInput.value = true
    nextTick(() => {
        if (nameInput.value) {
            (nameInput.value as HTMLInputElement).value = props.data.shape.name.trim();
            nameInput.value.focus();
            nameInput.value.select();
            nameInput.value?.addEventListener('blur', stopInput);
            nameInput.value?.addEventListener('keydown', keySaveInput);
        }
    })
    document.addEventListener('click', onInputBlur)
}
const onChangeName = (e: Event) => {
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    const value = (e.target as InputHTMLAttributes).value
    if (esc.value) return
    if (value.length === 0 || value.length > 40 || value.trim().length === 0) return
    emit('rename', value, props.data.shape);
}

const stopInput = () => {
    esc.value = false
    isInput.value = false
}
const keySaveInput = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        esc.value = false
        isInput.value = false
    } else if (e.code === 'Escape') {
        esc.value = true
        isInput.value = false
    }
}
const onInputBlur = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.rename')) {
        var timer = setTimeout(() => {
            if (nameInput.value) {
                (nameInput.value).blur()
            }
            clearTimeout(timer)
            document.removeEventListener('click', onInputBlur);
        }, 30)
    }
}
const selectedChild = () => {
    let parent = props.data.shape.parent
    let child
    while (parent) {
        if (parent.type === 'page') break
        child = props.data.context.selection.isSelectedShape(parent)
        parent = parent.parent
        if (child) {
            return child
        }
    }
    return child
}
const mousedown = (e: MouseEvent) => {
    e.stopPropagation();
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    if(e.button === 2) { 
        emit('item-mousedown', e, props.data.shape)
    }
    selectedChild();
}

import layer_image_icon from '@/assets/icons/svg/layer-image.svg';
import layer_arrow_icon from '@/assets/icons/svg/layer-arrow.svg'
import layer_artboard_icon from '@/assets/icons/svg/layer-artboard.svg';
import layer_contact_icon from '@/assets/icons/svg/layer-contact.svg';
import layer_cutout_icon from '@/assets/icons/svg/layer-cutout.svg';
import layer_group_icon from '@/assets/icons/svg/layer-group.svg';
import layer_line_icon from '@/assets/icons/svg/layer-line.svg';
import layer_oval_icon from '@/assets/icons/svg/layer-oval.svg';
import layer_rectangle_icon from '@/assets/icons/svg/layer-rectangle.svg';
import layer_symbol_ref_icon from '@/assets/icons/svg/layer-symbol-ref.svg';
import layer_symbol_union_icon from '@/assets/icons/svg/layer-symbol-union.svg';
import layer_symbol_icon from '@/assets/icons/svg/layer-symbol.svg';
import layer_table_icon from '@/assets/icons/svg/layer-table.svg';
import layer_text_icon from '@/assets/icons/svg/layer-text.svg';
import SvgIcon from "@/components/common/SvgIcon.vue";


const icons: {[key: string]: string} = {}
icons[ShapeType.Text] = layer_text_icon;
icons[ShapeType.Rectangle] = layer_rectangle_icon;
icons[ShapeType.Oval] = layer_oval_icon;
icons[ShapeType.Line] = layer_line_icon;
icons[ShapeType.Group] = layer_group_icon;
icons[ShapeType.Path] = layer_arrow_icon;
icons[ShapeType.Symbol] = layer_symbol_icon;
icons[ShapeType.SymbolRef] = layer_symbol_ref_icon;
icons[ShapeType.SymbolUnion] = layer_symbol_union_icon;
icons[ShapeType.Symbol] = layer_symbol_icon;
icons[ShapeType.Table] = layer_table_icon;
icons[ShapeType.Artboard] = layer_artboard_icon;
icons[ShapeType.Contact] = layer_contact_icon;
icons[ShapeType.Cutout] = layer_cutout_icon;

function icon_class() {
    const shape = props.data.shape;
    if (shape.type === ShapeType.Symbol) {
        if (shape instanceof SymbolUnionShape) {
            return layer_symbol_union_icon;
        } else {
            return layer_symbol_icon
        }
    } else {
        return icons[shape.type];
    }
}

const isLable = ref(props.data.context.tool.isLabel);
const tool_watcher = (t?: number) => {
    if (t === Tool.LABEL_CHANGE) {
        isLable.value = props.data.context.tool.isLabel;
    }
}


function update_slice() {
    tips.value = [];
    const len = (props.data.shape as TextShapeView).text.length;
    const src = (props.data.shape as TextShapeView).text.getText(0, len).replaceAll('\n', '');
    const word = props.data.keywords;
    const is_acc = props.data.context.navi.accurate ? 'mg' : 'img';
    const reg = new RegExp(`${word}`, is_acc);
    const index = src.search(reg);
    if (index < 8) {
        tips.value.push({
            isKeywords: false,
            content: src.slice(0, index)
        }, {
            isKeywords: true,
            content: src.slice(index, index + word.length),
        }, {
            isKeywords: false,
            content: src.slice(index + word.length),
        }
        )
    } else {
        tips.value.push({
            isKeywords: false,
            content: '...' + src.slice(index - 7, index)
        }, {
            isKeywords: true,
            content: src.slice(index, index + word.length),
        }, {
            isKeywords: false,
            content: src.slice(index + word.length),
        }
        )
    }
    title.value = src;
}


const topAngle = ref(false);
const bottomAngle = ref(false);
const resultItem = ref<HTMLDivElement | null>(null);
const current_node_radius = () => {
    if (resultItem.value) {
        const isSelect = resultItem.value.classList.contains('selected') || resultItem.value.classList.contains('selectedChild');
        const previous = resultItem.value.previousElementSibling;
        const next = resultItem.value.nextElementSibling;
        const p_selected = previous && previous.classList.contains('selected') || previous && previous.classList.contains('selectedChild');
        const n_selected = next && next.classList.contains('selected') || next && next.classList.contains('selectedChild');
        if (!p_selected && isSelect) {
            topAngle.value = true;
        } else if (p_selected) {
            topAngle.value = false;
        }
        if (!n_selected && isSelect) {
            bottomAngle.value = true;
        } else if (n_selected) {
            bottomAngle.value = false;
        }
    }
}
function is_component() {
    return is_component_class(props.data.shape);
}

function navi_watcher(t: number) {
    if (t === Navi.SEARCHING) update_slice();
}
const hovered = ref(false);
const selectedWatcher = (t?: any) => {
    if (t === Selection.CHANGE_SHAPE_HOVER) {
        getHovered();
    }
}
const getHovered = () => {
    const shape = props.data.shape;
    const hoverShape = props.data.context.selection.hoveredShape;
    if (hoverShape && shape.id === hoverShape.id) {
        hovered.value = true;
    } else {
        hovered.value = false;
    }
}
onUpdated(() => {
    nextTick(current_node_radius);
    getHovered();
})

onMounted(() => {
    updater();
    update_slice();
    // handlePerm();
    props.data.context.tool.watch(tool_watcher);
    props.data.context.navi.watch(navi_watcher);
    props.data.context.selection.watch(selectedWatcher);
})
onUnmounted(() => {
    props.data.context.tool.unwatch(tool_watcher);
    props.data.context.navi.unwatch(navi_watcher);
    props.data.context.selection.unwatch(selectedWatcher);
    stop()
})

import lock_open_icon from '@/assets/icons/svg/lock-open.svg';
import lock_lock_icon from '@/assets/icons/svg/lock-lock.svg';
import eye_open_icon from '@/assets/icons/svg/eye-open.svg';
import eye_closed_icon from '@/assets/icons/svg/eye-closed.svg';
import locate_icon from '@/assets/icons/svg/locate.svg';
</script>

<template>
    <div class="contain" :class="{ component: is_component() }" @click="selectShape" @mousemove="hoverShape"
        @mouseleave="unHoverShape" @mousedown="mousedown">
        <div class="item-warp">
            <div class="container-svg" @dblclick="toggleContainer"
                :class="{ color: !is_component(), stroke: data.shape.type === ShapeType.Oval && is_component(), no_stroke: !is_component() && data.shape.type === ShapeType.Oval }">
                <SvgIcon class="svg" :icon="icon_class()"/>
            </div>
            <div class="text" :class="{ container: true, selected: false }"
                :style="{ opacity: !visible_status ? 1 : .3, display: isInput ? 'none' : '' }">
                <div class="txt" @dblclick="onRename">
                    {{ props.data.shape.name }}
                </div>
                <div class="tool_icon"
                    :style="{ visibility: `${is_tool_visible ? 'visible' : 'hidden'}`, width: `${is_tool_visible ? 66 + 'px' : lock_status || visible_status ? 66 + 'px' : 0}` }">
                    <div class="tool_lock tool" :class="{ 'visible': lock_status }"
                        @click="(e: MouseEvent) => setLock(e)" v-if="isEdit && !isLable">
                        <SvgIcon v-if="lock_status === 0" class="svg-open" :icon="lock_open_icon"/>
                        <SvgIcon v-else-if="lock_status === 1" class="svg" :icon="lock_lock_icon"/>
                        <div class="dot" v-else-if="lock_status === 2"></div>
                    </div>
                    <div class="tool_lock tool" @click="toggleContainer">
                        <SvgIcon class="svg-open" :icon="locate_icon"/>
                    </div>
                    <div class="tool_eye tool" :class="{ 'visible': visible_status }"
                        @click="(e: MouseEvent) => setVisible(e)" v-if="isEdit && !isLable">
                        <SvgIcon v-if="visible_status === 0" class="svg" :icon="eye_open_icon"/>
                        <SvgIcon v-else-if="visible_status === 1" class="svg" :icon="eye_closed_icon"/>
                        <div class="dot" v-else-if="visible_status === 2"></div>
                    </div>
                </div>
            </div>
            <input v-if="isInput" @change="onChangeName" @click.stop class="rename" type="text" ref="nameInput">
        </div>
        <div class="tips-wrap" :title="title" @click="toggleContainer" :class="{ 'tips-focus': props.data.focus }">
            <span v-for="(item, index) in tips" :key="index" :class="{ active: item.isKeywords }">{{ item.content }}</span>
        </div>
    </div>
</template>

<style scoped lang="scss">
.contain {
    width: calc(100% - 6px);
}

.container {
    display: flex;
    flex-flow: row;
    align-items: center;
    width: calc(100% - 6px);
    height: 32px;
}

.item-warp {
    display: flex;
    flex-flow: row;
    align-items: center;
    width: 100%;
    height: 32px;

    >.container-svg {
        display: flex;
        width: 18px;
        height: 100%;
        justify-content: center;
        align-items: center;
        margin-left: 10px;

        .svg {
            width: 13px;
            height: 13px;
        }
    }

    >.text {
        flex: 1;
        line-height: 30px;
        font-size: var(--font-default-fontsize);
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding-left: 2px;
        background-color: transparent;

        .txt {
            width: 100%;
            height: 30px;
            line-height: 30px;
            font-size: var(--font-default-fontsize);
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            padding-left: 2px;
            color: #262626;
        }

        >.tool_icon {
            display: flex;
            align-items: center;
            width: 66px;
            height: 100%;

            .tool_lock {
                .svg {
                    width: 13px;
                    height: 13px;
                    color: #595959;
                }

                .svg-open {
                    width: 13px;
                    height: 13px;
                    color: #595959;
                }

                .dot {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: var(--theme-color);
                }
            }

            .tool {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                margin-right: 2px;
            }

            .tool_eye {
                margin-right: 10px;

                .svg {
                    width: 13px;
                    height: 13px;
                    color: #595959;
                }

                .dot {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: var(--theme-color);
                }
            }

            .visible {
                visibility: visible;
            }
        }
    }

    .rename {
        flex: 1;
        height: 20px;
        width: 100%;
        font-size: var(--font-default-fontsize);
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding-left: 6px;
        margin-right: 6px;
        outline-style: none;
        border: 1px solid var(--left-navi-bg-color);
    }

}

.tips-wrap {
    height: 32px;
    width: 100%;
    font-size: var(--font-default-fontsize);
    line-height: 32px;
    white-space: nowrap;
    padding-left: 13px;
    border-radius: 6px;
    background-color: rgba($color: #1878f5, $alpha: 0.1);
    box-sizing: border-box;
    overflow: hidden;
    transition: 0.1s;

    .active {
        font-weight: bold;
    }
}

.color {
    fill: #595959;
}

.stroke {
    stroke: #7F58F9;
}

.no_stroke {
    stroke: #595959;
}

.tips-wrap:hover {
    background-color: rgba($color: #1878f5, $alpha: 0.18);
}

.tips-focus {
    background-color: rgba($color: #1878f5, $alpha: 0.4) !important;
}

.hovered {
    border-radius: var(--default-radius);
    background-color: #efefef;
}

.selectedChild {
    z-index: 2;
    background-color: rgba($color: #1878f5, $alpha: 0.08);
}

.selected {
    z-index: 1;
    background-color: rgba($color: #1878F5, $alpha: 0.2);
}

.component {
    color: var(--component-color);

    &>.text>.txt,
    &>.text>.tool_icon {
        color: var(--component-color);
    }
}

.firstAngle {
    border-top-left-radius: 8px !important;
    border-top-right-radius: 8px !important;
}

.lastAngle {
    border-bottom-left-radius: 8px !important;
    border-bottom-right-radius: 8px !important;
}
</style>