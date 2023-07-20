<script setup lang="ts">
import ToolButton from '../ToolButton.vue';
import {} from 'vue';
import { Action } from '@/context/workspace';
import { useI18n } from 'vue-i18n'
import Tooltip from '@/components/common/Tooltip.vue';
const { t } = useI18n()
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
  <Tooltip :content="`${t('shape.arrow')} &nbsp;&nbsp; Shift L`">
    <ToolButton ref="button" @click="() => {select(Action.AddArrow)}" :selected="props.active">
      <div class="svg-container">
        <svg-icon icon-class="pattern-arrow"></svg-icon>
      </div>
    </ToolButton>
  </Tooltip>
</template>
<style scoped lang="scss">
.svg-container {
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  > svg {
    width: 14px;
    height: 14px;
  }
}
</style>