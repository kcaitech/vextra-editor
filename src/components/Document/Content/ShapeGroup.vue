<script setup lang="ts">
import { h } from 'vue';
import comsMap from './comsmap'
import { GroupShape, OverridesGetter } from "@kcdesign/data";
import { renderGroup as r } from "@kcdesign/data";
import { makeReflush } from "./common";

const props = defineProps<{ data: GroupShape, overrides?: OverridesGetter }>();
const reflush = makeReflush(props);

function render() {
    const ret = r(h, props.data, comsMap, props.overrides, reflush.value ? reflush.value : undefined);
    return ret;
}

</script>

<template>
    <render />
</template>
