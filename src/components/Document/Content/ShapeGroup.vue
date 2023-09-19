<script setup lang="ts">
import { h } from 'vue';
import comsMap from './comsmap'
import { GroupShape } from "@kcdesign/data";
import { renderGroup as r } from "@kcdesign/data";
import { initCommonShape } from "./common";

const props = defineProps<{ data: GroupShape }>();
const common = initCommonShape(props);

function render() {
    const ret = r(h, props.data, comsMap, common.reflush);
    return ret;
}

</script>

<template>
    <render />
</template>
