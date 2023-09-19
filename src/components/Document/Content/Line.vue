<script setup lang="ts">
import { Shape } from '@kcdesign/data';
import { h } from 'vue';
import { renderLine as r } from "@kcdesign/data";
import { initCommonShape } from './common';

const props = defineProps<{ data: Shape }>();
const common = initCommonShape(props);

function render() {
    const ret = r(h, props.data, common.reflush);
    return ret;
}
</script>

<template>
    <render></render>
</template>