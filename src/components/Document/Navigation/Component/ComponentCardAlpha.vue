/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { h, nextTick, onMounted, onUnmounted, ref, shallowRef, toRaw } from 'vue';
import { GroupShape, ShapeType, SymbolShape, SymbolUnionShape } from "@kcdesign/data";
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { clear_scroll_target, is_circular_ref2, is_state } from '@/utils/symbol';
import { debounce } from "lodash";
import ShapeCard from "@/components/common/ShapeCard.vue";
import { Navi } from '@/context/navigate';

interface Props {
    data: GroupShape
    context: Context
    container: Element | null
    isAttri: boolean
}

const props = defineProps<Props>();
const selected = ref<boolean>(false);
const render_preview = ref<boolean>(false);
const preview_container = ref<Element>();
const danger = ref<boolean>(false);
let render_item = toRaw<GroupShape>(props.data);
const name = ref<string>('');

function selection_watcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE || t === Selection.CHANGE_PAGE) check_selected_status();
    else if (t === Selection.PAGE_RENAME) {
        const curr_module = props.context.navi.current_navi_module;
        if (curr_module === "Comps") get_name();
    }
}

function check_selected_status() {
    selected.value = is_select();
}

function is_select() {
    const selected = props.context.selection.selectedShapes;

    if (!selected.length) {
        return false;
    }

    const cur = props.data;

    for (let i = 0, l = selected.length; i < l; i++) {
        const s = selected[i];

        if (s instanceof SymbolUnionShape) {
            if (s.childs[0]?.id === cur.id) {
                return true;
            }
        } else if (s instanceof SymbolShape) {
            const p = s.parent;
            if (p instanceof SymbolUnionShape) {
                if (p.childs[0]?.id === cur.id) {
                    return true;
                }
            }
        }
    }

    return false;
}

function check_render_item() {
    if (props.data.type !== ShapeType.SymbolUnion) return;
    render_item = (props.data?.childs[0] as GroupShape) || props.data;
    props.data.unwatch(shape_watcher);
    render_item.watch(shape_watcher);
}

function _shape_watcher() {
    check_render_item();
    get_name();
}

const shape_watcher = debounce(_shape_watcher, 1000);

const options = {
    root: props.container,
    rootMargin: '0px 0px 0px 0px',
    thresholds: 1,
}

function intersection(entries: any) {
    render_preview.value = Boolean(entries[0]?.isIntersecting);
    if (render_preview.value) {
        if (props.isAttri) danger_check();
        check_selected_status();
        props.context.selection.watch(selection_watcher);
        props.data.watch(shape_watcher);
        check_render_item();
    } else {
        props.context.selection.unwatch(selection_watcher);
        props.data.unwatch(shape_watcher);
        render_item.unwatch(shape_watcher);
    }
}

const io = new IntersectionObserver(intersection, options);

function check_render_required() {
    if (!(props.container && preview_container.value)) {
        render_preview.value = true;
        io.disconnect();
    } else {
        io.observe(preview_container.value);
    }
}

function is_need_scroll_to_view() {
    const need_scroll_into_view = props.context.component.is_need_into_view(props.data.id);
    if (need_scroll_into_view && preview_container.value) {
        nextTick(() => {
            preview_container.value && preview_container.value.scrollIntoView();
            const timer = setTimeout(() => {
                selected.value = true;
                clearTimeout(timer);
            }, 100)
        })
    }
    clear_scroll_target(props.context);
}

function danger_check() {
    const symbolref = props.context.selection.symbolrefshape;
    if (!symbolref) return;
    const sym = props.context.data.getSymbolSync(props.data.id);
    if (!sym) return;
    const is_circular = is_circular_ref2(sym, symbolref.refId);
    if (is_circular) danger.value = true;
}

function get_name() {
    if (is_state(props.data)) {
        const sym = props.context.data.getSymbolSync(props.data.parent!.id);
        name.value = sym?.name || props.data.name;
    } else {
        name.value = props.data.name;
    }
}

const navi_watch = (t: number) => {
    if (t === Navi.MODULE_CHANGE) {
        const curr_module = props.context.navi.current_navi_module;
        if (curr_module === "Comps") get_name();
    }
}

onMounted(() => {
    check_render_required();
    is_need_scroll_to_view();
    get_name();
    props.context.navi.watch(navi_watch);
})
onUnmounted(() => {
    io.disconnect();
    props.context.selection.unwatch(selection_watcher);
    props.context.navi.unwatch(navi_watch);
    props.data.unwatch(shape_watcher);
})
</script>
<template>
    <div class="compo-preview-container" ref="preview_container" :style="{ cursor: isAttri ? 'auto' : 'grab' }">
        <div class="card-wrap" v-if="render_preview">
            <ShapeCard :shape="render_item" class="render-wrap" :size="28"></ShapeCard>
            <div>{{ name }}</div>
        </div>
        <div :class="{ status: true, selected, danger }"></div>
    </div>
</template>
<style scoped lang="scss">
.compo-preview-container {
    width: 100%;
    height: 36px;
    position: relative;
    //cursor: grab;

    .card-wrap {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        padding: 4px 0;
        box-sizing: border-box;

        > .render-wrap {
            margin-left: 2px;
            background-color: var(--grey-light);
            // border: 1px solid var(--grey-dark);
            box-sizing: border-box;
            border-radius: 2px;
            flex-shrink: 0;
        }

        > div {
            margin-left: 4px;
            max-height: 100%;
            overflow: hidden;
            font-size: 12px;
            font-weight: 500;
            line-height: 14px;
            color: #000000;
        }
    }

    .status {
        position: absolute;
        border-radius: 4px;
        background-color: transparent;
        width: 100%;
        height: 100%;
        top: 0;
        box-sizing: border-box;
    }

    .selected {
        border: 1px solid #7F58F9;
        // box-shadow: 0 0 2px 0 #1878F5;
    }

    .danger {
        // border: 2px solid #F56C6C;
        background-color: rgba(245, 108, 108, 0.3);
    }
}
</style>