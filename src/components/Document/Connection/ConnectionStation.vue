<script setup lang="ts">

import ConnectionView from "@/components/Document/Connection/ConnectionView.vue";
import { Context } from "@/context";

const props = defineProps<{ context: Context }>();

</script>

<template>
    <ConnectionView :context="context"/>
</template>

<style scoped lang="scss">

</style>