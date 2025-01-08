<script setup lang="ts">
import { Matrix, Page, PageView } from '@kcdesign/data';
import { Context } from '@/context';
import { Tool } from '@/context/tool';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { v4 } from "uuid";
import ShapeTitles from './ShapeTitles.vue';
import ShapeCutout from '../Cutout/ShapeCutout.vue';
import { Selection } from '@/context/selection';
import { PageDom } from './vdom/page';

interface Props {
    context: Context
    params: {
        data: PageView
        matrix: Matrix
        noCutout?: boolean,
        onRenderDone?: () => void,
        onContentVisible?: () => void,
        visibleRect?: { x: number, y: number, width: number, height: number }
    }
}

const props = defineProps<Props>();
const matrixWithFrame = new Matrix();
const matrixWithFrame_inverse = new Matrix();
const rootId = ref<string>('pageview');
const show_t = ref<boolean>(true);
const pagesvg = ref<HTMLElement>();
const width = ref<number>(100);
const height = ref<number>(100);
const viewbox = ref<string>('0 0 100 100');
const cutoutVisible = ref<boolean>(true);
const transform = ref<string>('');
const transformArr = ref<number[]>(new Matrix().toArray());
const pageReady = ref<boolean>(false);
const show_c = computed<boolean>(() => {
    return !props.params.noCutout && cutoutVisible.value;
})

function pageViewRegister(mount: boolean) {
    if (mount) {
        const temp = v4().split('-');
        rootId.value = temp[temp.length - 1] || 'pageview';
    } else {
        rootId.value = 'pageview';
    }
    props.context.workspace.setPageViewId(rootId.value);
}

function page_watcher() {
    matrixWithFrame.reset(props.params.matrix);
    const frame = props.params.data._p_frame;
    matrixWithFrame.preTrans(frame.x, frame.y);
    matrixWithFrame_inverse.reset(matrixWithFrame.inverse)

    width.value = frame.width;
    height.value = frame.height;

    width.value = Math.ceil(Math.max(100, width.value));
    if (width.value % 2) {
        width.value++;
    }
    height.value = Math.ceil(Math.max(100, height.value));
    if (height.value % 2) {
        height.value++;
    }

    const innerFrame = props.params.data.frame;

    viewbox.value = `${innerFrame.x} ${innerFrame.y} ${width.value} ${height.value}`;
    transform.value = matrixWithFrame.toString();
    transformArr.value = matrixWithFrame.toArray();
    updateVisibleRect();
}

function updateVisibleRect() {
    const rect = props.params.visibleRect;
    if (!rect) return;
    const lt = matrixWithFrame_inverse.computeCoord(rect);
    const rb = matrixWithFrame_inverse.computeCoord(rect.x + rect.width, rect.y + rect.height); // root坐标系
    const page = props.params.data as PageDom;
    const innerFrame = page.frame;
    page.updateVisibleRect({ x: lt.x + innerFrame.x, y: lt.y + innerFrame.y, width: rb.x - lt.x, height: rb.y - lt.y }, matrixWithFrame)
}

const stopWatchPage = watch(() => props.params.data, (value, old) => {
    old.unwatch(page_watcher);
    value.watch(page_watcher);
    pageViewRegister(true);
    page_watcher();

    // if (!loaded) return;

    if (removeRenderIdle) {
        removeRenderIdle.remove();
        removeRenderIdle = undefined;
    }
    if (old) {
        const dom = props.context.getPageDom(old.data);
        dom.ctx.stopLoop();
        dom.ctx.updateFocusShape(undefined);
        dom.dom.unbind();
    }
    prepareDom(value.data);
    updateVisibleRect();
})
const stop_watch_matrix = watch(() => props.params.matrix, page_watcher, { deep: true });
const stop_watch_visibleRect = watch(() => props.params.visibleRect, updateVisibleRect);

function tool_watcher(t: number) {
    if (t === Tool.TITLE_VISIBLE) {
        show_t.value = props.context.tool.isShowTitle;
    } else if (t === Tool.CUTOUT_VISIBLE) {
        cutoutVisible.value = props.context.tool.isCutoutVisible;
    }
}

function selection_watcher(...args: any[]) {
    if (args.includes(Selection.CHANGE_SHAPE)) {
        const selectedShapes = props.context.selection.selectedShapes;
        const focus = selectedShapes.length === 1 ? selectedShapes[0] : undefined;
        const dom = props.context.getPageDom(props.params.data);
        dom.ctx.updateFocusShape(focus);
    }
}

let removeRenderIdle: {
    remove: () => void;
} | undefined;
// let loaded: boolean = false; // 文档数据未加载完成前不进行页面的绘制
const prepareDom = (page: Page | PageView) => {
    // if (!loaded) return;

    pageReady.value = false;

    const dom = props.context.getPageDom(page);
    dom.ctx.loop(window.requestAnimationFrame);

    // clear pagesvg
    const svg = pagesvg.value!;
    const childs = Array.from(svg.childNodes);
    childs.forEach(c => svg.removeChild(c))

    removeRenderIdle = dom.dom.once("renderidle", () => {
        dom.dom.bind(svg);
        dom.dom.asyncRender();
        pageReady.value = true;
        removeRenderIdle = undefined;
        props.params.onRenderDone?.();
    })

    props.context.nextTick(props.params.data, () => {
        props.params.onContentVisible?.();
    })
}

onMounted(() => {
    props.params.data.watch(page_watcher);
    props.context.tool.watch(tool_watcher);
    pageViewRegister(true);
    props.context.selection.watch(selection_watcher);
    page_watcher();
    // props.context.setOnLoaded(() => {
    //     loaded = true;
        prepareDom(props.params.data);
    // })
})
onUnmounted(() => {
    props.params.data.unwatch(page_watcher);
    props.context.tool.unwatch(tool_watcher);
    pageViewRegister(false);
    stopWatchPage();
    stop_watch_matrix();
    stop_watch_visibleRect();
    props.context.selection.unwatch(selection_watcher);
    const dom = props.context.getPageDom(props.params.data);
    if (dom) {
        dom.ctx.stopLoop();
        dom.ctx.updateFocusShape(undefined);
        dom.dom.unbind();
    }
    if (removeRenderIdle) {
        removeRenderIdle.remove();
        removeRenderIdle = undefined;
    }
})
</script>
<template>
<svg ref="pagesvg" :style="{ transform }" :data-area="rootId"
     :width="width" :height="height" :viewBox="viewbox"/>
<ShapeCutout v-if="show_c && pageReady" :context="props.context" :data="params.data" :matrix="props.params.matrix"
             :transform="transformArr"/>
<ShapeTitles v-if="show_t && pageReady" :context="props.context" :data="params.data"/>
</template>
<style scoped>
svg {
    position: absolute;
    transform-origin: top left;
}
</style>