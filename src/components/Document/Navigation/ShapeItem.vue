/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

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
import { computed, InputHTMLAttributes, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { Shape, ShapeType, ShapeView } from '@kcaitech/vextra-core';
import { Context } from "@/context";
import { get_name } from "@/utils/shapelist";
import { Tool } from "@/context/tool";
import { useI18n } from 'vue-i18n';
import { is_state } from "@/utils/symbol";
import { onUpdated } from "vue";
import { Selection } from "@/context/selection";
import { is_component_class } from "@/utils/listview";
import Abbr from "@/components/common/Abbr.vue";
import { debounce } from "lodash";
import { shutdown_menu } from "@/utils/mouse";
import { Navi } from "@/context/navigate";
import SvgIcon from "@/components/common/SvgIcon.vue";
import lock_open_icon from '@/assets/icons/svg/lock-open.svg';
import lock_lock_icon from '@/assets/icons/svg/lock-lock.svg';
import eye_open_icon from '@/assets/icons/svg/eye-open.svg';
import eye_closed_icon from '@/assets/icons/svg/eye-closed.svg';
import locate_icon from '@/assets/icons/svg/locate.svg';
import triangle_down_icon from '@/assets/icons/svg/triangle-down.svg';
import masked_by_icon from "@/assets/icons/svg/masked-by.svg";

export interface ItemData {
    id: string
    shape: () => Shape // 作用function，防止vue对shape内部数据进行proxy
    view: () => ShapeView
    selected: boolean
    expand: boolean
    level: number
    context: Context
}

type Props = {
    data: ItemData;
}

interface Emits {
    (e: "toggleexpand", shape: ShapeView): void;

    (e: "selectshape", shape: ShapeView, isCtrl: boolean, shift: boolean): void;

    (e: "hovershape", shape: ShapeView): void;

    (e: "unhovershape"): void;

    (e: "set-lock", shape: ShapeView): void;

    (e: "set-visible", shape: ShapeView): void;

    (e: "rename", name: string, shape: ShapeView, event?: KeyboardEvent): void;

    (e: "scrolltoview", shape: ShapeView): void;

    (e: "item-mousedown", event: MouseEvent, shape: ShapeView): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const lock_status = ref<number>(0);
const visible_status = ref<number>(1);
const is_tool_visible = ref<boolean>()
const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement | null>(null)
const esc = ref<boolean>(false)
const ph_width = computed(() => (props.data.level - 1) * 18);
let showTriangle = ref<boolean>(false);
const watchedShapes = new Map();
const shapeItem = ref<HTMLDivElement | null>(null);
const t = useI18n().t;
const symbol_c = computed<boolean>(() => {
    return is_component_class(props.data.view());
})
const abbr_view = ref<number>(0);
const maskView = ref<boolean>(!!props.data.view().masked);

function toggleExpand(e: Event) {
    if (!showTriangle.value) return;
    e.stopPropagation();
    emits("toggleexpand", props.data.view());
}

const toggleContainer = (e: MouseEvent) => {
    e.stopPropagation();
    props.data.context.navi.set_phase('');
    emits('scrolltoview', props.data.view());
}
const fitToggleContainer = (e: MouseEvent) => {
    e.stopPropagation();
    props.data.context.navi.set_phase(props.data.view().id);
    emits('scrolltoview', props.data.view());
}

function hoverShape(e: MouseEvent) {
    if (e.buttons !== 0) return;
    emits("hovershape", props.data.view());
    is_tool_visible.value = true;
}

function unHoverShape(e: MouseEvent) {
    is_tool_visible.value = false;
    if (e.buttons !== 0) return;
    e.stopPropagation();
    emits("unhovershape");
}

const setLock = (e: MouseEvent) => {
    e.stopPropagation();
    emits('set-lock', props.data.view())
}
const setVisible = (e: MouseEvent) => {
    e.stopPropagation();
    emits('set-visible', props.data.view());
}
const onRename = () => {
    if (is_state(props.data.view())
        || props.data.context.readonly
        || props.data.context.tool.isLabel
    ) {
        return;
    }
    isInput.value = true
    nextTick(() => {
        if (!nameInput.value) return;
        (nameInput.value as HTMLInputElement).value = props.data.view().name.trim();
        nameInput.value.focus();
        nameInput.value.select();
        nameInput.value?.addEventListener('blur', stopInput);
        nameInput.value?.addEventListener('keydown', keySaveInput);
    })
    document.addEventListener('click', onInputBlur);
}
const onChangeName = (e: Event) => {
    const value = (e.target as InputHTMLAttributes).value
    if (esc.value) {
        return;
    }
    if (value.length === 0 || value.length > 40 || value.trim().length === 0) {
        return
    }
    emits('rename', value, props.data.view());
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
                (nameInput.value).blur();
            }
            document.removeEventListener('click', onInputBlur);
            clearTimeout(timer);
        }, 10)
    }
}
const selectedChild = () => {
    let parent = props.data.view().parent
    let child
    while (parent) {
        if (parent.type === ShapeType.Page) {
            break;
        }
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
    shutdown_menu(e, props.data.context);
    if (e.button === 0) {
        const shape = props.data.view();
        const { ctrlKey, metaKey, shiftKey } = e;
        const selected = props.data.context.selection.selectedShapes;
        if (selected.length > 1) {
            for (let i = 0, l = selected.length; i < l; i++) {
                if (selected[i].id === shape.id && !(e.ctrlKey || e.metaKey)) {
                    return;
                }
            }
        }
        emits("selectshape", shape, ctrlKey || metaKey, shiftKey);
        selectedChild();
    } else if (e.button === 2) {
        emits('item-mousedown', e, props.data.view())
        selectedChild();
    }
}

function mouseup(e: MouseEvent) {
    if (e.button !== 0) return;
    if (props.data.context.selection.selectedShapes.length < 2) {
        return;
    }
    if (props.data.context.navi.is_item_dragging || e.metaKey || e.shiftKey || e.ctrlKey) {
        return;
    }
    emits("selectshape", props.data.view(), false, false);
    selectedChild();
}

const isLabel = ref(props.data.context.tool.isLabel);
const tool_watcher = (t?: number) => {
    if (t === Tool.LABEL_CHANGE) {
        isLabel.value = props.data.context.tool.isLabel;
    }
}

function is_group() {
    return [ShapeType.Artboard, ShapeType.Group, ShapeType.Symbol].includes(props.data.view().type);
}

function _updateAbbrView() {
    abbr_view.value++;
}

const update_abbr_view = debounce(_updateAbbrView, 800);

function parentWatcher(...args: any[]) {
    if (args.includes('mask-env-change')) updater(...args)
}

let parent = props.data.view().parent;
parent && parent.watch(parentWatcher);

function updater(...args: any[]) {
    if (args.includes('mask-env-change')) {
        props.data.context.nextTick(props.data.context.selection.selectedPage!, () => {
            maskView.value = !!props.data.view().masked;
            if (props.data.view().parent?.id !== parent?.id) {
                parent?.unwatch(parentWatcher);
                parent = props.data.view().parent;
                parent?.watch(parentWatcher);
            }
        })
        return;
    }
    if (args.includes('mask') || args.includes('fills') || args.includes('autoLayout')) return _updateAbbrView();
    if (args.includes('size') || args.includes('points')) return update_abbr_view();

    const shape = props.data.view();

    const data = shape.data;

    const children = data.naviChilds || (data as any).childs || shape.naviChilds || [];
    showTriangle.value = children.length > 0 && shape.type !== ShapeType.Table;

    update_lock_status(shape);
    update_visible_status(shape);
}

function update_lock_status(shape: ShapeView) {
    function p_lock_status() {
        let p = shape.parent;
        while (p && p.type !== ShapeType.Page) {
            if (p.isLocked) return 2;
            p = p.parent;
        }
        return 0;
    }
    lock_status.value = shape.isLocked ? 1 : p_lock_status();
}

function update_visible_status(shape: ShapeView) {
    function p_visible_status() {
        let p = shape.parent;
        while (p && p.type !== ShapeType.Page) {
            if (!p.isVisible) return 2;
            p = p.parent;
        }
        return 0;
    }
    visible_status.value = !shape.isVisible ? 1 : p_visible_status();
}

let oldShape: ShapeView | undefined;
const stop = watch(() => props.data, () => {
    oldShape && oldShape.unwatch(updater);
    oldShape = props.data.view();
    oldShape.watch(updater);
    watchShapes();
}, { immediate: true })

function watchShapes() {
    const needWatchShapes = new Map();
    let shape = props.data.view();
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
        needWatchShapes.set(p.id, p);
        p = p.parent;
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) {
            return;
        }
        v.unwatch(updater);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) {
            return;
        }
        v.watch(updater);
        watchedShapes.set(k, v);
    })
}

const topAngle = ref(false);
const bottomAngle = ref(false);
const current_node_radius = () => {
    if (shapeItem.value) {
        const isSelect = shapeItem.value.classList.contains('selected') || shapeItem.value.classList.contains('selectedChild');
        const previous = shapeItem.value.previousElementSibling;
        const next = shapeItem.value.nextElementSibling;
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
const hovered = ref(false);
let page = props.data.context.selection.selectedPage!;
page.watch(pageWatcher);

function pageWatcher(...args: any[]) {
    if (args.includes('mask-env-change')) updater(...args);
}

const selectedWatcher = (t?: any) => {
    if (t === Selection.CHANGE_SHAPE_HOVER) {
        getHovered();
    } else if (t === Selection.CHANGE_PAGE) {
        page.unwatch(pageWatcher);
        page = props.data.context.selection.selectedPage!;
        page.watch(pageWatcher);
    }
}
const getHovered = () => {
    const shape = props.data.view();
    const hoverShape = props.data.context.selection.hoveredShape;
    hovered.value = Boolean(hoverShape && shape.id === hoverShape.id);
}
const navi_watcher = (t: number) => {
    if (t === Navi.LIST_FOLD) {
        if (!showTriangle.value || !props.data.expand) {
            return;
        }
        emits("toggleexpand", props.data.view());
    } else if (t === Navi.RENAME) {
        if (props.data.selected) {
            if (props.data.context.selection.selectedShapes.length === 1) {
                onRename();
            }
        }
    }
}
onUpdated(() => {
    nextTick(current_node_radius);
    getHovered();
})
onMounted(() => {
    updater();
    props.data.context.tool.watch(tool_watcher);
    props.data.context.selection.watch(selectedWatcher);
    props.data.context.navi.watch(navi_watcher);
})
onUnmounted(() => {
    props.data.context.tool.unwatch(tool_watcher);
    oldShape && oldShape.unwatch(updater);
    props.data.context.selection.unwatch(selectedWatcher);
    props.data.context.navi.unwatch(navi_watcher);
    stop();
    parent?.unwatch(parentWatcher);
    page.unwatch(pageWatcher);
})
</script>

<template>
    <div ref="shapeItem" :class="{
        container: true,
        selected: props.data.selected,
        selectedChild: selectedChild(),
        component: symbol_c,
        hovered: hovered && !props.data.selected,
        firstAngle: topAngle, lastAngle: bottomAngle
    }" @mousemove="hoverShape" @mouseleave="unHoverShape" @mousedown="mousedown" @mouseup="mouseup">
        <!-- 缩进 -->
        <div class="ph" :style="{ width: `${ph_width}px` }" />
        <!-- 开合 -->
        <div :class="{ 'is-group': is_group(), triangle: showTriangle, slot: !showTriangle }"
            @mousedown.stop="toggleExpand" @mouseup.stop>
            <SvgIcon v-if="showTriangle" :icon="triangle_down_icon" :id="props.data.expand ? 'down' : 'right'"
                :style="{ transform: props.data.expand ? 'rotate(0deg)' : 'rotate(-90deg)' }" />
        </div>
        <!-- icon -->
        <SvgIcon v-if="maskView" class="zero-symbol" :icon="masked_by_icon"
            style="width: 12px; height: 12px;margin-right: 3px" />
        <div class="container-svg zero-symbol" @dblclick="fitToggleContainer"
            :style="{ opacity: visible_status ? 0.4 : 1 }">
            <Abbr :view="abbr_view" :shape="data.view()" :theme="symbol_c ? '#7f58f9' : '#595959'" />
        </div>
        <!-- 内容描述 -->
        <div class="text" :style="{ display: isInput ? 'none' : '' }">
            <div class="txt" :style="{ opacity: !visible_status ? 1 : .4 }" @dblclick="onRename">{{
                get_name(props.data.view(), t('compos.dlt')) }}</div>
            <div class="tool_icon" @mousedown.stop
                :style="{ visibility: `${is_tool_visible ? 'visible' : 'hidden'}`, width: `${is_tool_visible ? 66 + 'px' : lock_status || visible_status ? 66 + 'px' : 0}` }">
                <div class="tool_lock tool" @click="toggleContainer" @dblclick="fitToggleContainer">
                    <SvgIcon class="svg-open" :icon="locate_icon" />
                </div>
                <div class="tool_lock tool" :class="{ 'visible': lock_status }" @click="(e: MouseEvent) => setLock(e)"
                    v-if="!data.context.readonly && !isLabel">
                    <SvgIcon v-if="lock_status === 0" class="svg-open" :icon="lock_open_icon" />
                    <SvgIcon v-else-if="lock_status === 1" class="svg" :icon="lock_lock_icon" />
                    <div v-else-if="lock_status === 2" class="dot">●</div>
                </div>
                <div class="tool_eye tool" :class="{ 'visible': visible_status }"
                    @click="(e: MouseEvent) => setVisible(e)" v-if="!data.context.readonly && !isLabel">
                    <SvgIcon v-if="visible_status === 0" class="svg" :icon="eye_open_icon" />
                    <SvgIcon v-else-if="visible_status === 1" class="svg" :icon="eye_closed_icon" />
                    <div v-else-if="visible_status === 2" class="dot">●</div>
                </div>
            </div>
        </div>
        <input v-if="isInput" @change="onChangeName" @click.stop @mousedown.stop class="rename" type="text"
            ref="nameInput">
    </div>
</template>

<style scoped lang="scss">
// 这整个样式表决定定位和计算结果,不可以轻易修改
.container {
    display: flex;
    flex-flow: row;
    align-items: center;
    width: calc(100% - 6px);
    height: 32px;
    box-sizing: border-box;

    >.ph {
        height: 100%;
        flex-shrink: 0;
        flex-grow: 0;
    }

    >.triangle {
        box-sizing: border-box;
        padding-left: 6px;
        width: 18px;
        height: 100%;
        display: flex;
        margin-right: 3px;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        >svg {
            width: 12px;
            height: 12px;
        }
    }

    >.slot {
        width: 18px;
        margin-right: 3px;
        height: 100%;
    }

    >.container-svg {
        width: 14px;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 3px;
    }

    >.text {
        flex: 1;
        line-height: 30px;
        font-size: var(--font-default-fontsize);
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        display: flex;
        flex-flow: row;
        align-items: center;
        width: 100%;
        height: 30px;
        color: var(--left-navi-font-color);
        background-color: transparent;

        >.txt {
            width: 100%;
            height: 30px;
            line-height: 30px;
            font-size: 12px;
            color: #262626;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            padding-left: 2px;
        }

        >.tool_icon {
            display: flex;
            align-items: center;
            width: 66px;
            height: 100%;
            margin-left: 6px;

            >.tool {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                margin-right: 2px;
            }

            >.tool_lock {
                display: flex;
                align-items: center;
                color: #595959;

                .svg {
                    width: 13px;
                    height: 13px;
                    color: #595959;
                }

                .dot {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 6px;
                    width: 13px;
                    height: 13px;
                    color: #000;
                }

                .svg-open {
                    width: 13px;
                    height: 13px;
                    color: #595959;
                }
            }

            >.tool_eye {
                margin-right: 10px;

                .svg {
                    width: 13px;
                    height: 13px;
                    color: #595959;
                }

                .dot {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 6px;
                    width: 13px;
                    height: 13px;
                    color: #000;
                }

            }

            .visible {
                visibility: visible;
            }
        }
    }

    >.rename {
        flex: 1;
        height: 24px;
        width: 100%;
        font-size: var(--font-default-fontsize);
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding-left: 6px;
        margin-right: 6px;
        outline-style: none;
        border: none;
        border-radius: 2px;
    }
}

.container:hover {
    z-index: -1;
    border-radius: 8px;
    background-color: #efefef;
}

.selectedChild {
    z-index: 2;
    border-radius: 0 !important;
    background-color: rgba($color: #1878f5, $alpha: 0.08) !important;
}

.selected {
    z-index: 1;
    border-radius: 0 !important;
    background-color: rgba($color: #1878F5, $alpha: 0.2) !important;
}

.hovered {
    border-radius: var(--default-radius);
    background-color: #efefef;
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