<script setup lang="ts">
import { Matrix, Page, DViewCtx } from '@kcdesign/data';
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { Tool } from '@/context/tool';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { v4 } from "uuid";
import ShapeTitles from './ShapeTitles.vue';
import ComponentTitleContainer from './ComponentTitleContainer.vue';
import { debounce } from 'lodash';
import { RenderCtx } from './common';
import { PageDom } from './vdom/page';
import { initComsMap } from './vdom/comsmap';
interface Props {
    context: Context
    data: Page
    matrix: Matrix
}
const props = defineProps<Props>();
const matrixWithFrame = new Matrix();
const reflush = ref(0);
const rootId = ref<string>('pageview');
const show_t = ref<boolean>(true);
const pagesvg = ref<HTMLElement>();

function pageViewRegister(mount: boolean) {
    if (mount) {
        const id = (v4().split('-').at(-1)) || 'pageview';
        rootId.value = id;
    } else {
        rootId.value = 'pageview';
    }
    props.context.workspace.setPageViewId(rootId.value);
}
function _collect(t?: any) {
    if (typeof t === 'string' && t === 'collect') props.context.assist.collect();
}
const collect = debounce(_collect, 100);
function page_watcher() {
    matrixWithFrame.reset(props.matrix);
    matrixWithFrame.preTrans(props.data.frame.x, props.data.frame.y);
    reflush.value++;
}

function createVDom() {
    const domCtx = new DViewCtx();
    initComsMap(domCtx.comsMap);
    const dom: PageDom = new PageDom(domCtx, props);
    dom.update(props, true);
    props.context.vdom.set(props.data.id, dom);
    return dom;
}
let dom = createVDom();

const stopWatchPage = watch(() => props.data, (value, old) => {
    old.unwatch(page_watcher);
    old.__collect.unwatch(collect);
    value.watch(page_watcher);
    value.__collect.watch(collect);
    pageViewRegister(true);
    page_watcher();

    if (dom) {
        dom.unbind();
    }
    dom = props.context.vdom.get(props.data.id) || createVDom();
    if (pagesvg.value) {
        dom.bind(pagesvg.value);
        dom.render();
    }
})
const stop_watch_matrix = watch(() => props.matrix, page_watcher, { deep: true });
function tool_watcher(t?: number) {
    if (t === Tool.TITILE_VISIBLE) show_t.value = props.context.tool.isShowTitle;
}
onMounted(() => {
    props.data.watch(page_watcher);
    props.data.__collect.watch(collect);
    props.context.tool.watch(tool_watcher);
    pageViewRegister(true);
    props.context.selection.watch(selection_watcher);
})
onUnmounted(() => {
    props.data.unwatch(page_watcher);
    props.data.__collect.unwatch(collect);
    props.context.tool.unwatch(tool_watcher);
    pageViewRegister(false);
    stopWatchPage();
    stop_watch_matrix();
    props.context.selection.unwatch(selection_watcher);
})

const renderCtx = new RenderCtx();
function selection_watcher(...args: any[]) {
    if (args.includes(Selection.CHANGE_SHAPE)) {
        renderCtx.resetSelectShapePath(props.context.selection.selectedShapes[0]);
    }
}

onMounted(() => {
    if (pagesvg.value) {
        dom.bind(pagesvg.value);
        dom.render();
    }
})

onUnmounted(() => {
    dom.unbind();
})

</script>

<template>
    <svg ref="pagesvg" :style = "{ transform: matrixWithFrame.toString() }" :data-area = "rootId" :reflush="reflush"></svg>
    <ShapeTitles v-if="show_t" :context="props.context" :data="data" :matrix="matrixWithFrame.toArray()"></ShapeTitles>
    <ComponentTitleContainer :context="props.context" :data="data" :matrix="matrixWithFrame.toArray()">
    </ComponentTitleContainer>
</template>

<style scoped>
svg {
    position: absolute;
    transform-origin: top left;
}

.text {
    width: 600px;
    height: 600px;
    background-color: #fff;
}
</style>