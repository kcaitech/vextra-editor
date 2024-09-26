<script setup lang="ts">
import { Context } from '@/context';
import {
    ShapeView,
    Shape,
    export_shape,
    adapt2Shape,
    BasicArray,
    Border,
    Fill,
    Style,
    Shadow, Page, ShapeType, TransformRaw, XYsBounding
} from "@kcdesign/data";
import { initComsMap } from "@/components/Document/Content/vdom/comsmap";
import { onMounted, onUnmounted, ref } from "vue";
import { PageDom } from "@/components/Document/Content/vdom/page";
import { DomCtx } from "@/components/Document/Content/vdom/domctx";

const props = withDefaults(
    defineProps<{
        context: Context;
        shape: ShapeView | Shape;
        size?: number;
        backgroundColor?: string;
        src?: string;
    }>(),
    {
        size: 100,
        backgroundColor: 'rgb(239, 239, 239)',
    }
);

const emits = defineEmits<{
    (e: 'loaded', params: { id: string; bitmap: string }): void;
}>();
const assetsSrc = ref<string | undefined>(props.src);

let pageDom: { dom: PageDom, ctx: DomCtx } | undefined;
const pageSvg = ref<SVGSVGElement>();
const viewBox = ref<string>('');

function getViewBox() {
    const data = props.shape;
    const m = data.matrix2Root();
    const f = data.frame;
    const points = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(i => m.computeCoord3(i));
    const box = XYsBounding(points);

    const height = box.bottom - box.top;
    const width = box.right - box.left;

    let left;
    let top;

    const size = props.size;

    if (height > width) {
        const delta = height - width;
        const scale = height / size;
        top = box.top - scale * 2;
        left = box.left - (delta / 2) - (scale * 2);
    } else {
        const delta = width - height;
        const scale = width / size;
        top = box.top - (delta / 2) - (scale * 2);
        left = box.left - scale * 2
    }

    viewBox.value = `${left} ${top} ${width} ${height}`;
}

function mount() {
    if (assetsSrc.value || !pageSvg.value) return;
    const data = props.shape instanceof ShapeView ? adapt2Shape(props.shape) : props.shape;
    getViewBox();
    const borders = new BasicArray<Border>();
    const fills = new BasicArray<Fill>();
    const style = new Style(borders, fills, new BasicArray<Shadow>());

    const page = new Page(
        new BasicArray<number>(),
        'assemble-page',
        'assemble-page',
        ShapeType.Page,
        new TransformRaw(),
        style,
        new BasicArray<Shape>(data)
    );

    page.isVisible = true;

    const domCtx = new class extends DomCtx {
        protected onIdle(): boolean {
            this.emit("render-idle")
            return false;
        }
    }();
    initComsMap(domCtx.comsMap);
    const dom: PageDom = new PageDom(domCtx, { data: page });
    pageDom = { dom, ctx: domCtx };
    pageDom.dom.bind(pageSvg.value);
    domCtx.loop(window.requestAnimationFrame);

    simplify();
}

function unBind() {
    pageDom?.dom.unbind();
    pageDom?.dom.destory();
    pageDom = undefined;
}

function simplify() {
    const data = props.shape instanceof ShapeView ? adapt2Shape(props.shape) : props.shape;

    const { ctx } = export_shape([data]);
    const context = props.context;
    const mediaFetchTasks: Promise<boolean>[] = [];
    const loader = context.data.mediasMgr;

    if (ctx.medias.size) {
        const keys = Array.from(ctx.medias.values());
        for (const key of keys) {
            mediaFetchTasks.push(loadMedia(key));
        }
    }

    loadAllMedia().then(() => {
        // 等待绘制SVG节点绘制完成
        return new Promise((resolve) => {
            pageDom!.ctx.continueLoop();
            pageDom!.ctx.once("render-idle", () => resolve(true));
        });
    }).then(() => {
        // 获取绘制好的SVG节点，开始生成PNG
        return getBase64();
    }).then((res) => {
        assetsSrc.value = res;
        unBind();
        emits('loaded', { id: props.shape.id, bitmap: assetsSrc.value });
    });

    function loadMedia(key: string): Promise<boolean> {
        // 单张图片最长时间限制为 10s
        const timeLimit: Promise<boolean> = new Promise((resolve) => {
            let timer: any = setTimeout(() => {
                resolve(false);
                clearTimeout(timer);
                timer = null;
            }, 10000);
        })
        const p: Promise<boolean> = new Promise((resolve) => {
            loader.get(key).then(() => resolve(true)).catch(() => {
                resolve(false)
            });
        });
        return Promise.race([timeLimit, p]);
    }

    function loadAllMedia() {
        // 图片拉取总时长限制为 20s
        const timeLimit: Promise<boolean> = new Promise((resolve) => {
            let timer: any = setTimeout(() => {
                resolve(false);
                clearTimeout(timer);
                timer = null;
            }, 20000);
        })
        const loaderAll = Promise.all(mediaFetchTasks);
        return Promise.race([timeLimit, loaderAll]);
    }
}

function getBase64(): Promise<string> {
    const svg = pageSvg.value as SVGElement;
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const _svg = svg.cloneNode(true) as SVGSVGElement;
        document.body.appendChild(_svg);
        const size = props.size;
        _svg.setAttribute('width', `${size}`);
        _svg.setAttribute('height', `${size}`);
        canvas.width = size;
        canvas.height = size;
        const svgString = new XMLSerializer().serializeToString(_svg);
        document.body.removeChild(_svg);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        img.onload = () => {
            context!.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png', 1));
        }
        img.onerror = reject;
    })
}

onMounted(mount);
onUnmounted(unBind);
</script>
<template>
<div>
    <img v-if="assetsSrc" alt="static" :src="assetsSrc">
    <svg v-else ref="pageSvg" :width="size" :height="size" :viewBox="viewBox"/>
</div>
</template>