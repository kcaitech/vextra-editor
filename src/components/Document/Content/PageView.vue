<script setup lang="ts">
import { Matrix, PageView, adapt2Shape } from '@kcdesign/data';
import { Context } from '@/context';
import { Tool } from '@/context/tool';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { v4 } from "uuid";
import ShapeTitles from './ShapeTitles.vue';
import { debounce } from 'lodash';
import ShapeCutout from '../Cutout/ShapeCutout.vue';
import { Selection } from '@/context/selection';

interface Props {
    context: Context
    params: {
        data: PageView
        matrix: Matrix
        noCutout?: boolean,
        closeLoading?: () => void
    }
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
const cutoutVisible = ref<boolean>(true);

// const emit = defineEmits<{
//     (e: 'closeLoading'): void;
// }>();

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

function _collect(t?: any) {
    // 调整到每次执行transform之前进行收集
    // if (typeof t === 'string' && t === 'collect') {
    //     props.context.assist.collect();
    // }
}

const collect = debounce(_collect, 240);

function page_watcher() {
    matrixWithFrame.reset(props.params.matrix);
    matrixWithFrame.preTrans(props.params.data.frame.x, props.params.data.frame.y);

    width.value = props.params.data.frame.width;
    height.value = props.params.data.frame.height;

    modifySize();

    reflush.value++;
}

function modifySize() {
    width.value = Math.ceil(Math.max(100, width.value));
    if (width.value % 2) {
        width.value++;
    }
    height.value = Math.ceil(Math.max(100, height.value));
    if (height.value % 2) {
        height.value++;
    }

    viewbox.value = `0 0 ${width.value} ${height.value}`;
}

const stopWatchPage = watch(() => props.params.data, (value, old) => {
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
const stop_watch_matrix = watch(() => props.params.matrix, page_watcher, { deep: true });

function tool_watcher(t?: number) {
    if (t === Tool.TITLE_VISIBLE) {
        show_t.value = props.context.tool.isShowTitle;
    } else if (t === Tool.CUTOUT_VISIBLE) {
        cutoutVisible.value = props.context.tool.isCutoutVisible;
    }
}

onMounted(() => {
    props.params.data.watch(page_watcher);
    props.params.data.data.__collect.watch(collect);
    props.context.tool.watch(tool_watcher);
    pageViewRegister(true);
    props.context.selection.watch(selection_watcher);
    page_watcher();
})
onUnmounted(() => {
    props.params.data.unwatch(page_watcher);
    props.params.data.data.__collect.unwatch(collect);
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
        const dom = props.context.getPageDom(props.params.data);
        dom.ctx.updateFocusShape(focus ? adapt2Shape(focus) : undefined);
    }
}

onMounted(() => {
    const dom = props.context.getPageDom(props.params.data);
    if (dom && pagesvg.value) {
        dom.dom.bind(pagesvg.value);
        dom.dom.render();
        dom.ctx.loop(window.requestAnimationFrame);
        props.context.nextTick(props.params.data, () => {
            // emit('closeLoading');
            if (props.params.closeLoading) props.params.closeLoading();
        })
    }
})

onUnmounted(() => {
    const dom = props.context.getPageDom(props.params.data);
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
    <ShapeCutout v-if="show_c" :context="props.context" :data="params.data" :matrix="props.params.matrix"
                 :transform="matrixWithFrame.toArray()" />
    <ShapeTitles v-if="show_t" :context="props.context" :data="params.data" />

</template>

<style scoped>
svg {
    position: absolute;
    transform-origin: top left;
}
</style>