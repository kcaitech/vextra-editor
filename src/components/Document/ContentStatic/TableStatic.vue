<script setup lang="ts">
import { ImageShape, SymbolRefShape, SymbolShape } from '@kcdesign/data';

interface Props {
    data: ImageShape
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}
const props = defineProps<Props>();

</script>

<template>
    <rect x="0.5" y="0.5" width="15" height="16" stroke="black" fill="transparent"/>
    <line x1="5.5" x2="5.5" y2="17" stroke="black"/>
    <line y1="4.5" x2="16" y2="4.5" stroke="black"/>
    <line y1="8.5" x2="16" y2="8.5" stroke="black"/>
    <line y1="12.5" x2="16" y2="12.5" stroke="black"/>
    <line x1="10.5" x2="10.5" y2="17" stroke="black"/>
</template>