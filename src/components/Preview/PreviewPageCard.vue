<script setup lang="ts">
import {
    adapt2Shape, BasicArray, Border, Fill, Page, PageView, Shadow, Shape, ShapeFrame, ShapeType,
    ShapeView, Style
} from "@kcdesign/data";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { DomCtx } from "@/components/Document/Content/vdom/domctx";
import { initComsMap } from "@/components/Document/Content/vdom/comsmap";
import { PageDom } from "@/components/Document/Content/vdom/page";
import { Context } from "@/context";
import { Preview } from "@/context/preview";

interface Props {
    shapes: ShapeView[] | Shape[];
    data: PageView;
    backgroundColor: string;
    viewBox: string;
    width: number;
    height: number;
    context: Context
}

const props = defineProps<Props>();

const pageSvg = ref<SVGSVGElement>();

let pageDom: { dom: PageDom, ctx: DomCtx } | undefined;

function assemble() {
    if (pageDom) {
        pageDom?.dom.unbind();
        pageDom?.dom.destory();
        pageDom = undefined;
    }

    let shapes: Shape[] = props.shapes as Shape[];

    if (!shapes.length) {
        return;
    }

    if (shapes[0] instanceof ShapeView) {
        shapes = shapes.map((s) => adapt2Shape(s as any));
    }

    const borders = new BasicArray<Border>();
    const fills = new BasicArray<Fill>();
    const style = new Style(borders, fills, new BasicArray<Shadow>());

    const page = new Page(
        new BasicArray<number>(),
        'assemble-page',
        'assemble-page',
        ShapeType.Page,
        new ShapeFrame(0, 0, 0, 0),
        style,
        new BasicArray<Shape>(...shapes)
    );

    page.isVisible = true;

    const domCtx = new DomCtx();
    initComsMap(domCtx.comsMap);

    const dom: PageDom = new PageDom(domCtx, { data: page });

    pageDom = { dom, ctx: domCtx };

    if (pageSvg.value) {
        pageDom.dom.bind(pageSvg.value);
        pageDom.dom.render();
    }
}

function disassemble() {
    pageDom?.dom.unbind();
    pageDom?.dom.destory();
}

watch(() => props.shapes, () => {
    props.shapes.length && assemble();
})
const page_watcher = (...args: any[]) => {
    if(args.includes('frame')) return;
    assemble();
}

function selection_watcher(...args: any[]) {

}
onMounted(() => {
    props.data.watch(page_watcher);
    assemble();
    props.context.preview.watch(selection_watcher);
});
onUnmounted(() => {
    props.data.unwatch(page_watcher);
    disassemble();
    props.context.preview.unwatch(selection_watcher);
});

defineExpose({ pageSvg });
</script>

<template>
    <svg ref="pageSvg" :width="width" :height="height" :viewBox="viewBox"
        :style="{ 'background-color': backgroundColor }"></svg>
</template>

<style scoped lang="scss">
svg {
    transform-origin: top left;
}
</style>