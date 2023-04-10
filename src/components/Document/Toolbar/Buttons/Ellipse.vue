<script setup lang="ts">
import ToolButton from '../ToolButton.vue';
import { defineEmits, defineProps } from 'vue';
import { Action } from '@/context/workspace';

const props = defineProps<{
    active: boolean,
}>();
const emit = defineEmits<{
    (e: "select", action: Action): void;
}>();
function select(action: Action) {    
    emit('select', action);
}
</script>
<template>
  <ToolButton ref="button" @click="() => {select(Action.AddEllipse)}" :selected="props.active">
    <div class="svg-container" title="ellipse">
      <svg-icon icon-class="pattern-ellipse"></svg-icon>
    </div>
  </ToolButton>
</template>
<style scoped lang="scss">
.svg-container {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  > svg {
    width: 50%;
    height: 50%;
  }
}
</style>