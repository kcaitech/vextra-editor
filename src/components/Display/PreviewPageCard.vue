<script setup lang="ts">
import {
    adapt2Shape, ArtboardView, BasicArray, Border, BorderPosition, BorderSideSetting, BorderStyle, CornerType, Fill, Page, sessionRefIdKey, Shadow, Shape, ShapeType,
    ShapeView, SideType, Style,
    Transform
} from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from "vue";
import { DomCtx } from "@/components/Document/Content/vdom/domctx";
import { initComsMap } from "@/components/Document/Content/vdom/comsmap";
import { PageDom } from "@/components/Document/Content/vdom/page";
import { Context } from "@/context";
import { Preview } from "@/context/preview";

interface Props {
    shapes: ShapeView[];
    data: ShapeView;
    backgroundColor: string;
    context: Context
    selected?: boolean
}

const props = defineProps<Props>();

const emits = defineEmits<{
    (e: 'start-loop'): void;
}>();

const pageSvg = ref<SVGSVGElement>();


let pageDom: { dom: PageDom, ctx: DomCtx } | undefined;

function assemble() {
    disassemble();

    let shapes: any = props.data;

    if (shapes instanceof ShapeView) {
        shapes = adapt2Shape(shapes as any);
    }

    const fills = new BasicArray<Fill>();
    const side = new BorderSideSetting(SideType.Normal, 1, 1, 1, 1);
    const strokePaints = new BasicArray<Fill>();
    const border = new Border(BorderPosition.Center, new BorderStyle(0, 0), CornerType.Miter, side, strokePaints);
    const style = new Style(fills, new BasicArray<Shadow>(), border);
    const trans = new Transform();
    const page = new Page(
        new BasicArray<number>(),
        'assemble-page',
        'assemble-page',
        ShapeType.Page,
        trans,
        style,
        new BasicArray<Shape>(shapes)
    );

    page.isVisible = true;

    const domCtx = new DomCtx();
    const maprefIdArray = props.context.sessionStorage.get(sessionRefIdKey);
    if (maprefIdArray) {
        domCtx.sessionStorage.set(sessionRefIdKey, maprefIdArray);
    }
    initComsMap(domCtx.comsMap);

    const dom: PageDom = new PageDom(domCtx, { data: page });

    pageDom = { dom, ctx: domCtx };
    
    if (pageSvg.value) {
        pageDom.dom.bind(pageSvg.value);
        pageDom.dom.render();
        pageDom.ctx.loop(window.requestAnimationFrame);
        if (pageDom.dom.childs && props.selected) {
            props.context.selection.replaceSelectShape(pageDom.dom.childs[0]);
        }
        replaceSupernatantShape(pageDom.dom.childs[0]);
        setInnerTransform(pageDom.dom.childs);
        emits('start-loop');
    }
}

const setInnerTransform = (shapes: ShapeView[]) => {
    if (!shapes.length) return;

    const innerTrans = props.context.preview.innerTransform;
    const fixedTrans = props.context.preview.fixedTransform;
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape instanceof ArtboardView) {
            const transform = innerTrans.get(shape.id) || new Transform();
            const fixed_transform = fixedTrans.get(shape.id) || new Transform();
            shape.initInnerTransform(transform);
            shape.setFixedTransform(fixed_transform);
        }
        const children = shape.childs || [];
        if (shape.type === ShapeType.Table) {
            continue;
        }
        setInnerTransform(children);
    }
}

// 替换浮层shape
const replaceSupernatantShape = (replace_s: ShapeView) => {
    if (props.selected) return;
    for (let i = 0; i < props.shapes.length; i++) {
        const shape = props.shapes[i];
        if (shape.id === props.data.id) {
            props.shapes[i] = replace_s;
        }
    }
}

function disassemble() {
    if (pageDom) {
        pageDom.ctx.stopLoop();
        pageDom.dom.unbind();
        if (!pageDom.dom.isDistroyed) {
            pageDom?.dom.destory();
        }
        pageDom = undefined;
    }
}

watch(() => props.shapes, () => {
    assemble();
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