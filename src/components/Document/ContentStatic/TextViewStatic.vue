<script setup lang="ts">
import {TextShape, RenderTransform, SymbolRefShape, SymbolShape, Variable} from '@kcdesign/data';
import { h } from 'vue';
import { renderTextStatic as r } from "@kcdesign/data"
interface Props {
    data: TextShape
    transx?: RenderTransform
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}
const props = defineProps<Props>();
function render() {
    const consumedVars: { slot: string, vars: Variable[] }[] = [];
    return r(h, props.data, props.transx, props.varsContainer, consumedVars);
}
</script>

<template>
    <render />
</template>