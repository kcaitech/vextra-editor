<script setup lang="ts">
import {h} from 'vue';
import comsMap from '../Content/comsmap';
import {GroupShape, SymbolRefShape, SymbolShape, RenderTransform, Variable} from "@kcdesign/data";
import {renderGroupStatic as r} from "@kcdesign/data";
interface Props {
    data: GroupShape
    transx?: RenderTransform
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}
const props = defineProps<Props>();

function render() {
    return r(h, props.data, comsMap, props.transx, props.varsContainer);
}

</script>

<template>
    <render/>
</template>
