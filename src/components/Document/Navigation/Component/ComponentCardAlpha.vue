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
    const ret = r(h, props.data, comsMap, common.reflush);
    return ret;
}
function selection_watcher(t: number) {
    if (t === Selection.CHANGE_SHAPE || t === Selection.CHANGE_PAGE) check_selected_status();
}
function check_selected_status() {
    selected.value = props.context.selection.isSelectedShape(props.data);
}
const options = {
    root: props.context.component.component_container,
    rootMargin: '0px 0px 0px 0px',
    thresholds: 1,
}
function intersection(entries: any) {
    if (!render_preview.value && entries[0]?.isIntersecting) {
        // console.log('render alpha card', props.data.name);
        render_preview.value = true;
    }
}
const io = new IntersectionObserver(intersection, options);
function check_render_required() {
    if (!(props.context.component.component_container && preview_container.value)) {
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
    console.log('alpha card mounted');
})
onUnmounted(() => {
    io.disconnect();
    props.context.selection.unwatch(selection_watcher);
})
</script>
<template>
    <div class="compo-preview-container" ref="preview_container">
        <div class="card-wrap">
            <svg v-if="render_preview" version="1.1" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xhtml="http://www.w3.org/1999/xhtml"
                preserveAspectRatio="xMinYMin meet" width="36px" height="36px" :viewBox='gen_view_box()' overflow="visible"
                class="render-wrap">
                <render></render>
            </svg>
            <div>{{ props.data.name }}</div>
        </div>
        <div :class="{ status: true, selected }"></div>
    </div>
</template>
<style scoped lang="scss">
.compo-preview-container {
    width: 100%;
    height: 40px;
    position: relative;

    .card-wrap {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;

        >.render-wrap {
            margin-left: 2px;
            background-color: var(--grey-light);
            border: 1px solid var(--grey-dark);
            box-sizing: border-box;
            border-radius: 4px;
        }

        >div {
            margin-left: 8px;
            max-height: 100%;
            overflow: hidden;
        }
    }

    .status {
        position: absolute;
        border-radius: 4px;
        background-color: transparent;
        width: 100%;
        height: 100%;
        top: 0px;
        box-sizing: border-box;
    }

    .selected {
        border: 2px solid var(--component-color);
    }
}
</style>