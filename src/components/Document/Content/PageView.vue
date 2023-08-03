<script setup lang="ts">
import { Matrix, Page, ShapeType, Shape } from '@kcdesign/data';
import { Context } from '@/context';
import { Tool } from '@/context/tool';
import { onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import comsMap from './comsmap';
import { v4 as uuid } from "uuid";
import ShapeTitles from './ShapeTitles.vue';
import { PageXY } from '@/context/selection';
const props = defineProps<{
    context: Context,
    data: Page,
    matrix: number[],
}>();
const matrixWithFrame = new Matrix();
const reflush = ref(0);
const rootId = ref<string>('pageview');
const show_t = ref<boolean>(true);
const tp = ref<PageXY>({ x: 0, y: 0 });
let renderItems: Shape[] = []; // 渲染数据，里面除了真实的data数据之外，还有工具对象
const watcher = () => {
    reflush.value++;
}
function pageViewRegister(mount: boolean) {
    if (mount) {
        const id = (uuid().split('-').at(-1)) || 'pageview';
        rootId.value = id;
    } else {
        rootId.value = 'pageview';
    }
    props.context.workspace.setPageViewId(rootId.value);
}
watchEffect(() => {
    // get_abbre_pos();
    matrixWithFrame.reset(props.matrix)
    matrixWithFrame.preTrans(props.data.frame.x, props.data.frame.y)
})
const stopWatchPage = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
    pageViewRegister(true);
    renderItems = props.data.childs;
})
function tool_watcher(t?: number) {
    if (t === Tool.TITILE_VISIBLE) {
        const v = props.context.tool.isShowTitle;
        show_t.value = v;
    }
}
function get_abbre_pos() {
    const matrix = new Matrix(props.context.workspace.matrix.inverse);
    const root = props.context.workspace.root;
    const x = 500;
    const y = 500;
    tp.value = matrix.computeCoord(x, y);
}
onMounted(() => {
    props.data.watch(watcher);
    props.context.tool.watch(tool_watcher);
    pageViewRegister(true);
    renderItems = props.data.childs;
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    props.context.tool.unwatch(tool_watcher);
    pageViewRegister(false);
    stopWatchPage();
    renderItems = [];
})
</script>

<template>
    <!-- <svg overflow="visible" version="1.1" class="t" xmlns:xhtml="http://www.w3.org/1999/xhtml"
        preserveAspectRatio="xMinYMin meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        style="position: absolute;" :viewBox='"0 0 " + data.frame.width + " " + data.frame.height'
        :style="{ transform: matrixWithFrame.toString() }" :width="data.frame.width">
        <g id="pageview">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="t"
                xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
                :viewBox='"0 0 " + data.frame.width + " " + data.frame.height' :width="data.frame.width"
                :height="data.frame.height" :style="{ transform: matrixWithFrame.toString() }" overflow="visible"
                :reflush="reflush !== 0 ? reflush : undefined" :data-area="rootId">
                <component v-for="c in renderItems" :key="c.id"
                    :is="comsMap.get(c.type) ?? comsMap.get(ShapeType.Rectangle)" :data="c" />
            </svg>
        </g>
        <g :transform="`translate(${tp.x}, ${tp.y}) scale(0.18, 0.18)`">
            <use xlink:href="#pageview"></use>
        </g>
    </svg> -->
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
        :viewBox='"0 0 " + data.frame.width + " " + data.frame.height' :width="data.frame.width" :height="data.frame.height"
        :style="{ transform: matrixWithFrame.toString() }" overflow="visible" :reflush="reflush !== 0 ? reflush : undefined"
        :data-area="rootId">
        <component v-for="c in renderItems" :key="c.id" :is="comsMap.get(c.type) ?? comsMap.get(ShapeType.Rectangle)"
            :data="c" />
    </svg>
    <ShapeTitles v-if="show_t" :context="props.context" :data="data" :matrix="matrixWithFrame.toArray()"></ShapeTitles>
</template>

<style scoped>
svg {
    position: absolute;
    transform-origin: top left;
}
</style>