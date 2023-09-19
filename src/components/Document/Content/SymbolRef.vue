<script setup lang="ts">
import { h, watch } from 'vue';
import comsMap from './comsmap'
import { Matrix, OverrideShape, renderSymbolRef as r } from "@kcdesign/data"
import { SymbolRefShape } from '@kcdesign/data';
import { initCommonShape } from './common';

const props = defineProps<{ data: SymbolRefShape, overrides?: SymbolRefShape[], matrix?: Matrix }>();
const common = initCommonShape(props);
props.data.loadSymbol();

watch(() => props.data, (value, old) => {
    value.loadSymbol();
})

function render() {
    const consumes: OverrideShape[] = [];
    const ret = r(h, props.data, comsMap, props.overrides, consumes, common.matrix, common.reflush);
    common.updateComsumeOverride(consumes);
    return ret;
}

</script>

<template>
    <render />
</template>

<style scoped></style>