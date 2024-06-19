<script setup lang="ts">
// import { ref, nextTick, onUpdated } from 'vue';
import ToolButton from './ToolButton.vue';
import { Action } from "@/context/tool";
// import DropSelect from "./DropSelect.vue"
import { useI18n } from 'vue-i18n'
import { Context } from '@/context';
const { t } = useI18n()
// type Button = InstanceType<typeof ToolButton>

// const popoverVisible = ref<boolean>(false);
// const popover = ref<HTMLDivElement>();
// const button = ref<Button>();
// const selected = ref<string>(Action.AutoV);
// const selects = ref<string>(Action.AutoV);
// const visible = ref(false)
const props = defineProps<{
  context: Context,
  params: {
    active: boolean,
    // d: string,
    is_lable: boolean,
    edit: boolean,
    select: (action: string) => void
  }
}>();
// const emit = defineEmits<{
//   (e: "select", action: string): void;
// }>();
function select() {
  // emit('select', Action.AutoV);
  props.params.select(Action.AutoV)
}

</script>

<template>
  <el-tooltip class="box-item" effect="dark" :content="`${t('home.object_selector')} &nbsp;&nbsp; V`" placement="bottom"
    :show-after="600" :offset="10" :hide-after="0">
    <ToolButton @click="select" :selected="props.params.active"
      :style="{ width: !(props.params.edit && !props.params.is_lable) ? '32px' : '32px' }">
      <div class="svg-container"
        :style="{ marginLeft: !(props.params.edit && !props.params.is_lable) ? '0px' : '0px' }">
        <svg-icon icon-class="drag"></svg-icon>
      </div>
    </ToolButton>
  </el-tooltip>
</template>

<style scoped lang="scss">
.svg-container {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 3px;
  color: #ffffff;
  padding: 6px 6px 6px 6px;
  box-sizing: border-box;

  >svg {
    width: 18px;
    height: 18px;
  }
}

.menu {
  width: 20px;
  height: 32px;
  display: flex;
  //padding-right: 4px;
  //margin-right: 2px;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  transition: 0.3s;
  padding: 10px 8px 10px 0;
  box-sizing: border-box;

  >svg {
    width: 12px;
    height: 12px;
  }
}

.menu:hover {
  transform: translateY(4px);
}

.popover {
  position: absolute;
  z-index: 999;
  width: 157px;
  height: auto;
  background-color: #262626;
  border-radius: 4px;
  outline: none;
  padding: 4px 0;
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
}
</style>