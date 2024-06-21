<script setup lang="ts">
import {
    adapt2Shape, BasicArray, Border, Fill, Page, Shadow, Shape, ShapeSize, ShapeType,
    ShapeView, Style,
    TransformRaw
} from "@kcdesign/data";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { DomCtx } from "@/components/Document/Content/vdom/domctx";
import { initComsMap } from "@/components/Document/Content/vdom/comsmap";
import { PageDom } from "@/components/Document/Content/vdom/page";

interface Props {
    shapes: ShapeView[] | Shape[];

    backgroundColor: string;
    viewBox: string;
    width: number;
    height: number;
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
        new TransformRaw(),
        new ShapeSize(),
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

onMounted(assemble);
onUnmounted(disassemble);

defineExpose({ pageSvg });
</script>

<template>
    <svg ref="pageSvg" :width="width" :height="height" :viewBox="viewBox"
         :style="{ 'background-color': backgroundColor }"></svg>
</template>

<style scoped lang="scss">
svg {
    position: absolute;
    top: 10000px;
    left: 10000px;
    transform-origin: top left;
}
</style>