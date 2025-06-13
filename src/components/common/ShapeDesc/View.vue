<script setup lang="ts">
import { ShapeDescContext } from "@/components/common/ShapeDesc/shapeDescContext";
import {
    ShapeView,
    Shape,
    adapt2Shape,
    BasicArray,
    Fill,
    BorderSideSetting,
    SideType,
    Border,
    BorderPosition,
    BorderStyle,
    CornerType,
    Style,
    Shadow,
    Page,
    ShapeType,
    Transform
} from "@kcdesign/data";
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { PageDom } from "@/components/Document/Content/vdom/page";
import { DomCtx } from "@/components/Document/Content/vdom/domctx";
import { initComsMap } from "@/components/Document/Content/vdom/comsmap";
import { SpaceHandler } from "@/space";

const props = defineProps<{
    context: ShapeDescContext;
    id: string;
}>();

const view = computed(() => {
    const _view = props.context.map.get(props.id);
    if (!_view) throw Error("Can't find the view");
    if (_view instanceof ShapeView) return _view as ShapeView;
    else return _view as Shape;
});

const width = ref<number>(0);
const height = ref<number>(0);
const viewBox = ref<string>('0 0 100 100');

const pageSvg = ref<SVGSVGElement>();
const imgSrc = ref<string>();

let pageDom: { dom: PageDom, ctx: DomCtx } | undefined;

const currentComponent = computed(() => {
    return imgSrc.value ? 'img' : 'svg';
});

const componentProps = computed(() => {
    if (imgSrc.value) {
        return {
            src: imgSrc.value,
            alt: 'shape-view',
            style: 'width: 100%; height: 100%; object-fit: cover;'
        };
    } else {
        return {
            width: 100,
            height: 100,
            viewBox: viewBox.value
        };
    }
});

function assemble() {
    if (pageDom) {
        pageDom?.dom.unbind();
        pageDom?.dom.destroy();
        pageDom = undefined;
    }

    let shapes: Shape[] = [view.value] as Shape[];

    if (!shapes.length) return;

    if (shapes[0] instanceof ShapeView) {
        shapes = shapes.map((s) => adapt2Shape(s as any));
    }

    const fills = new BasicArray<Fill>();
    const side = new BorderSideSetting(SideType.Normal, 1, 1, 1, 1);
    const strokePaints = new BasicArray<Fill>();
    const border = new Border(BorderPosition.Center, new BorderStyle(0, 0), CornerType.Miter, side, strokePaints);
    const style = new Style(fills, new BasicArray<Shadow>(), border);

    const page = new Page(
        new BasicArray<number>(),
        'assemble-page',
        'assemble-page',
        ShapeType.Page,
        new Transform(),
        style,
        new BasicArray<Shape>(...shapes)
    );

    page.isVisible = true;

    const domCtx = new DomCtx();
    initComsMap(domCtx.comsMap);

    const dom: PageDom = new PageDom(domCtx, { data: page });

    pageDom = { dom, ctx: domCtx };

    const bounds = SpaceHandler.ViewsRootBounding(pageDom.dom.childs);

    width.value = bounds.right - bounds.left;
    height.value = bounds.bottom - bounds.top;
    viewBox.value = `${bounds.left} ${bounds.top} ${width.value} ${height.value}`;

    if (pageSvg.value) {
        pageDom.dom.bind(pageSvg.value);
        pageDom.dom.render('SVG');
    }

    nextTick(getSrcURL);
}

function disassemble() {
    pageDom?.dom.unbind();
    pageDom?.dom.destroy();
}

function getSrcURL() {
    const fromMap = props.context.srcMap.get(props.id);
    if (fromMap) {
        imgSrc.value = fromMap;
        return;
    }

    const svg = pageSvg.value;
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    const _svg = svg.cloneNode(true) as SVGSVGElement;

    document.body.appendChild(_svg);
    const { width, height } = _svg.viewBox.baseVal;
    _svg.setAttribute('width', `${width}`);
    _svg.setAttribute('height', `${height}`);
    canvas.width = width;
    canvas.height = height;
    const svgString = new XMLSerializer().serializeToString(_svg);
    document.body.removeChild(_svg);
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    img.onload = () => {
        context.drawImage(img, 0, 0);
        imgSrc.value = canvas.toDataURL('image/png', 1);
        props.context.srcMap.set(props.id, imgSrc.value);
    }
    img.onerror = (err) => {
        console.error(err);
    }
}

onMounted(assemble);
onUnmounted(disassemble);
</script>

<template>
    <component :is="currentComponent" v-bind="componentProps"
               :ref="(el: any) => { if (currentComponent === 'svg') pageSvg = el }"/>
</template>