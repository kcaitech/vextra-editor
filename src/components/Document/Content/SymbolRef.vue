<script setup lang="ts">
import { h, onUnmounted } from 'vue';
import comsMap from './comsmap'
import { SymbolUnionShape, Variable, renderSymbolRef as r } from "@kcdesign/data"
import { SymbolRefShape, RenderTransform, SymbolShape } from '@kcdesign/data';
import { initCommonShape } from './common';

const props = defineProps<{
    data: SymbolRefShape, transx?: RenderTransform,
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();

const watcher = () => {
    common.incReflush();
    updater();
}

// 需要自己加载symbol
let __data: SymbolShape | undefined;
let __union: SymbolShape | undefined;
let __startLoad: string = "";
function updater() {
    const symMgr = props.data.getSymbolMgr();
    if (!symMgr) return;
    const refId = props.data.getRefId2(props.varsContainer);
    if (__startLoad === refId) {
        return;
    }

    __startLoad = refId;
    symMgr.get(refId).then((val) => {
        if (__startLoad !== refId) return;
        if (__data) __data.unwatch(watcher);
        __data = val;
        if (__data) __data.watch(watcher);

        // union
        const union = __data?.parent instanceof SymbolUnionShape ? __data.parent : undefined;
        if (__union?.id !== union?.id) {
            if (__union) __union.unwatch(watcher);
            __union = union;
            if (__union) __union.watch(watcher);
        }

        common.incReflush();
    })
}

updater();

onUnmounted(() => {
    if (__data) __data.unwatch(watcher);
    if (__union) __union.unwatch(watcher);
    __startLoad = "";
})

const common = initCommonShape(props, updater);

function render() {
    const ret = r(h, props.data, __data, comsMap, props.transx, props.varsContainer, common.reflush);
    return ret;
}

</script>

<template>
    <render />
</template>

<style scoped></style>