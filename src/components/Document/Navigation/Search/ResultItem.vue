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
import { ref, nextTick, InputHTMLAttributes, onMounted, onUnmounted, watch, onUpdated, computed } from "vue";
import { ShapeType, ShapeView, SymbolUnionShape } from '@kcdesign/data';
import { Context } from "@/context";
import { Navi } from "@/context/navigate";
import { is_valid_data } from "@/utils/shapelist";
import { is_state } from "@/utils/symbol";
import { Selection } from "@/context/selection";
import Abbr from "@/components/common/Abbr.vue";
import { is_component_class } from "@/utils/listview";
import { Tool } from "@/context/tool";
import { debounce } from "lodash";

export interface ItemData {
    id: string
    shape: ShapeView
    selected: boolean
    context: Context
    keywords: string
}

interface Props {
    data: ItemData
}

interface Slice {
    content: string
    isKeywords: boolean
}

const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement | null>(null)
const props = defineProps<Props>();
const esc = ref<boolean>(false);
const name_display = ref<Slice[]>([{ content: props.data.shape.name, isKeywords: false }]);
const reflush = ref<number>(0);
const lock_status = ref<number>(0) // 1：锁 2：继承锁 -1：不锁
const visible_status = ref<number>(1) // 1：隐藏 2： 继承隐藏 -1：显示
const is_tool_visible = ref<boolean>()
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
const watchedShapes = new Map();
const symbol_c = computed<boolean>(() => {
    return is_component_class(props.data.shape);
})
const abbr_view = ref<number>(0);
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
const update_icon = ref(0);
function updater(...args: any[]) {
    if (args.includes('frame') || args.includes('points')) {
        update_abbr_view();
        return;
    }
    if(args.includes('fills')) {
        update_icon.value++;
    }
    lock_status.value = props.data.shape.isLocked ? 1 : 0;
    visible_status.value = props.data.shape.isVisible ? 0 : 1;
}

const toggleContainer = (e: MouseEvent) => {
    e.stopPropagation()
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    emit('scrolltoview', props.data.shape);
}

function selectShape(e: MouseEvent) {
    e.stopPropagation();
    const { ctrlKey, metaKey, shiftKey } = e;
    if (!is_valid_data(props.data.context, props.data.shape)) return;
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
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    e.stopPropagation();
    is_tool_visible.value = false
}

const onRename = () => {
    if (is_state(props.data.shape)
        || props.data.context.readonly
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
    document.addEventListener('click', onInputBlur);
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
        child = props.data.context.selection.isSelectedShape(parent.id)
        parent = parent.parent
        if (child) {
            return child
        }
    }
    return child
}
const isLable = ref(props.data.context.tool.isLabel);
const tool_watcher = (t?: number) => {
    if (t === Tool.LABEL_CHANGE) {
        isLable.value = props.data.context.tool.isLabel;
    }
}
const mousedown = (e: MouseEvent) => {
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    e.stopPropagation();
    if (e.button === 2) {
        emit('item-mousedown', e, props.data.shape)
    }
    selectedChild();
}

function _updateAbbrView() {
    abbr_view.value++;
}

const update_abbr_view = debounce(_updateAbbrView, 800);

function update_slice() {
    name_display.value = [];
    const src = props.data.shape.name;
    const word = props.data.keywords;
    const is_acc = props.data.context.navi.accurate ? 'mg' : 'img';
    const reg = new RegExp(`${word}`, is_acc);
    const index = src.search(reg);
    name_display.value.push({
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
    reflush.value++;
}

function navi_watcher(t: number) {
    if (t === Navi.SEARCHING) update_slice();
}

const setLock = (e: MouseEvent) => {
    e.stopPropagation();
    const shape = props.data.shape;
    const editor = props.data.context.editor4Shape(shape);
    editor.toggleLock();
}
const setVisible = (e: MouseEvent) => {
    e.stopPropagation();
    const shape = props.data.shape;
    const editor = props.data.context.editor4Shape(shape);
    editor.toggleVisible();
}

function icon_class() {
    const shape = props.data.shape;
    if (shape.type === ShapeType.Symbol) {
        if (shape instanceof SymbolUnionShape) {
            return 'layer-symbol-union';
        } else {
            return 'layer-component';
        }
    } else {
        return `layer-${shape.type}`;
    }
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
    props.data.context.navi.watch(navi_watcher);
    props.data.context.tool.watch(tool_watcher);
    props.data.context.selection.watch(selectedWatcher);
})
onUnmounted(() => {
    props.data.context.tool.unwatch(tool_watcher);
    props.data.context.navi.unwatch(navi_watcher);
    props.data.context.selection.unwatch(selectedWatcher);
    stop()
})


import SvgIcon from "@/components/common/SvgIcon.vue";
import lock_open_icon from '@/assets/icons/svg/lock-open.svg';
import lock_lock_icon from '@/assets/icons/svg/lock-lock.svg';
import eye_open_icon from '@/assets/icons/svg/eye-open.svg';
import eye_closed_icon from '@/assets/icons/svg/eye-closed.svg';
import locate_icon from '@/assets/icons/svg/locate.svg';


</script>

<template>
    <div ref="resultItem" class="contain"
        :class="{ container: true, component: is_component(), selected: props.data.selected, selectedChild: selectedChild(), hovered: hovered, firstAngle: topAngle, lastAngle: bottomAngle }"
        @click="selectShape" @mousemove="hoverShape" @mouseleave="unHoverShape" @mousedown="mousedown">
        <div class="container-svg" @dblclick="toggleContainer" :style="{ opacity: !visible_status ? 1 : .3 }">
            <Abbr :view="abbr_view" :shape="data.shape" :icon="update_icon" :theme="symbol_c ? '#7f58f9' : '#595959'"></Abbr>
        </div>
        <div class="text" :class="{ container: true, selected: false }"
            :style="{ opacity: !visible_status ? 1 : .3, display: isInput ? 'none' : '' }">
            <div class="txt" @dblclick="onRename">
                <span v-for="(item, index) in name_display" :key="index" :class="{ active: item.isKeywords }"
                    :reflush="reflush">{{item.content }}</span>
            </div>
            <div class="tool_icon"
                :style="{ visibility: `${is_tool_visible ? 'visible' : 'hidden'}`, width: `${is_tool_visible ? 66 + 'px' : lock_status || visible_status ? 66 + 'px' : 0}` }">
                <div class="tool_lock tool" :class="{ 'visible': lock_status }" @click="(e: MouseEvent) => setLock(e)"
                    v-if="!props.data.context.readonly && !isLable">
                    <SvgIcon v-if="lock_status === 0" class="svg-open" :icon="lock_open_icon"/>
                    <SvgIcon v-else-if="lock_status === 1" class="svg" :icon="lock_lock_icon"/>
                    <div class="dot" v-else-if="lock_status === 2"></div>
                </div>
                <div class="tool_lock tool" @click="toggleContainer">
                    <SvgIcon class="svg-open" :icon="locate_icon"/>
                </div>
                <div class="tool_eye tool" :class="{ 'visible': visible_status }"
                    @click="(e: MouseEvent) => setVisible(e)" v-if="!props.data.context.readonly && !isLable">
                    <SvgIcon v-if="visible_status === 0" class="svg" :icon="eye_open_icon"/>
                    <SvgIcon v-else-if="visible_status === 1" class="svg" :icon="eye_closed_icon"/>
                    <div class="dot" v-else-if="visible_status === 2"></div>
                </div>
            </div>
        </div>
        <input v-if="isInput" @change="onChangeName" @click.stop class="rename" type="text" ref="nameInput">
    </div>
</template>

<style scoped lang="scss">
div.container {
    display: flex;
    flex-flow: row;
    box-sizing: border-box;
    align-items: center;
    width: calc(100% - 6px);
    height: 32px;
}

.contain:hover {
    cursor: default;
    border-radius: 8px;
    background-color: #efefef;
}

div.container.selectedChild {
    z-index: 2;
    background-color: rgba($color: #1878f5, $alpha: 0.08);
}

div.container.selected {
    z-index: 1;
    background-color: rgba($color: #1878F5, $alpha: 0.2);
}

div.slot {
    width: 15px;
    min-width: 15px;
    height: 100%;
}

div.container-svg {
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

div.text {
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

        .active {
            font-weight: bold;
        }
    }
}

div .rename {
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

.tool {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-right: 2px;
}

.tool_icon {
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

.hovered {
    border-radius: var(--default-radius);
    background-color: #efefef;
}

.component {
    color: var(--component-color);
    fill: var(--component-color);

    &>.text>.txt,
    &>.text>.tool_icon {
        color: var(--component-color);
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

.firstAngle {
    border-top-left-radius: 8px !important;
    border-top-right-radius: 8px !important;
}

.lastAngle {
    border-bottom-left-radius: 8px !important;
    border-bottom-right-radius: 8px !important;
}
</style>