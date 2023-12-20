<script setup lang="ts">
import {h, ref} from 'vue';
import comsMap from '../Content/comsmap'
import {renderSymbolRefStatic as r} from "@kcdesign/data"
import {SymbolRefShape, RenderTransform, SymbolShape} from '@kcdesign/data';

interface Props {
    data: SymbolRefShape
    transx?: RenderTransform
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}

const props = defineProps<Props>();
const reflush = ref<number>(0);
// 需要自己加载symbol
let __data: SymbolShape | undefined;
// let __union: SymbolShape | undefined;

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
        __data = val;
        // union
        // const union = __data?.parent instanceof SymbolUnionShape ? __data.parent : undefined;
        // if (__union?.id !== union?.id) {
        //     __union = union;
        // }
        reflush.value++;
    })
}

updater();

function render() {
    const ret = r(h, props.data, __data, comsMap, props.transx, props.varsContainer, reflush.value);
    return ret;
}
</script>

<template>
    <render/>
</template>