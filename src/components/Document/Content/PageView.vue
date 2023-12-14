<script setup lang="ts">
import { Matrix, Page, DViewCtx, ShapeType } from '@kcdesign/data';
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { Tool } from '@/context/tool';
import { h, onMounted, onUnmounted, ref, watch } from 'vue';
import { v4 } from "uuid";
import ShapeTitles from './ShapeTitles.vue';
import ComponentTitleContainer from './ComponentTitleContainer.vue';
import { debounce } from 'lodash';
import { RenderCtx } from './common';
import { PageDom } from './vdom/page';
import { initComsMap } from './vdom/comsmap';
import comsMap from './comsmap';
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
const width = ref<number>(100);
const height = ref<number>(100);

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
    width.value = Math.ceil(Math.max(100, props.data.frame.width)), height.value = Math.ceil(Math.max(100, props.data.frame.height));
    if (width.value % 2) width.value++;
    if (height.value % 2) height.value++;
}

let dom = props.context.getPageDom(props.data);

const stopWatchPage = watch(() => props.data, (value, old) => {
    old.unwatch(page_watcher);
    old.__collect.unwatch(collect);
    value.watch(page_watcher);
    value.__collect.watch(collect);
    pageViewRegister(true);
    page_watcher();

    if (dom) {
        dom.ctx.stopLoop();
        dom.dom.unbind();
    }
    dom = props.context.getPageDom(props.data);
    if (pagesvg.value) {
        dom.dom.bind(pagesvg.value);
        dom.dom.render();
        dom.ctx.loop(window.requestAnimationFrame);
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
        dom.dom.bind(pagesvg.value);
        dom.dom.render();
        dom.ctx.loop(window.requestAnimationFrame);
    }
})

onUnmounted(() => {
    dom.ctx.stopLoop();
    dom.dom.unbind();
})

function render() {
    const prop: any = {
        version: "1.1",
        xmlns: "http://www.w3.org/2000/svg",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
        preserveAspectRatio: "xMinYMin meet",
        overflow: "visible"
    }
    prop.viewBox = `0 0 ${width.value} ${height.value}`;
    prop.reflush = reflush.value !== 0 ? reflush.value : undefined;
    prop.style = { transform: matrixWithFrame.toString() };
    prop['data-area'] = rootId.value;
    prop.width = width.value;
    prop.height = height.value;
    const childs = [];
    const datachilds = props.data.childs;
    for (let i = 0, len = datachilds.length; i < len; i++) {
        const c = datachilds[i];
        const com = comsMap.get(c.type) ?? comsMap.get(ShapeType.Rectangle);
        const node = h(com, { data: c, key: c.id, renderCtx });
        childs.push(node);
    }
    return h('svg', prop, childs)
}

</script>

<template>
    <svg ref="pagesvg" :style="{ transform: matrixWithFrame.toString() }" :data-area="rootId" :reflush="reflush"></svg>
    <!-- <render></render> -->
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