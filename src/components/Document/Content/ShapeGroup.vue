<script setup lang="ts">
import { h } from 'vue';
import comsMap from './comsmap'
import { GroupShape, SymbolRefShape, SymbolShape } from "@kcdesign/data";
import { renderGroup as r } from "@kcdesign/data";
import { initCommonShape } from "./common";

const props = defineProps<{
    data: GroupShape, 
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();
const common = initCommonShape(props);

function render() {
    const ret = r(h, props.data, comsMap, props.varsContainer, common.reflush);
    return ret;
}

</script>

<template>
    <render />
</template>
