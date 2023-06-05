<script setup lang="ts">
import ToolButton from '../ToolButton.vue';
import {} from 'vue';
import { Action } from '@/context/workspace';
import { useI18n } from 'vue-i18n'
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
  <el-tooltip
    class="box-item"
    effect="dark"
    :content="`${t('shape.oval')} &nbsp;&nbsp; O`"
    placement="bottom"
    :show-after="500"
    :offset="10"
    :hide-after="0"
  >
  <ToolButton ref="button" @click="() => {select(Action.AddEllipse)}" :selected="props.active">
    <div class="svg-container">
      <svg-icon icon-class="pattern-ellipse"></svg-icon>
    </div>
  </ToolButton>
</el-tooltip>
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
    width: 15px;
    height: 15px;
  }
}
</style>