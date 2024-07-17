<script setup lang="ts">
import {
    adapt2Shape, BasicArray, Border, Fill, Page, PageView, Shadow, Shape, ShapeSize, ShapeType,
    ShapeView, Style,
    TransformRaw
} from "@kcdesign/data";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { DomCtx } from "@/components/Document/Content/vdom/domctx";
import { initComsMap } from "@/components/Document/Content/vdom/comsmap";
import { PageDom } from "@/components/Document/Content/vdom/page";
import { Context } from "@/context";

interface Props {
    shapes: ShapeView[] | Shape[];
    data: PageView;
    backgroundColor: string;
    context: Context
}

const props = defineProps<Props>();

const emits = defineEmits<{
    (e: 'start-loop'): void;
}>();

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
    const size = new ShapeSize(100, 100);
    const trans = new TransformRaw();
    const page = new Page(
        new BasicArray<number>(),
        'assemble-page',
        'assemble-page',
        ShapeType.Page,
        trans,
        size,
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
        pageDom.ctx.loop(window.requestAnimationFrame);
        pageSvg.value.childNodes;
        emits('start-loop');
    }
}

function disassemble() {
    pageDom?.dom.unbind();
    pageDom?.dom.destory();
}

watch(() => props.shapes, () => {
    props.shapes.length && assemble();
})


function repaint() {
    assemble();
}

defineExpose({ pageSvg, repaint });

onMounted(assemble);
onUnmounted(() => {
    disassemble();
});
</script>

<template>
<svg ref="pageSvg" :style="{ 'background-color': backgroundColor }"/>
</template>

<style scoped lang="scss">
svg {
    transform-origin: top left;
}
</style>