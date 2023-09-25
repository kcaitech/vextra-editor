<script setup lang="ts">
import { TextShape } from '@kcdesign/data';
import { h } from 'vue';
import { renderTextShape as r } from "@kcdesign/data"
import { initCommonShape } from './common';

const props = defineProps<{ data: TextShape }>();
const common = initCommonShape(props);

function render() {
    const ret = r(h, props.data, common.reflush);
    return ret;
}

</script>

<template>
    <render />
</template>