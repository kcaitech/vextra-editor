<script setup lang="ts">
import { ImageShape, SymbolRefShape, SymbolShape, RenderTransform, Variable } from '@kcdesign/data';
import { h } from 'vue';
import { renderImage as r } from "@kcdesign/data"
import { IMAGE_DEFAULT, initCommonShape } from './common';

const props = defineProps<{
    data: ImageShape, transx?: RenderTransform,
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();
const common = initCommonShape(props);

const render = () => {
    const consumedVars: { slot: string, vars: Variable[] }[] = [];
    const ret = r(h, props.data, IMAGE_DEFAULT, props.transx, props.varsContainer, consumedVars, common.reflush);
    common.watchVars(consumedVars);
    return ret;
}

</script>

<template>
    <render></render>
</template>