<script setup lang="ts">
import { Matrix, OverrideShape, SymbolRefShape, TextShape } from '@kcdesign/data';
import { h } from 'vue';
import { renderTextShape as r } from "@kcdesign/data"
import { initCommonShape } from './common';

const props = defineProps<{ data: TextShape, overrides?: SymbolRefShape[], matrix?: Matrix }>();
const common = initCommonShape(props);

function render() {
    const consumes: OverrideShape[] = [];
    const ret = r(h, props.data, props.overrides, consumes, common.matrix, common.reflush);
    common.updateComsumeOverride(consumes);
    return ret;
}

</script>

<template>
    <render />
</template>