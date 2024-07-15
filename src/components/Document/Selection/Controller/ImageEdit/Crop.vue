<script setup lang="ts">
import { Context } from '@/context';
import { Matrix } from '@kcdesign/data';

interface Props {
    context: Context
    matrix: Matrix
}
const props = defineProps<Props>();
</script>

<template>
     <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="transform: translate(0px, 0px); position: absolute;">
        <g >
           
        </g>
    </svg>
</template>

<style scoped lang="scss"></style>