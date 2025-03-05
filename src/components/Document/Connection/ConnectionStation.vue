<script setup lang="ts">
import { Context } from "@/context";
import { ContactShape } from "@kcdesign/data";

const props = defineProps<{ context: Context }>();
const lines = props.context.selection.selectedPage!.connections as unknown as ContactShape[];

</script>

<template>
    <svg></svg>
</template>

<style scoped lang="scss">

</style>