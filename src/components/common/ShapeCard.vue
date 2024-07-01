<script setup lang="ts">
import { adapt2Shape, DViewCtx, Shape, ShapeView } from "@kcdesign/data";
import { onMounted, ref } from "vue";
import { elpatch } from "@/components/Document/Content/vdom/patch";
import { initComsMap } from "@/components/Document/Content/vdom/comsmap";

interface Props {
    shape: ShapeView | Shape;

    size?: number;
    width?: number;
    height?: number;
    viewBox?: string;
}

const props = defineProps<Props>();
const container = ref<HTMLElement | SVGElement>();

function gen_view_box() {
    if (props.viewBox) {
        return props.viewBox;
    } else {
        const frame = props.shape.boundingBox();
        return `-4 -4 ${frame.width + 8} ${frame.height + 8}`;
    }
}

function mount() {
    if (!container.value) {
        return;
    }

    const ctx = new DViewCtx();
    initComsMap(ctx.comsMap);

    const data = props.shape instanceof ShapeView ? adapt2Shape(props.shape) : props.shape;

    const __Construct = ctx.comsMap.get(data.type);
    if (!__Construct) {
        console.error('unknown type');
        return;
    }

    const __view = new __Construct(ctx, { data }) as any;
    __view.onMounted();
    const __el = __view.renderStatic();
    __el.el = container.value;

    elpatch(__el, undefined);
}

onMounted(mount);
</script>
<template>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :width="width ?? size ?? 100"
     :height="height ?? size ?? 100" :viewBox='gen_view_box()' overflow="hidden">
    <g ref="container"></g>
</svg>
</template>