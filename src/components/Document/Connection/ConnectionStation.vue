<script setup lang="ts">
import { Context } from "@/context";
import { ContactShape } from "@kcdesign/data";

const props = defineProps<{ context: Context }>();
const lines = props.context.selection.selectedPage!.connections as unknown as ContactShape[];

</script>

<template>
    <svg viewBox="0 0 100 100" width="100px" height="100px">

    </svg>
</template>

<style scoped lang="scss">

</style>