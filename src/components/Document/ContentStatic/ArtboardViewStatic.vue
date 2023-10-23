<script setup lang="ts">
import {h, ref} from 'vue';
import comsMap from '../Content/comsmap'
import {Artboard} from '@kcdesign/data';
import {renderArtboardStatic as r} from "@kcdesign/data"

const props = defineProps<{ data: Artboard }>();
const reflush = ref(0);

const render = () => {
    return r(h, props.data, comsMap, reflush.value !== 0 ? reflush.value : undefined);
}

</script>

<template>
    <render></render>
</template>