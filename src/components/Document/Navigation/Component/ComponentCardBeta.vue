<script setup lang="ts">
import {h, nextTick, onMounted, onUnmounted, ref, shallowRef} from 'vue';
import comsMap from '@/components/Document/Content/comsmap';
import {GroupShape, GroupShapeView, SymbolShape, SymbolUnionShape} from "@kcdesign/data";
import {renderSymbolPreview as r} from "@kcdesign/data";
import {Context} from '@/context';
import {Selection} from '@/context/selection';
import {clear_scroll_target, is_circular_ref2, is_state} from '@/utils/symbol';
import {debounce} from "lodash";
import Tooltip from '@/components/common/Tooltip.vue';

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
const render_item = shallowRef<GroupShape>(props.data);
const tip_name = ref('');

function gen_view_box() {
    const frame = render_item.value.frame;
    return `-8 -8 ${frame.width + 16} ${frame.height + 16}`;
}

function render() {
    return r(h, render_item.value as any, comsMap);
}

function selection_watcher(t: number) {
    if (t === Selection.CHANGE_SHAPE || t === Selection.CHANGE_PAGE) {
        check_selected_status();
    }
}

function check_selected_status() {
    selected.value = props.context.selection.isSelectedShape(props.data.id);
}

function _shape_watcher() {
    check_render_item();
    update_name();
}

function check_render_item() {
    if (!(props.data instanceof SymbolUnionShape)) {
        return;
    }

    render_item.value = (props.data?.childs[0] as GroupShape) || props.data;
    props.data.unwatch(shape_watcher);
    render_item.value.watch(shape_watcher);
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
        if (props.isAttri) {
            danger_check();
        }

        check_selected_status();
        props.context.selection.watch(selection_watcher);
        props.data.watch(shape_watcher);
        check_render_item();
    } else {
        props.context.selection.unwatch(selection_watcher);
        props.data.unwatch(shape_watcher);
        render_item.value.unwatch(shape_watcher);
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
            preview_container.value?.scrollIntoView();
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
    const sym = props.context.data.symbolsMgr.getSync(props.data.id);
    if (!sym) return;
    const is_circular = is_circular_ref2(sym, symbolref.refId);
    if (is_circular) danger.value = true;
}

function update_name() {
    tip_name.value = '';
    if (is_state(props.data)) {
        const sym = props.context.data.symbolsMgr.getSync(props.data.parent!.id);
        tip_name.value = sym?.name || props.data.name;
    } else {
        tip_name.value = props.data.name;
    }
}

onMounted(() => {
    check_render_required();
    is_need_scroll_to_view();
    update_name();
})
onUnmounted(() => {
    io.disconnect();
    props.context.selection.unwatch(selection_watcher);
    props.data.unwatch(shape_watcher);
})
</script>
<template>
    <div class="compo-preview-container" ref="preview_container">
        <Tooltip :content="tip_name" v-if="render_preview">
            <div>
                <svg v-if="render_preview" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" width="96px"
                    height="96px" :viewBox='gen_view_box()' overflow="hidden" class="render-wrap">
                    <render></render>
                </svg>
                <div :class="{ status: true, selected, danger }"></div>
            </div>
        </Tooltip>
    </div>
</template>
<style scoped lang="scss">
.compo-preview-container {
    width: 104px;
    height: 104px;
    background-color: #EBEBEB;
    border-radius: 4px;
    // border: 2px solid var(--grey-dark);
    box-sizing: border-box;
    position: relative;

    .render-wrap {
        margin-top: 2px;
        margin-left: 2px;
    }

    .status {
        border-radius: 4px;
        background-color: transparent;
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
    }

    .selected {
        // box-shadow: 0 0 3px 0 #1878F5;
        border: 1px solid #7F58F9;
    }

    .danger {
        // border: 2px solid #F56C6C;
        background-color: rgba(245, 108, 108, 0.3);
    }
}
</style>