<script setup lang="ts">
import { ref, nextTick, onUpdated } from 'vue';
import ToolButton from './ToolButton.vue';
import { Action } from "@/context/tool";
import DropSelect from "./DropSelect.vue"
import { useI18n } from 'vue-i18n'
import Tooltip from '@/components/common/Tooltip.vue';
import { Context } from '@/context';
const { t } = useI18n()
type Button = InstanceType<typeof ToolButton>

const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const button = ref<Button>();
const selected = ref<Action>(Action.AutoV);
const selects = ref<Action>(Action.AutoV);
const visible = ref(false)
const props = defineProps<{
  context: Context,
  params: {
    active: boolean,
    d: Action,
    is_lable: boolean,
    edit: boolean
  }
}>();
const emit = defineEmits<{
  (e: "select", action: Action): void;
}>();
function select(action: Action) {
  emit('select', action);
}

const patterns = ((items: [string, Action, string][]) => (items.map(item => ({ value: item[0], content: item[1], key: item[2] }))))([
  ['object_selector', Action.AutoV, 'V'],
  ['scale', Action.AutoK, 'K']
]);

function showMenu() {
  if (popoverVisible.value) return popoverVisible.value = false;
  if (button.value?.toolButtonEl) {
    const el = button.value?.toolButtonEl;
    visible.value = false
    popoverVisible.value = true;
    nextTick(() => {
      if (popover.value) {
        popover.value.style.left = el.offsetLeft + 'px';
        popover.value.style.top = el.offsetHeight + 13 + 'px';

      }
    })
    document.addEventListener('click', onMenuBlur);
  }
}

const selector = (active: Action) => {
  selected.value = active
  emit('select', active);
  popoverVisible.value = false;
}

function onMenuBlur(e: MouseEvent) {
  if (e.target instanceof Element && !e.target.closest('.popover') && !e.target.closest('.menu')) {
    var timer = setTimeout(() => {
      popoverVisible.value = false;
      clearTimeout(timer)
      document.removeEventListener('click', onMenuBlur);
    }, 10)
  }
}
var timer: any = null
const onMouseenter = () => {
  timer = setTimeout(() => {
    visible.value = true
    clearTimeout(timer)
  }, 600)
}
const onMouseleave = () => {
  clearTimeout(timer)
  visible.value = false
}

onUpdated(() => {
  if (props.params.d === Action.AutoV || props.params.d === Action.AutoK) {
    if (props.params.d === Action.AutoV) {
      selects.value = props.params.d
    } else {
      selects.value = props.params.d
    }
  }
})

</script>

<template>
  <el-tooltip class="box-item" effect="dark"
    :content="selects === 'drag' ? `${t('home.object_selector')} &nbsp;&nbsp; V` : `${t('home.scale')} &nbsp;&nbsp; K`"
    placement="bottom" :show-after="600" :offset="10" :hide-after="0" :visible="popoverVisible ? false : visible">
    <ToolButton ref="button" @click="() => { select(selects) }" :selected="props.params.active" @mouseenter.stop="onMouseenter"
      @mouseleave.stop="onMouseleave" :style="{ width: !(props.params.edit && !props.params.is_lable) ? '32px' : '32px' }">
      <div class="svg-container" :style="{ marginLeft: !(props.params.edit && !props.params.is_lable) ? '0px' : '0px' }">
        <svg-icon :icon-class="props.params.d === selected ? props.params.d : selects"></svg-icon>
      </div>
      <!-- <div class="menu" @click="showMenu" v-if="edit && !is_lable">
        <svg-icon icon-class="white-down"></svg-icon>
      </div> -->
    </ToolButton>
  </el-tooltip>
    <div ref="popover" class="popover" tabindex="-1" v-if="popoverVisible">
        <template v-for="item in patterns" :key="item.value">
            <DropSelect @selector="selector" :lg="item.value" :quick="item.key" :d="props.params.d" :select="item.content" type="cursor">
            </DropSelect>
        </template>
    </div>
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