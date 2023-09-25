<script setup lang="ts">
import { h } from 'vue';
import comsMap from './comsmap'
import { renderSymbolRef as r } from "@kcdesign/data"
import { SymbolRefShape } from '@kcdesign/data';
import { initCommonShape } from './common';

const props = defineProps<{ data: SymbolRefShape }>();
const common = initCommonShape(props);

function render() {
    const ret = r(h, props.data, comsMap, common.reflush);
    return ret;
}

</script>

<template>
    <render />
</template>

<style scoped></style>