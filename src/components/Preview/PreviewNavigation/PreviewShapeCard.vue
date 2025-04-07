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
import { adapt2Shape, DViewCtx, Shape, ShapeView } from '@kcdesign/data';
import { markRaw, onMounted, ref } from "vue";
import { elpatch } from "@/components/Document/Content/vdom/patch";
import { initComsMap } from "@/components/Document/Content/vdom/comsmap";

interface Props {
    shape: ShapeView | Shape;
}

const props = defineProps<Props>();
const container = ref<HTMLElement | SVGElement>();

function gen_view_box() {
    const frame = props.shape.boundingBox();
    return `1 1 ${frame.width} ${frame.height}`;
}


function mount() {
    if (!container.value) {
        return;
    }

    const ctx = new DViewCtx();
    ctx.setMarkRawFun(markRaw);
    initComsMap(ctx.comsMap);

    const data = props.shape instanceof ShapeView ? adapt2Shape(props.shape) : props.shape;

    const __Construct = ctx.comsMap.get(data.type);
    if (!__Construct) {
        console.error('unknown type');
        return;
    }

    const __view = new __Construct(ctx, { data }) as any;
    __view.onMounted();
    // const __el = (__view as any).staticRender();
    // __el.el = container.value;

    // elpatch(__el, undefined);
}

onMounted(mount);
</script>
<template>
    <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" width="36" height="36"
        :viewBox='gen_view_box()' overflow="hidden">
        <g ref="container"></g>
    </svg>
</template>