<script setup lang="ts">
import {RectShape, RenderTransform, SymbolRefShape, SymbolShape, Variable} from '@kcdesign/data';
import {h} from 'vue';
import {renderPathShapeStatic as r} from "@kcdesign/data";

interface Props {
    data: RectShape
    transx?: RenderTransform
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}
const props = defineProps<Props>();
function render() {
    return r(h, props.data, props.transx, props.varsContainer);
}
</script>

<template>
    <render></render>
</template>