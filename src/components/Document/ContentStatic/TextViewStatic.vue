<script setup lang="ts">
import {TextShape, SymbolRefShape, SymbolShape} from '@kcdesign/data';
import { h } from 'vue';
import { renderTextStatic as r } from "@kcdesign/data"
interface Props {
    data: TextShape
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}
const props = defineProps<Props>();
function render() {
    return r(h, props.data, props.varsContainer);
}
</script>

<template>
    <render />
</template>