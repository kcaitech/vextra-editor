<script setup lang="ts">
import { h } from 'vue';
import comsMap from './comsmap'
import { GroupShape, OverridesGetter } from "@kcdesign/data";
import { renderGroup as r } from "@kcdesign/data";
import { initCommonShape } from "./common";

const props = defineProps<{ data: GroupShape, overrides?: OverridesGetter }>();
const init = initCommonShape(props);

function render() {
    const ret = r(h, props.data, comsMap, props.overrides, init.override, init.reflush);
    return ret;
}

</script>

<template>
    <render />
</template>
