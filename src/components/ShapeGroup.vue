<script setup lang="ts">
import { h, defineProps } from 'vue';
import comsMap from './comsmap'
import { GroupShape } from "../data/shape";
import { render as gR } from "@/render/group";
import { transform } from '@/render/basic';

const props = defineProps<{ data: GroupShape, boolop: number }>();

function render() {
    return transform(gR(props.data, props.boolop, comsMap), h);
}

</script>

<template>
    <render />
</template>
