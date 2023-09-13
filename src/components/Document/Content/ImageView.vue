<script setup lang="ts">
import { ImageShape, OverrideShape, SymbolRefShape } from '@kcdesign/data';
import { h } from 'vue';
import { renderImage as r } from "@kcdesign/data"
import { IMAGE_DEFAULT, initCommonShape } from './common';

const props = defineProps<{ data: ImageShape, overrides?: SymbolRefShape[] }>();
const common = initCommonShape(props);

const render = () => {
    const consumes: OverrideShape[] = [];
    const ret = r(h, props.data, IMAGE_DEFAULT, props.overrides, consumes, common.reflush);
    common.updateComsumeOverride(consumes);
    return ret;
}

</script>

<template>
    <render></render>
</template>