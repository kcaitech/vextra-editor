<script setup lang="ts">
import { TextShape, SymbolRefShape, SymbolShape } from '@kcdesign/data';
import { h } from 'vue';
import { renderTextShape as r } from "@kcdesign/data"
import { initCommonShape } from './common';

const props = defineProps<{
    data: TextShape,
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();

const common = initCommonShape(props);

function render() {
    return r(h, props.data, props.varsContainer, common.reflush);
}
</script>
<template>
    <render></render>
</template>