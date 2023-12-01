<script setup lang="ts">
import { h } from 'vue';
import comsMap from './comsmap'
import { Artboard } from '@kcdesign/data';
import { renderArtboard as r } from "@kcdesign/data"
import { SymbolRefShape, SymbolShape, RenderTransform } from "@kcdesign/data";
import { initCommonShape } from './common';

const props = defineProps<{ data: Artboard, transx?: RenderTransform,
    varsContainer?: (SymbolRefShape | SymbolShape)[] }>();

const common = initCommonShape(props);

function render() {
    const ret = r(h, props.data, comsMap, props.transx, props.varsContainer, common.reflush);
    return ret;
}

</script>

<template>
    <render></render>
</template>

<style scoped></style>