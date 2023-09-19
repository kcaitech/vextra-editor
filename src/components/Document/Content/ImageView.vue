<script setup lang="ts">
import { ImageShape } from '@kcdesign/data';
import { h } from 'vue';
import { renderImage as r } from "@kcdesign/data"
import { IMAGE_DEFAULT, initCommonShape } from './common';

const props = defineProps<{ data: ImageShape }>();
const common = initCommonShape(props);

const render = () => {
    const ret = r(h, props.data, IMAGE_DEFAULT, common.reflush);
    return ret;
}

</script>

<template>
    <render></render>
</template>