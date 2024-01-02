<script setup lang="ts">
import {RectShape, SymbolRefShape, SymbolShape} from '@kcdesign/data';
import {h} from 'vue';
import {renderPathShapeStatic as r} from "@kcdesign/data";

interface Props {
    data: RectShape
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}
const props = defineProps<Props>();
function render() {
    return r(h, props.data, props.varsContainer);
}
</script>

<template>
    <render></render>
</template>