<script setup lang="ts">
import {
    adapt2Shape, ArtboradView, BasicArray, Border, Fill, Page, PageView, Shadow, Shape, ShapeSize, ShapeType,
    ShapeView, Style,
    TransformRaw
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
    context: Context
}

const props = defineProps<Props>();

const emits = defineEmits<{
    (e: 'start-loop'): void;
}>();

const pageSvg = ref<SVGSVGElement>();

let pageDom: { dom: PageDom, ctx: DomCtx } | undefined;
function assemble() {
    const length = props.context.selection.selectedShapes.length;
    if (pageDom) {
        pageDom?.dom.unbind();
        if (!pageDom.dom.isDistroyed) {
            pageDom.dom.destory();
        }
        pageDom = undefined;
    }

    let shapes: any[] = props.shapes;

    if (!shapes.length) {
        return;
    }

    if (shapes[0] instanceof ShapeView) {
        shapes = shapes.map((s) => adapt2Shape(s as any));
    }

    const borders = new BasicArray<Border>();
    const fills = new BasicArray<Fill>();
    const style = new Style(borders, fills, new BasicArray<Shadow>());
    const trans = new TransformRaw();
    const page = new Page(
        new BasicArray<number>(),
        'assemble-page',
        'assemble-page',
        ShapeType.Page,
        trans,
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
        // pageDom.dom.childs.forEach(item => {
        //     if (item instanceof ArtboradView) {
        //         item.innerScrollOffset(0,0);
        //         item.m_ctx.setDirty(item);
        //     }
        // })
        pageDom.ctx.loop(window.requestAnimationFrame);
        const els = pageSvg.value.childNodes;
        if (!length && els.length > 0) {
            for (let index = 0; index < els.length; index++) {
                const el = els[index];
                pageSvg.value.removeChild(el);
            }
        }
        emits('start-loop');
    }
}

function disassemble() {
    if (pageDom) {
        pageDom.dom.unbind();
        if (!pageDom.dom.isDistroyed) {
            pageDom?.dom.destory();
        }
    }
}

watch(() => props.shapes, () => {
    props.shapes.length && assemble();
})

const preview_watch = (t: number) => {
    if (t === Preview.SWAP_REF_STAT) {
        assemble();
    }
}

function repaint() {
    assemble();
}

defineExpose({ pageSvg, repaint });

onMounted(() => {
    assemble();
    props.context.preview.watch(preview_watch);
});
onUnmounted(() => {
    disassemble();
    props.context.preview.unwatch(preview_watch);
});
</script>

<template>
    <svg ref="pageSvg" :style="{ 'background-color': backgroundColor }" />
</template>

<style scoped lang="scss">
svg {
    position: absolute;
    transform-origin: top left;
}
</style>