<script lang="ts" setup>
import ToolButton from '../ToolButton.vue';
import { Perm } from '@/context/workspace';
import { Action } from "@/context/tool";
import { useI18n } from 'vue-i18n';
import Tooltip from '@/components/common/Tooltip.vue';
import { Context } from '@/context';
const { t } = useI18n()
const props = defineProps<{
  active: boolean,
  context: Context,
}>();
const emit = defineEmits<{
  (e: "select", action: Action): void;
}>();
function select(action: Action) {
  if (props.context.workspace.documentPerm === Perm.isRead) {
    return;
  }
  props.context.tool.setAction(Action.AddComment)
  emit('select', action);
}
</script>
<template>
  <Tooltip :content="`${t('home.addComment')} &nbsp;&nbsp; C`">
    <ToolButton ref="button" @click="() => { select(Action.AddComment) }" :selected="props.active" style="width: 32px">
      <div class="svg-container">
        <svg-icon icon-class="comment"></svg-icon>
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