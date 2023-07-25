<script lang="ts" setup>
import ToolButton from '../ToolButton.vue';
import { WorkSpace, Perm } from '@/context/workspace';
import { Action } from "@/context/tool";
import { useI18n } from 'vue-i18n';
import Tooltip from '@/components/common/Tooltip.vue';
const { t } = useI18n()
const props = defineProps<{
  active: boolean,
  workspace: WorkSpace,
}>();
const emit = defineEmits<{
  (e: "select", action: Action): void;
}>();
function select(action: Action) {
  if (props.workspace.documentPerm === Perm.isRead) return;
  props.workspace.keydown_c()
  emit('select', action);
}
</script>
<template>
  <Tooltip :content="`${t('home.addComment')} &nbsp;&nbsp; C`">
    <ToolButton ref="button" @click="() => { select(Action.AddComment) }" :selected="props.active">
      <div class="svg-container">
        <svg-icon icon-class="comment"></svg-icon>
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
    width: 16px;
    height: 16px;
  }
}
</style>