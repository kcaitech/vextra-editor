<script setup lang="ts">
import { Context } from '@/context';
import { Preview } from '@/context/preview';
import { DViewCtx, Matrix, PageView, ShapeView, adapt2Shape } from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { initComsMap } from '../Document/Content/vdom/comsmap';
import { elpatch } from '../Document/Content/vdom/patch';
import { getFrameList } from '@/utils/preview';
import PageCard from "@/components/common/PageCard.vue";
import { adapt_page } from '@/utils/content';

const props = defineProps<{
    context: Context
    page: PageView
}>();
type PCard = InstanceType<typeof PageCard>
const width = ref<number>(0);
const height = ref<number>(0);
const container = ref<HTMLElement | SVGElement>();
const preview = ref<HTMLDivElement>();
const cur_shape = ref<ShapeView>();
const matrix = new Matrix();
const reflush = ref(0);
const listLength = ref(0);
const viewbox = ref<string>('0 0 0 0');
const curPage = ref(0);
const pageCard = ref<PCard>();
function render() {
    const shape = props.context.preview.selectedShape;
    if (!shape) return;
    if (!container.value) {
        return;
    }

    const ctx = new DViewCtx();
    initComsMap(ctx.comsMap);

    const data = shape instanceof ShapeView ? adapt2Shape(shape) : shape;

    const __Construct = ctx.comsMap.get(data.type);
    if (!__Construct) {
        console.error('unknown type');
        return;
    }

    const __view = new __Construct(ctx, { data })
    const __el = (__view as any).renderStatic();
    __el.el = container.value;

    elpatch(__el, undefined);
}
function page_watcher() {
    const shape = props.context.preview.selectedShape;
    const page = props.context.preview.selectedPage;
    cur_shape.value = shape;
    if (!shape || !page) return;
    const frameList = getFrameList(page);
    listLength.value = frameList.length;
    const index = frameList.findIndex(item => item.id === shape.id);
    curPage.value = index + 1;
    const frame = shape.boundingBox();
    width.value = frame.width;
    height.value = frame.height;
    viewbox.value = `0 0 ${frame.width} ${frame.height}`;
    render();
    initMatrix();
    reflush.value++;
}

const togglePage = (p: number) => {
    const shape = props.context.preview.selectedShape;
    const page = props.context.preview.selectedPage;
    if (!shape || !page) return;
    cur_shape.value = shape;
    const frameList = getFrameList(page);
    let index = frameList.findIndex(item => item.id === shape.id);
    if (index === -1) return;
    index += p;
    if (index < 0 || index > (frameList.length - 1)) return;
    props.context.preview.selectShape(frameList[index]);
}

function watchShape() { // 监听相关shape的变化
    const shape = props.context.preview.selectedShape;
    cur_shape.value = shape;
    if (shape) {
        shape.unwatch(page_watcher);
        shape.watch(page_watcher);
    }
}

const previewWatcher = (t: number) => {
    if (t === Preview.CHANGE_PAGE) {
        page_watcher();
        watchShape();
    }
    if (t === Preview.CHANGE_SHAPE) {
        page_watcher();
        watchShape();
    }
}
const initMatrix = () => {
    const m = new Matrix(adapt_page(props.context, true));
    matrix.reset(m);
    nextTick(() => {
        if(pageCard.value && pageCard.value.pageSvg) {
            pageCard.value.pageSvg.style['transform'] = matrix.toString();
        }
    })
    
}
onMounted(() => {
    watchShape();
    page_watcher();
    props.context.preview.watch(previewWatcher);
})
onUnmounted(() => {
    cur_shape.value?.unwatch(page_watcher);
    props.context.preview.unwatch(previewWatcher);
})
</script>

<template>
    <div class="preview_container" ref="preview">
        <PageCard ref="pageCard" v-if="cur_shape" background-color="transparent" :view-box="viewbox"
            :shapes="[cur_shape]" :width="width" :height="height"></PageCard>
        <!-- <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :width="width"
            :height="height" :viewBox='viewbox' overflow="hidden">
            <g ref="container"></g>
        </svg> -->
        <div class="toggle" v-if="listLength">
            <div class="last" @click="togglePage(-1)">
                <svg-icon icon-class="left-arrow"></svg-icon>
            </div>
            <div class="page">{{ curPage }} / {{ listLength }}</div>
            <div class="next" @click="togglePage(1)">
                <svg-icon icon-class="right-arrow"></svg-icon>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.preview_container {
    position: relative;
    background-color: black;

    .toggle {
        position: absolute;
        left: 50%;
        bottom: 10px;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        height: 24px;
        box-sizing: border-box;
        padding: 9px;
        border-radius: 4px;
        background-color: rgba(0, 0, 0, 0.9);
        color: hsla(0, 0%, 100%, 0.9);

        .last {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            cursor: pointer;
        }

        .page {
            line-height: 16px;
            font-size: 11px;
            margin: 0 8px;
            opacity: 0.7;
        }

        .next {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            cursor: pointer;
        }

        svg {
            width: 14px;
            height: 14px;
        }
    }
}
</style>