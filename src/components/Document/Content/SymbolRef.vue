<script setup lang="ts">
import { h, onUnmounted } from 'vue';
import comsMap from './comsmap'
import { Variable, renderSymbolRef as r } from "@kcdesign/data"
import { SymbolRefShape, RenderTransform, SymbolShape } from '@kcdesign/data';
import { initCommonShape } from './common';

const props = defineProps<{
    data: SymbolRefShape, transx?: RenderTransform,
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();

const watcher = () => {
    common.incReflush();
}

// 需要自己加载symbol
let __data: SymbolShape | undefined;
let __subdata: SymbolShape | undefined;

let __startLoad: string = "";
function updater() {
    const symMgr = props.data.getSymbolMgr();
    if (!symMgr) return;
    const refId = props.data.getRefId2(props.varsContainer);
    if (__startLoad === refId) return;

    __startLoad = refId;
    symMgr.get(refId).then((val) => {
        if (__data) __data.unwatch(watcher);
        __data = val;
        if (__data) __data.watch(watcher);
        // 处理status
        if (val && val.isUnionSymbolShape) {
            const syms = val.getTagedSym(props.data);
            if (__subdata) __subdata.unwatch(watcher);
            __subdata = syms[0] || val.childs[0];
            if (__subdata) __subdata.watch(watcher);
        }
        else if (__subdata) {
            __subdata.unwatch(watcher);
            __subdata = undefined;
        }
        common.incReflush();
    })
}

updater();

onUnmounted(() => {
    if (__data) __data.unwatch(watcher);
    if (__subdata) __subdata.unwatch(watcher);
})

const common = initCommonShape(props, updater);

function render() {
    const consumedVars: { slot: string, vars: Variable[] }[] = [];
    const ret = r(h, props.data, __subdata || __data, comsMap, props.transx, props.varsContainer, consumedVars, common.reflush);
    common.watchVars(consumedVars);
    return ret;
}

</script>

<template>
    <render />
</template>

<style scoped></style>