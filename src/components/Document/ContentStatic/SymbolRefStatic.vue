<script setup lang="ts">
import {h, ref} from 'vue';
import comsMap from '../Content/comsmap'
import {Variable, renderSymbolRefStatic as r} from "@kcdesign/data"
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
let __subdata: SymbolShape | undefined;

let __startLoad: string = "";

function updater() {
    const symMgr = props.data.getSymbolMgr();
    if (!symMgr) return;
    const refId = props.data.getRefId2(props.varsContainer);
    if (__startLoad === refId) {
        if (__data) { // 更新subdata
            if (__data.isSymbolUnionShape) {
                const syms = __data.getTagedSym(props.data, props.varsContainer || []);
                const subdata = syms[0] || __data.childs[0];
                if (__subdata !== subdata) {
                    __subdata = subdata;
                }
            } else if (!__data.isSymbolUnionShape && __subdata) {
                __subdata = undefined;
            }
            reflush.value++;
        }
        return;
    }

    __startLoad = refId;
    symMgr.get(refId).then((val) => {
        __data = val;
        if (val && val.isSymbolUnionShape) {
            __subdata = val.getTagedSym(props.data, props.varsContainer || [])[0] || val.childs[0];
        } else if (__subdata) {
            __subdata = undefined;
        }
        reflush.value++;
    })
}

updater();

function render() {
    const consumedVars: { slot: string, vars: Variable[] }[] = [];
    return r(h, props.data, __subdata || __data, comsMap, props.transx, props.varsContainer, consumedVars, reflush.value);
}
</script>

<template>
    <render/>
</template>