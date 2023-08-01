<script setup lang="ts">
interface Props {
  d: string
}
const props = defineProps<Props>();
</script>
<template>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :width="10" :height="10"
    overflow="visible" viewBox="0 0 10 10">
    <path :d="props.d" fill="transparent" stroke="#000" stroke-width="0.6px"></path>
  </svg>
</template>
