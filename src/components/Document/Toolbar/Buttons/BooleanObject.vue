<script lang="ts" setup>
import { ref, nextTick, onUpdated } from 'vue';
import ToolButton from '../ToolButton.vue';
import DropSelect from "./DropSelect.vue"
import { BoolOp } from '@kcdesign/data';
import { useI18n } from 'vue-i18n'
import Tooltip from '@/components/common/Tooltip.vue';
const { t } = useI18n()
type Button = InstanceType<typeof ToolButton>

const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const button = ref<Button>();
const visible = ref(false)
const selectBool = ref('union')
const boolType = ref(BoolOp.Union)
const boolName = ref('Union')
const emit = defineEmits<{
  (e: "changeBool", type: BoolOp, name: string): void;
}>();

const patterns = ((items: [string, any, BoolOp][]) => (items.map(item => ({ value: item[0], content: item[1], bool: item[2]}))))([
    ['union', 'union', BoolOp.Union],
    ['subtract', 'subtract', BoolOp.Subtract],
    ['intersection', 'intersection', BoolOp.Intersect],
    ['difference','difference', BoolOp.Diff],
    ['cohere', 'cohere', BoolOp.None]
]);

function showMenu(e: MouseEvent) {
    e.stopPropagation()
  if (popoverVisible.value) return popoverVisible.value = false;
  if (button.value?.toolButtonEl) {
    const el = button.value?.toolButtonEl;
    visible.value = false
    popoverVisible.value = true;
    nextTick(() => {
      if (popover.value) {
        popover.value.style.left = el.offsetLeft + 'px';
        popover.value.style.top = el.offsetHeight + 9 + 'px';

      }
    })
    document.addEventListener('click', onMenuBlur);
  }
}

const selector = (active: string, type: BoolOp) => {
    selectBool.value = active
    boolType.value = type
    popoverVisible.value = false;
    if(active === 'union') {
      boolName.value = 'Union'
    }else if (active === 'subtract') {
      boolName.value = 'Subtract'
    }else if (active === 'intersection') {
      boolName.value = 'Intersect'
    }else if (active === 'difference') {
      boolName.value = 'Exclude'
    }else if (active === 'cohere') {
      boolName.value = 'cohere'
    }
    emit('changeBool', type, boolName.value);
}

function onMenuBlur(e: MouseEvent) {
  if (e.target instanceof Element && !e.target.closest('.popover') && !e.target.closest('.menu')) {
    if (e.target.closest('.popover')) return;
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

const changeBool = () => {
    emit('changeBool', boolType.value, boolName.value);
}

onUpdated(() => {

})
</script>

<template>
     <div ref="popover" class="popover" tabindex="-1" v-if="popoverVisible">
        <template v-for="(item, index) in patterns" :key="item.value">
            <div class="line" v-if="index === 4"></div>
            <DropSelect @selectBool="selector" :lg="item.value" :select="item.content" :bool="item.bool" type="bool" :d="selectBool"></DropSelect>
        </template>
  </div>
  <el-tooltip class="box-item" effect="dark"
    :content="t(`bool.${selectBool}`)" placement="bottom" :show-after="600" :offset="10" :hide-after="0" :visible="popoverVisible ? false : visible">
      <ToolButton ref="button" @click="changeBool" :selected="false" @mouseenter.stop="onMouseenter"
        @mouseleave.stop="onMouseleave">
        <div class="svg-container">
            <svg-icon :icon-class="selectBool"></svg-icon>
        </div>
        <div class="menu" @click="showMenu">
          <svg-icon icon-class="down"></svg-icon>
        </div>
      </ToolButton>
    </el-tooltip >
</template>

<style lang="scss" scoped>
.svg-container {
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 3px;
  color: #ffffff;
  
  >svg {
    width: 17px;
    height: 17px;
  }
}

.menu {
  width: 10px;
  height: 28px;
  display: flex;
  padding-right: 4px;
  margin-right: 2px;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  transition: 0.3s;

  >svg {
    width: 80%;
    height: 60%;
  }
}

.menu:hover {
  transform: translateY(4px);
}

.popover {
  position: absolute;
  z-index: 999;
  width: 180px;
  height: auto;
  background-color: var(--theme-color);
  border-radius: 4px;
  outline: none;
  padding: var(--default-padding-half) 0;
  .line {
        width: 100%;
        height: 11px;
        border-width: 5px 0 5px 0;
        border-style: solid;
        border-color: var(--theme-color);
        box-sizing: border-box;
        background-color: rgba(255, 255, 255, .5)
    }
}
</style>