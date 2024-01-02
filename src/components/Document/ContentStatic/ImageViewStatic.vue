<script setup lang="ts">
import { ImageShape, SymbolRefShape, SymbolShape } from '@kcdesign/data';
import { h } from 'vue';
import { renderImageStatic as r } from "@kcdesign/data"
import { IMAGE_DEFAULT } from '../Content/common';
interface Props {
    data: ImageShape
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}
const props = defineProps<Props>();

const render = () => {
    return r(h, props.data, IMAGE_DEFAULT, props.varsContainer);
}

</script>

<template>
    <render></render>
</template>