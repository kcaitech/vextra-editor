<script setup lang="ts">
import { h } from 'vue';
import comsMap from './comsmap'
import { TableCell } from "@kcdesign/data";
import { renderGroup as r } from "@kcdesign/data";
import { makeReflush } from "./common";

const props = defineProps<{ data: TableCell }>();
const reflush = makeReflush(props);

function render() {
    const ret = r(h, props.data, comsMap, reflush.value ? reflush.value : undefined);
    return ret;
}

</script>

<template>
    <render />
</template>
