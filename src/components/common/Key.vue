<script lang="ts" setup>
interface Props {
  key: string
}
const props = defineProps<Props>();

</script>

<template>
  <span>
    {{ key }}
  </span>
</template>
<style scoped lang="scss"></style>