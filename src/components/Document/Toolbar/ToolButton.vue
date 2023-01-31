<template>
  <div :class="{'tool-button': true, 'tool-button-invalid': invalid, 'tool-button-selected': !!selected}">
    <slot />
  </div>
</template>
<script setup lang="ts">
import { computed, defineProps } from 'vue';

const props = defineProps<{valid?: boolean, selected?: boolean}>();
const invalid = computed(() => {
    return props.valid === undefined ? false : !props.valid;
})

</script>
<style scoped>
.tool-button {
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  width: 28px;
  height: 28px;
  color: white;
}
.tool-button:hover,
.tool-button:active {
  background-color: #333333;
}
.tool-button-invalid {
    color: gray;
}
.tool-button-selected {
    color: blue;
}
</style>
