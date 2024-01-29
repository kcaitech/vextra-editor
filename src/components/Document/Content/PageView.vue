<script setup lang="ts">
import { Matrix, PageView, adapt2Shape } from '@kcdesign/data';
import { Context } from '@/context';
import { Tool } from '@/context/tool';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { v4 } from "uuid";
import ShapeTitles from './ShapeTitles.vue';
import ComponentTitleContainer from './ComponentTitleContainer.vue';
import { debounce } from 'lodash';
import ShapeCutout from '../Cutout/ShapeCutout.vue';
import { Selection } from '@/context/selection';
interface Props {
    context: Context
    data: PageView
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
const viewbox = ref<string>('0 0 100 100');
const WIDE = 1.12;

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
const collect = debounce(_collect, 240);
function page_watcher() {
    matrixWithFrame.reset(props.matrix);
    matrixWithFrame.preTrans(props.data.frame.x, props.data.frame.y);

    width.value = props.data.frame.width;
    height.value = props.data.frame.height;

    modifySize();

    reflush.value++;
}
function modifySize() {
    const scale = matrixWithFrame.m00;
    const real_width = scale * width.value;
    const real_height = scale * height.value;

    const max_width = props.context.workspace.root.width * WIDE;
    const max_height = props.context.workspace.root.height * WIDE;
    let vx = 0;
    let vy = 0;

    if (real_width > max_width) {
        const max_left = -(props.context.workspace.root.width * ((WIDE - 1) / 2));
        const real_left = matrixWithFrame.m02;
        const delta_vx = max_left - real_left;
        if (delta_vx > 0) {
            vx = delta_vx;
            matrixWithFrame.preTrans(delta_vx, 0);
        }

        width.value = max_width / scale;
    }

    if (real_height > max_height) {
        // todo
    }

    width.value = Math.ceil(Math.max(100, width.value));
    if (width.value % 2) {
        width.value++;
    }
    height.value = Math.ceil(Math.max(100, height.value));
    if (height.value % 2) {
        height.value++;
    }

    viewbox.value = `${vx} ${vy} ${width.value} ${height.value}`;
}

const stopWatchPage = watch(() => props.data, (value, old) => {
    old.unwatch(page_watcher);
    old.data.__collect.unwatch(collect);
    value.watch(page_watcher);
    value.data.__collect.watch(collect);
    pageViewRegister(true);
    page_watcher();

    if (old) {
        const dom = props.context.getPageDom(old.data);
        dom.ctx.stopLoop();
        dom.ctx.updateFocusShape(undefined);
        dom.dom.unbind();
    }
    const dom = props.context.getPageDom(value.data);
    if (dom && pagesvg.value) {
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
    props.data.data.__collect.watch(collect);
    props.context.tool.watch(tool_watcher);
    pageViewRegister(true);
    props.context.selection.watch(selection_watcher);
    page_watcher();
})
onUnmounted(() => {
    props.data.unwatch(page_watcher);
    props.data.data.__collect.unwatch(collect);
    props.context.tool.unwatch(tool_watcher);
    pageViewRegister(false);
    stopWatchPage();
    stop_watch_matrix();
    props.context.selection.unwatch(selection_watcher);
})

function selection_watcher(...args: any[]) {
    if (args.includes(Selection.CHANGE_SHAPE)) {
        const selectedShapes = props.context.selection.selectedShapes;
        const focus = selectedShapes.length === 1 ? selectedShapes[0] : undefined;
        const dom = props.context.getPageDom(props.data);
        dom.ctx.updateFocusShape(focus ? adapt2Shape(focus) : undefined);
    }
}

onMounted(() => {
    console.log('page mounted');

    const dom = props.context.getPageDom(props.data);
    if (dom && pagesvg.value) {
        dom.dom.bind(pagesvg.value);
        dom.dom.render();
        dom.ctx.loop(window.requestAnimationFrame);
    }
})

onUnmounted(() => {
    const dom = props.context.getPageDom(props.data);
    if (dom) {
        dom.ctx.stopLoop();
        dom.ctx.updateFocusShape(undefined);
        dom.dom.unbind();
    }
})

</script>

<template>
    <svg ref="pagesvg" :style="{ transform: matrixWithFrame.toString() }" :data-area="rootId" :reflush="reflush"
        :width="width" :height="height" :viewBox="viewbox"></svg>
    <ShapeCutout :context="props.context" :data="data" :matrix="props.matrix" :transform="matrixWithFrame.toArray()">
    </ShapeCutout>
    <ShapeTitles v-if="show_t" :context="props.context" :data="data" :matrix="matrixWithFrame.toArray()"></ShapeTitles>
    <ComponentTitleContainer :context="props.context" :data="data" :matrix="matrixWithFrame.toArray()">
    </ComponentTitleContainer>
</template>

<style scoped>
svg {
    position: absolute;
    transform-origin: top left;
    background-color: rgba(0, 255, 0, 0.1);
}

.text {
    width: 600px;
    height: 600px;
    background-color: #fff;
}
</style>