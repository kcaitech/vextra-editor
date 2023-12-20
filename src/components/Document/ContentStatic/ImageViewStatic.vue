<script setup lang="ts">
import { ImageShape, SymbolRefShape, SymbolShape, RenderTransform, Variable } from '@kcdesign/data';
import { h } from 'vue';
import { renderImageStatic as r } from "@kcdesign/data"
import { IMAGE_DEFAULT } from '../Content/common';
interface Props {
    data: ImageShape
    transx?: RenderTransform
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}
const props = defineProps<Props>();

const render = () => {
    return r(h, props.data, IMAGE_DEFAULT, props.transx, props.varsContainer);
}

</script>

<template>
    <render></render>
</template>