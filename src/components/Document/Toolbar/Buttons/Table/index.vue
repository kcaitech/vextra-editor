<script lang="ts" setup>
import ToolButton from '../../ToolButton.vue';
import { ref, nextTick } from 'vue';
import { Action } from "@/context/tool";
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import Tooltip from '@/components/common/Tooltip.vue';
import CreateTable from './CreateTable.vue';
const { t } = useI18n()
interface Props {
    context: Context
    active: boolean
}
type Button = InstanceType<typeof ToolButton>;
const props = defineProps<Props>();
const button = ref<Button>();
const visible = ref(false);
const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const emit = defineEmits<{
    (e: "select", action: Action): void;
}>();
function select(action: Action) {   
    emit('select', action);
}

function showTable(e: MouseEvent) {
    e.stopPropagation()
  if (button.value?.toolButtonEl) {
    select(Action.AddTable);
    const el = button.value?.toolButtonEl;
    visible.value = false;
    popoverVisible.value = true;
    nextTick(() => {
      if (popover.value) {
        popover.value.style.left = el.offsetLeft + 'px';
        popover.value.style.top = el.offsetHeight + 9 + 'px';

      }
    })
    document.addEventListener('click', onTableBlur);
  }
}

function onTableBlur(e: MouseEvent) {
  if (e.target instanceof Element && !e.target.closest('.popover') && !e.target.closest('.svg-table')) {
    if (e.target.closest('.popover')) return;
    var timer = setTimeout(() => {
      select(Action.AutoV);
      popoverVisible.value = false;
      clearTimeout(timer);
      document.removeEventListener('click', onTableBlur);
    }, 10)
  }
}

const closeInsert = () => {
  popoverVisible.value = false
}

var timer: any = null;
const onMouseenter = () => {
  timer = setTimeout(() => {
    visible.value = true;
    clearTimeout(timer);
  }, 600);
}
const onMouseleave = () => {
  clearTimeout(timer);
  visible.value = false;
}
</script>

<template>
    <div ref="popover" class="popover" tabindex="-1" v-if="popoverVisible">
    <!-- <div ref="popover" class="popover" tabindex="-1"> -->
        <CreateTable :context="context" @close="closeInsert"></CreateTable>
    </div>
    <Tooltip :content="`${t('table.table')}`">
        <ToolButton ref="button" :selected="props.active" 
            @mouseenter.stop="onMouseenter" @mouseleave.stop="onMouseleave">
            <div class="svg-table" @click="showTable">
                <svg-icon icon-class="pattern-table"></svg-icon>
            </div>
        </ToolButton>
    </Tooltip>
</template>

<style lang="scss" scoped>
.svg-table {
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
.popover {
  position: absolute;
}
</style>