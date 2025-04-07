/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import {
    adapt2Shape, BasicArray, Border, BorderPosition, BorderSideSetting, BorderStyle, CornerType, Fill, Page, Shadow, Shape, ShapeType,
    ShapeView, SideType, Style, Transform
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
        pageDom?.dom.destroy();
        pageDom = undefined;
    }

    let shapes: Shape[] = props.shapes as Shape[];

    if (!shapes.length) {
        return;
    }

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

    if (pageSvg.value) {
        pageDom.dom.bind(pageSvg.value);
        pageDom.dom.render();
    }
}

function disassemble() {
    pageDom?.dom.unbind();
    pageDom?.dom.destroy();
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