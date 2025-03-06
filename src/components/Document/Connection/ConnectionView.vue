<script setup lang="ts">
import { ConnectionLineViewContext } from "@/components/Document/Connection/datacontext";
import { Context } from "@/context";
import { ConnectionLineView } from "@/components/Document/Connection/connectionview";

const props = defineProps<{ context: Context }>();

const ctx = new ConnectionLineViewContext();
const viewProps = { data: props.context.selection.selectedPage!.data.childs[0] };
const view = new ConnectionLineView(ctx, viewProps);
console.log('--view--', view, view.clientX, view.clientY);
</script>

<template>

</template>

<style scoped lang="scss">

</style>