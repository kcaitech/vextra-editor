<script setup lang="ts">
import { h } from 'vue';
import comsMap from './comsmap'
import { TableCell } from "@kcdesign/data";
import { render as r } from "@/render/group";
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
