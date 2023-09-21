
<script setup lang="ts">
import { PathShape } from '@kcdesign/data';
import { h } from 'vue';
import { renderPathShape as r } from "@kcdesign/data";
import { initCommonShape } from './common';

const props = defineProps<{ data: PathShape }>();
const common = initCommonShape(props);

function render() {
    const ret = r(h, props.data, common.reflush);
    return ret;
}
</script>

<template>
    <render />
</template>