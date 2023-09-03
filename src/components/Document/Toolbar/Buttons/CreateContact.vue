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
  <Tooltip :content="`${t('home.contact')} &nbsp;&nbsp; X`">
    <ToolButton ref="button" @click="() => { select(Action.AddContact) }" :selected="props.active">
      <div class="svg-container">
        <svg-icon icon-class="pattern-contact"></svg-icon>
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

  >svg {
    width: 15px;
    height: 15px;
  }
}
</style>