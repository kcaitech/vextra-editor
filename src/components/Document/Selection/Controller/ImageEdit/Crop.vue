<script setup lang="ts">
import { Context } from '@/context';

interface Props {
    context: Context
}
const props = defineProps<Props>();
</script>

<template>
    <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" overflow="visible"
         :width="100" :height="100" viewBox="0 0 100 100" style="transform: translate(0px, 0px); position: absolute;">
        <g></g>
    </svg>
</template>

<style scoped lang="scss"></style>