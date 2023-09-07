<script setup lang="ts">
import { OverridesGetter, Shape } from '@kcdesign/data';
import { h } from 'vue';
import { renderLine as r } from "@kcdesign/data";
import { initCommonShape } from './common';

const props = defineProps<{ data: Shape, overrides?: OverridesGetter  }>();
const init = initCommonShape(props);

function render() {
    return r(h, props.data, init.reflush);
}
</script>

<template>
    <render></render>
</template>

<style scoped>
/* rect {
    background-color: aqua;
} */
</style>