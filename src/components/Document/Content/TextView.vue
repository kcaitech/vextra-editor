<script setup lang="ts">
import { OverridesGetter, TextShape } from '@kcdesign/data';
import { h } from 'vue';
import { renderTextShape as r } from "@kcdesign/data"
import { initCommonShape } from './common';

const props = defineProps<{ data: TextShape, overrides?: OverridesGetter }>();
const init = initCommonShape(props);

function render() {
    return r(h, props.data, init.override, init.reflush);
}

</script>

<template>
    <render />
</template>