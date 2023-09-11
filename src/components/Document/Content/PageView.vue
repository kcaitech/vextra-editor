<script setup lang="ts">
import { Matrix, Page, ShapeType, Shape } from '@kcdesign/data';
import { Context } from '@/context';
import { Tool } from '@/context/tool';
import { onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import comsMap from './comsmap';
import { v4 } from "uuid";
import ShapeTitles from './ShapeTitles.vue';
import { debounce } from 'lodash';
const props = defineProps<{
    context: Context,
    data: Page,
    matrix: number[],
}>();
const matrixWithFrame = new Matrix();
const reflush = ref(0);
const rootId = ref<string>('pageview');
const show_t = ref<boolean>(true);
const width = ref<number>(100);
const height = ref<number>(100);
let renderItems: Shape[] = []; // 渲染数据，里面除了真实的data数据之外，还有工具对象
const watcher = () => {
    reflush.value++;
}
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
const collect = debounce(_collect, 15);
watchEffect(() => {
    matrixWithFrame.reset(props.matrix);
    matrixWithFrame.preTrans(props.data.frame.x, props.data.frame.y);
    width.value = Math.ceil(Math.max(100, props.data.frame.width)), height.value = Math.ceil(Math.max(100, props.data.frame.height));
    if (width.value % 2) width.value++;
    if (height.value % 2) height.value++;
})
const stopWatchPage = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    old.__collect.unwatch(collect);
    value.watch(watcher);
    value.__collect.watch(collect);
    pageViewRegister(true);
    renderItems = props.data.childs;
})
function tool_watcher(t?: number) {
    if (t === Tool.TITILE_VISIBLE) {
        const v = props.context.tool.isShowTitle;
        show_t.value = v;
    }
}
onMounted(() => {
    props.data.watch(watcher);
    props.data.__collect.watch(collect);
    props.context.tool.watch(tool_watcher);
    pageViewRegister(true);
    renderItems = props.data.childs;
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    props.data.__collect.unwatch(collect);
    props.context.tool.unwatch(tool_watcher);
    pageViewRegister(false);
    stopWatchPage();
    renderItems = [];
})
</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :width="width + 'px'"
        :height="height + 'px'" :viewBox='"0 0 " + width + " " + height' overflow="visible"
        :reflush="reflush !== 0 ? reflush : undefined" :transform="matrixWithFrame.toString()" :data-area="rootId">
        <component :is="comsMap.get(c.type) ?? comsMap.get(ShapeType.Rectangle)" v-for="c in renderItems" :key="c.id"
            :data="c" :context="props.context" />
    </svg>
    <ShapeTitles v-if="show_t" :context="props.context" :data="data" :matrix="matrixWithFrame.toArray()"></ShapeTitles>
</template>

<style scoped>
svg {
    position: absolute;
    transform-origin: top left;
}
</style>