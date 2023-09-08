<script setup lang="ts">
import { ImageShape, OverridesGetter } from '@kcdesign/data';
import { h } from 'vue';
import { renderImage as r } from "@kcdesign/data"
import { IMAGE_DEFAULT, initCommonShape } from './common';

const props = defineProps<{ data: ImageShape, overrides?: OverridesGetter }>();
const init = initCommonShape(props);

const render = () => {
    return r(h, props.data, IMAGE_DEFAULT, init.override, init.reflush);
}

</script>

<template>
    <render></render>
</template>