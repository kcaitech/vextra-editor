<script setup lang="ts">
import { h, onUnmounted, watch } from 'vue';
import { Shape, TableShape, RenderTransform, SymbolRefShape , SymbolShape, Variable } from "@kcdesign/data";
import { renderTable as r } from "@kcdesign/data";
import { initCommonShape } from './common';
import comsMap from './comsmap';

const props = defineProps<{
    data: TableShape, transx?: RenderTransform,
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();

const common = initCommonShape(props);
const watcher = (...args: any[]) => {
    if (args.indexOf('borders') >= 0) common.incReflush();
}

const consumed: Array<Shape | undefined> = [];

watch(() => props.data, (value, old) => {
    for (let i = 0, len = consumed.length; i < len; i++) {
        const cell = consumed[i];
        if (cell) cell.unwatch(watcher);
    }
    consumed.length = 0;
})

onUnmounted(() => {
    for (let i = 0, len = consumed.length; i < len; i++) {
        const cell = consumed[i];
        if (cell) cell.unwatch(watcher);
    }
    consumed.length = 0;
})

function render() {
    const consumed0 = props.data.datas;
    const consumedVars: { slot: string, vars: Variable[] }[] = [];
    const ret = r(h, props.data, comsMap, props.transx, props.varsContainer, consumedVars, common.reflush);
    common.watchVars(consumedVars);
    if (consumed0.length < consumed.length) {
        for (let i = consumed0.length, len = consumed.length; i < len; i++) {
            const cell = consumed[i];
            if (cell) cell.unwatch(watcher);
        }
    }
    consumed.length = consumed0.length;
    for (let i = 0, len = consumed.length; i < len; i++) {
        const s0 = consumed0[i];
        const s = consumed[i];
        if (s === undefined && s0 === undefined) {
            continue;
        }
        if (s && s0 && s.id === s0.id) {
            continue;
        }
        if (s) s.unwatch(watcher);
        if (s0) s0.watch(watcher);
        consumed[i] = s0;
    }
    return ret;
}

</script>

<template>
    <render />
</template>
