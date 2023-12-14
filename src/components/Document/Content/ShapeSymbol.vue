<script setup lang="ts">
import { h } from 'vue';
import comsMap from './comsmap'
import { RenderTransform, SymbolShape, SymbolRefShape, Variable } from "@kcdesign/data";
import { renderSymbol as r } from "@kcdesign/data";
import { initCommonShape } from "./common";

const props = defineProps<{
    data: SymbolShape
}>();

const common = initCommonShape(props);

function render() {
    const ret = r(h, props.data, comsMap, common.reflush);
    return ret;
}

</script>

<template>
    <render />
</template>
