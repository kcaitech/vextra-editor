<script setup lang="ts">
import { ref, nextTick, watch, defineProps,defineEmits } from 'vue';
import ToolButton from '../ToolButton.vue';
import { Action } from '@/context/workspace';
import DropSelect from "./DropSelect.vue"
import { Tools } from '@/context/toolbar';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
type Button = InstanceType<typeof ToolButton>

const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const button = ref<Button>();
const selected = ref<Action>(Action.Auto);
const props = defineProps<{
  active: boolean
}>();
const emit = defineEmits<{
    (e: "select", action: Action): void;
}>();
function select(action: Action) {    
    emit('select', action);
}

const patterns = ((items: [string, Action, string][]) => (items.map(item => ({ value: item[0], content: item[1], key: item[2]}))))([
    ['Rectangle', Action.AddRect, 'R'],
    ['Line', Action.AddLine, 'L'],
    ['object_selector', Action.Auto, 'K']
]);

function showMenu() {
  if (popoverVisible.value) return popoverVisible.value = false;
  if (button.value?.toolButtonEl) {
    const el = button.value?.toolButtonEl;
    
    popoverVisible.value = true;
    nextTick(() => {
      if (popover.value) {      
        popover.value.style.left = el.offsetLeft + 'px';
        popover.value.style.top = el.offsetHeight + 2 + 'px';
      } 
    })
  }
}

watch(popoverVisible, (val) => {
  if (val) {
    nextTick(() => {
      if (popover.value) {
        popover.value.addEventListener('blur', onMenuBlur);
        popover.value.focus();
      }
    })
  }
})

const selector = (active: Action) => {
  console.log(active,'active');
  
}

function onMenuBlur() {
  // if (popover.value) {
  //   popover.value.removeEventListener('blur', onMenuBlur);
  // }
  // var timer = setTimeout(() => {
  //   popoverVisible.value = false;
  //   clearTimeout(timer)
  // }, 100)
}
</script>

<template>
  <div ref="popover" class="popover" tabindex="-1" v-if="popoverVisible">
    <!-- <div class="container-change">
      <div style="display: flex; align-items: center;">
        <div class="choose"></div>
        <div class="svg-container" title="Cursor">
          <svg-icon icon-class="cursor"></svg-icon>
        </div>
        <div class="select">{{ t('home.object_selector') }}</div>
      </div>
      <span class="quick">V</span>
    </div> -->
    <template v-for="item in patterns" :key="item.value">
      <DropSelect @selector="selector" :active="props.active" :lg="item.value" :quick="item.key" :select="item.content" :pattern="selected" ></DropSelect>
    </template>
    
    
  </div>
  <ToolButton ref="button" @click="() => {select(Action.Auto)}" :selected="props.active">
    <div class="svg-container" title="Cursor">
      <svg-icon icon-class="cursor"></svg-icon>
    </div>
    <div class="menu" @click="showMenu">
      <svg-icon icon-class="down"></svg-icon>
    </div>
  </ToolButton>
</template>

<style scoped lang="scss">
.svg-container {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  > svg {
    width: 70%;
    height: 70%;
  }
}
.menu {
  width: 10px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  transition: 0.3s;
  > svg {
    width: 100%;
    height: 80%;
  }
}
.menu:hover {
  transform: translateY(4px);
}
.popover {
  position: absolute;
  z-index: 999;
  width: 200px;
  height: 260px;
  background-color: var(--theme-color);
  border-radius: 4px;
  outline: none;
  padding: var(--default-padding-half) 0;
}
.container-change {
  display: flex;
  color: var(--theme-color-anti);
  width: 100%;
  height: 32px;
  align-items: center;
  justify-content: space-around;
  .svg-container {
    svg {
      width: 60%;
      height: 60%;
    }
  }
}
.container-change:hover {
  background-color: var(--active-color);
}
.choose {
  box-sizing: border-box;
  width: 13px;
  height: 9px;
  border-width: 0 0 2px 2px;
  border-style: solid;
  border-color: var(--theme-color-anti);
  transform: rotate(-45deg) translateY(-30%);
}
.select {
  font-size: var(--font-default-fontsize);
}
</style>