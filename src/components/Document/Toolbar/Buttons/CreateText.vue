<script setup lang="ts">
import ToolButton from '../ToolButton.vue';
import { Action } from "@/context/tool";
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
  <Tooltip :content="`${t('attr.text')} &nbsp;&nbsp; T`">
    <ToolButton ref="button" @click="() => { select(Action.AddText) }" :selected="props.active" style="width: 32px">
      <div class="svg-container">
        <svg-icon icon-class="text"></svg-icon>
      </div>
    </ToolButton>
  </Tooltip>
</template>
<style scoped lang="scss">
.svg-container {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
    padding: 6px 6px 6px 6px;
    box-sizing: border-box;

  >svg {
      width: 20px;
      height: 20px;
  }
}
</style>