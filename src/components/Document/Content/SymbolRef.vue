<script setup lang="ts">
import { h, defineProps, onMounted, onUnmounted, ref } from 'vue';
import comsMap from './comsmap'
import { BoolOp, SymbolRef } from "@/data/shape";
import { renderGroupChilds as gR } from "@/render/group";
import { render as fillR } from "@/render/fill";
import { render as borderR } from "@/render/border"
import { transform } from '@/render/basic';

const props = defineProps<{ data: SymbolRef, boolop: number }>();

const reflush = ref(0);
function watcher() {
    reflush.value++;
}
onMounted(() => {
    props.data.loadSymbol();
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
})

function render() {
    const sym = props.data.peekSymbol();
    if (!sym) {
        return;
    }
    let frame = props.data.frame;
    let childs = [];
    let path = props.data.getPath(true);
    // fill
    childs.push(...fillR(props.data, path));
    // border
    childs.push(...borderR(props.data, path));

    // symbol
    childs.push(...gR(sym, BoolOp.None, comsMap));

    if (childs.length == 0) {
        // todo
        return h('rect', {
            reflush: reflush.value,
            "fill-opacity": 1,
            stroke: 'none',
            'stroke-width': 0,
            x: frame.x,
            y: frame.y,
            width: frame.width,
            height: frame.height
        });
    }
    // else if (childs.length == 1) {
    //     return transform(childs[0], h);
    // }
    else {
        return h("g", { transform: 'translate(' + frame.x + ',' + frame.y + ')', reflush: reflush.value }, transform(childs, h));
    }
}

</script>

<template>
    <render />
</template>

<style scoped>

</style>