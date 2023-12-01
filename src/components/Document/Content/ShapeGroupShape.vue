<script setup lang="ts">
import { h, onUnmounted, watch } from 'vue';
import { Shape, GroupShape, SymbolRefShape, SymbolShape, RenderTransform } from "@kcdesign/data";
import { renderBoolOpShape as opr } from "@kcdesign/data";
import { renderGroup as normalR } from "@kcdesign/data";
import comsMap from './comsmap';
import { initCommonShape } from './common';

const props = defineProps<{
    data: GroupShape, transx?: RenderTransform,
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();
const common = initCommonShape(props);
const consumed: Array<Shape> = [];
const watcher = () => {
    common.incReflush();
}

watch(() => props.data, (value, old) => {
    for (let i = 0, len = consumed.length; i < len; i++) {
        consumed[i].unwatch(watcher);
    }
    consumed.length = 0;
})

onUnmounted(() => {
    for (let i = 0, len = consumed.length; i < len; i++) {
        consumed[i].unwatch(watcher);
    }
    consumed.length = 0;
})

function render() {
    const consumed0: Array<Shape> = [];
    const isBoolOpShape = props.data.isBoolOpShape;

    const ret = isBoolOpShape ?
        opr(h, props.data, props.transx, props.varsContainer, common.reflush, consumed0) :
        normalR(h, props.data, comsMap, props.transx, props.varsContainer, common.reflush);

    if (consumed0.length < consumed.length) {
        for (let i = consumed0.length, len = consumed.length; i < len; i++) {
            consumed[i].unwatch(watcher);
        }
    }
    consumed.length = consumed0.length;
    for (let i = 0, len = consumed.length; i < len; i++) {
        const s0 = consumed0[i];
        const s = consumed[i];
        if (s && s.id == s0.id) {
            continue;
        }
        if (s) s.unwatch(watcher);
        s0.watch(watcher);
        consumed[i] = s0;
    }
    return ret;
}

</script>

<template>
    <render />
</template>
