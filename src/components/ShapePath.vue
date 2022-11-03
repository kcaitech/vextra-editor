
<script setup lang="ts">
import { PathShape } from '@/data/shape';
import { h, defineProps } from 'vue';
import { render as fillR } from "@/render/fill";
import { render as borderR } from "@/render/border"
import { transform } from '@/render/basic';

const props = defineProps<{ data: PathShape, boolop: number }>();

function render() {
    // if (this.data.boolOp != BoolOp.None) {
    //     // todo 只画selection
    //     return;
    // }

    let frame = props.data.frame;
    let path = props.data.getPath(true);
    let childs = [];

    // fill
    childs.push(...fillR(props.data, path));

    // border
    childs.push(...borderR(props.data, path));

    // ----------------------------------------------------------
    // shadows todo

    if (childs.length == 0) {
        return h('path', {
            d: path,
            "fill-opacity": 1,
            fill: 'none',
            stroke: 'none',
            'stroke-width': 0,
            transform: "translate(" + frame.x + " " + frame.y + ")",
        });
    }
    else if (childs.length == 1) {
        return transform(childs[0], h);
    }
    else {
        return h("g", transform(childs, h));
    }
}
</script>

<template>
    <render />
</template>