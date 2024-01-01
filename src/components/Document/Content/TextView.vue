<script setup lang="ts">
import { TextShape, SymbolRefShape, SymbolShape, Variable } from '@kcdesign/data';
import { h } from 'vue';
import { renderTextShape as r } from "@kcdesign/data"
import { initCommonShape } from './common';

const props = defineProps<{
    data: TextShape, 
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();

const common = initCommonShape(props);

function render() {
    const ret = r(h, props.data, props.varsContainer, common.reflush);
    return ret;
}

</script>

<template>
    <render />
</template>