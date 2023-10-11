<script setup lang="ts">
import { h, onMounted, onUnmounted, ref } from 'vue';
import comsMap from '@/components/Document/Content/comsmap';
import { GroupShape } from "@kcdesign/data";
import { renderSymbolPreview as r } from "@kcdesign/data";
import { initCommonShape } from "@/components/Document/Content/common";
import { Context } from '@/context';
import { Selection } from '@/context/selection';
interface Props {
    data: GroupShape
    context: Context
    container: Element | null
}
const props = defineProps<Props>();
const common = initCommonShape(props);
const selected = ref<boolean>(false);
const render_preview = ref<boolean>(false);
const preview_container = ref<Element>();
function gen_view_box() {
    const frame = props.data.frame;
    return `0 0 ${frame.width} ${frame.height}`;
}
function render() {
    return r(h, props.data, comsMap, common.reflush);
}
function selection_watcher(t: number) {
    if (t === Selection.CHANGE_SHAPE || t === Selection.CHANGE_PAGE) check_selected_status();
}
function check_selected_status() {
    selected.value = props.context.selection.isSelectedShape(props.data);
}
const options = {
    root: props.container,
    rootMargin: '0px 0px 0px 0px',
    thresholds: 1,
}
function intersection(entries: any) {
    render_preview.value = Boolean(entries[0]?.isIntersecting);
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
onMounted(() => {
    check_selected_status();
    check_render_required();
    props.context.selection.watch(selection_watcher);
    console.log('beta card mounted');
})
onUnmounted(() => {
    io.disconnect();
    props.context.selection.unwatch(selection_watcher);
})
</script>
<template>
    <div class="compo-preview-container" ref="preview_container">
        <svg v-if="render_preview" version="1.1" xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xhtml="http://www.w3.org/1999/xhtml"
            preserveAspectRatio="xMinYMin meet" width="96px" height="96px" :viewBox='gen_view_box()' overflow="visible"
            class="render-wrap">
            <render></render>
        </svg>
        <div :class="{ status: true, selected }"></div>
    </div>
</template>
<style scoped lang="scss">
.compo-preview-container {
    width: 100px;
    height: 100px;
    background-color: var(--grey-light);
    border-radius: 4px;
    border: 2px solid var(--grey-dark);
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
        left: -2px;
        top: -2px;
    }

    .selected {
        border: 2px solid var(--component-color);
    }
}
</style>