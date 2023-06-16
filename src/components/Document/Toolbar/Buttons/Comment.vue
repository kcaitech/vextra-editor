<script lang="ts" setup>
import ToolButton from '../ToolButton.vue';
import {} from 'vue';
import { Action, WorkSpace } from '@/context/workspace';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const props = defineProps<{
  active: boolean,
  workspace: WorkSpace,
}>();
const emit = defineEmits<{
  (e: "select", action: Action): void;
}>();
function select(action: Action) {
  props.workspace.keydown_c()
  emit('select', action);
}
</script>
<template>
  <el-tooltip class="box-item" effect="dark" :content="`${t('home.addComment')} &nbsp;&nbsp; C`" placement="bottom"
    :show-after="500" :offset="10" :hide-after="0">
    <ToolButton ref="button" @click="() => { select(Action.AddComment) }" :selected="props.active">
      <div class="svg-container">
        <svg-icon icon-class="comment"></svg-icon>
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

  >svg {
    width: 16px;
    height: 16px;
  }
}
</style>