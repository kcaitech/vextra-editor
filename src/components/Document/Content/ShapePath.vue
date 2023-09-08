
<script setup lang="ts">
import { OverridesGetter, PathShape } from '@kcdesign/data';
import { h } from 'vue';
import { renderPathShape as r } from "@kcdesign/data";
import { initCommonShape } from './common';

const props = defineProps<{ data: PathShape , overrides?: OverridesGetter }>();
const init = initCommonShape(props);

function render() {
    return r(h, props.data, init.override, init.reflush);
}
</script>

<template>
    <render />
</template>