/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from '@/context';
import {
    ShapeView,
    Shape,
    IO,
    adapt2Shape,
    BasicArray,
    Border,
    Fill,
    Style,
    Shadow, Page, ShapeType, Transform, utils,
    BorderSideSetting,
    BorderPosition,
    BorderStyle,
    CornerType,
    SideType
} from "@kcaitech/vextra-core";
import { initComsMap } from "@/components/Document/Content/vdom/comsmap";
import { onBeforeMount, onMounted, onUnmounted, ref } from "vue";
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
const viewBox = ref<string>("");

function getViewBox() {
    const data = props.shape;
    const m = data.matrix2Root();
    const f = data.frame;
    const points = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(i => m.computeCoord3(i));
    const box = utils.XYsBounding(points);

    const height = box.bottom - box.top;
    const width = box.right - box.left;

    let left;
    let top;
    if (height > width) {
        const delta = height - width;
        top = box.top;
        left = box.left - (delta / 2);
    } else {
        const delta = width - height;
        top = box.top - (delta / 2);
        left = box.left;
    }

    viewBox.value = `${left} ${top} ${width} ${height}`;
}

function mount() {
    if (assetsSrc.value || !pageSvg.value) return;
    const data = props.shape instanceof ShapeView ? adapt2Shape(props.shape) : props.shape;
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
    pageDom?.dom.destroy();
    pageDom = undefined;
}

function simplify() {
    const data = props.shape instanceof ShapeView ? adapt2Shape(props.shape) : props.shape;

    const { ctx } = IO.Clipboard.export_shape([data]);
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

        // 获取 SVG 的实际尺寸
        const svgRect = _svg.getBBox();
        const svgWidth = svgRect.width;
        const svgHeight = svgRect.height;
        
        // 计算缩放比例，确保 SVG 完整显示在画布中
        const scale = Math.min(size / svgWidth, size / svgHeight);
        const scaledWidth = svgWidth * scale;
        const scaledHeight = svgHeight * scale;
        const x = (size - scaledWidth) / 2;
        const y = (size - scaledHeight) / 2;

        // _svg.setAttribute('width', `${size}`);
        // _svg.setAttribute('height', `${size}`);
        canvas.width = size;
        canvas.height = size;
        const svgString = new XMLSerializer().serializeToString(_svg);
        document.body.removeChild(_svg);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        img.onload = () => {
            context!.drawImage(img, -x, -y);
            resolve(canvas.toDataURL('image/png', 1));
        }
        img.onerror = reject;
    })
}

onBeforeMount(getViewBox);
onMounted(mount);
onUnmounted(unBind);
</script>
<template>
    <img v-if="assetsSrc" alt="static" :src="assetsSrc">
    <svg v-else ref="pageSvg" :width="size" :height="size" :viewBox="viewBox" />
</template>