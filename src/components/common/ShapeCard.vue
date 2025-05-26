/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { adapt2Shape, DViewCtx, Shape, ShapeView } from "@kcdesign/data";
import { markRaw, onMounted, onUnmounted, ref } from "vue";
import { elpatch } from "@/components/Document/Content/vdom/patch";
import { initComsMap } from "@/components/Document/Content/vdom/comsmap";
import { debounce } from "lodash";

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

let __view: any;

function mount() {
    if (!container.value) return;

    const ctx = new DViewCtx();
    ctx.setMarkRawFun(markRaw)
    initComsMap(ctx.comsMap);

    const data = props.shape instanceof ShapeView ? adapt2Shape(props.shape) : props.shape;

    const __Construct = ctx.comsMap.get(data.type);
    if (!__Construct) {
        console.error('unknown type');
        return;
    }

    __view = new __Construct(ctx, { data }) as any;
    __view.onMounted();
    __view.watch(watcher);
    // const __el = __view.renderStatic();
    // __el.el = container.value;
    //
    // elpatch(__el, undefined);
}

function __render() {
    if (!__view) return;
    __view.unwatch(watcher);
    mount();
}

const render = debounce(__render, 300);

function watcher(args: any[]) {
    if (args.includes('style')) render();
}

onMounted(mount);
onUnmounted(() => {
    props.shape.unwatch(watcher);
    __view.unwatch(watcher);
})
</script>
<template>
<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet"
     :width="width ?? size ?? 100" :height="height ?? size ?? 100"
     :viewBox='gen_view_box()' overflow="hidden" style="outline: none;">
    <g ref="container"></g>
</svg>
</template>