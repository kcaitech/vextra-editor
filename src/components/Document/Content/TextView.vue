<script setup lang="ts">
import { TextShape, RenderTransform, SymbolRefShape, SymbolShape, Variable } from '@kcdesign/data';
import { h } from 'vue';
import { renderTextShape as r } from "@kcdesign/data"
import { initCommonShape } from './common';

const props = defineProps<{
    data: TextShape, transx?: RenderTransform,
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();

const common = initCommonShape(props);

function render() {
    const consumedVars: { slot: string, vars: Variable[] }[] = [];
    const ret = r(h, props.data, props.transx, props.varsContainer, consumedVars, common.reflush);
    common.watchVars(consumedVars);
    return ret;
}

</script>

<template>
    <render />
</template>