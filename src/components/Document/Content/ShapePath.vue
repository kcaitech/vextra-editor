
<script setup lang="ts">
import { OverrideShape, PathShape, SymbolRefShape } from '@kcdesign/data';
import { h } from 'vue';
import { renderPathShape as r } from "@kcdesign/data";
import { initCommonShape } from './common';

const props = defineProps<{ data: PathShape, overrides?: SymbolRefShape[] }>();
const common = initCommonShape(props);

function render() {
    const consumes: OverrideShape[] = [];
    const ret = r(h, props.data, props.overrides, consumes, common.reflush);
    common.updateComsumeOverride(consumes);
    return ret;
}
</script>

<template>
    <render />
</template>