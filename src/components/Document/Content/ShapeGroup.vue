<script setup lang="ts">
import { h } from 'vue';
import comsMap from './comsmap'
import { GroupShape, Matrix, OverrideShape, SymbolRefShape } from "@kcdesign/data";
import { renderGroup as r } from "@kcdesign/data";
import { initCommonShape } from "./common";

const props = defineProps<{ data: GroupShape, overrides?: SymbolRefShape[], matrix?: Matrix }>();
const common = initCommonShape(props);

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
