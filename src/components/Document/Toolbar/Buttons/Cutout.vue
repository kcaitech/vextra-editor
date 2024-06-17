<script setup lang="ts">
import ToolButton from './ToolButton.vue';
import {} from 'vue';
import { Action } from "@/context/tool";
import { useI18n } from 'vue-i18n'
import Tooltip from '@/components/common/Tooltip.vue';
import { Context } from '@/context';
const { t } = useI18n()
const props = defineProps<{
  context: Context,
  params: {
    active: boolean,
  }
}>();
const emit = defineEmits<{
    (e: "select", action: string): void;
}>();
function select(action: string) {    
    emit('select', action);
}
</script>
<template>
  <Tooltip :content="`${t('cutoutExport.cutout')} &nbsp;&nbsp; S`">
    <ToolButton ref="button" @click="() => {select(Action.AddCutout)}" :selected="props.params.active" style="width: 32px">
      <div class="svg-container">
        <svg-icon icon-class="cutout"></svg-icon>
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
      width: 18px;
      height: 18px;
  }
}
</style>