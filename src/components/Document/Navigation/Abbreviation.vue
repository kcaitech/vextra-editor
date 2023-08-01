<script setup lang="ts">
import { Shape } from '@kcdesign/data';
interface Props {
  d: string
}
const props = defineProps<Props>();
</script>
<template>
  <div class="contain">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :width="10" :height="10"
      viewBox="0 0 10 10" style="background-color: antiquewhite;">
      <path :d="props.d" fill="transparent" stroke="#000" stroke-width="1px"></path>
    </svg>
  </div>
</template>
<style lang="scss" scoped>
.contain {
  width: 10px;
  height: 10px;
  margin-left: 2px
}
</style>