<script setup lang="ts">
import { ref, nextTick, watch, defineProps,defineEmits, onMounted, onUnmounted, onUpdated } from 'vue';
import ToolButton from '../ToolButton.vue';
import { Action } from '@/context/workspace';
import DropSelect from "./DropSelect.vue"
type Button = InstanceType<typeof ToolButton>

const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const button = ref<Button>();
const selected = ref<Action>(Action.AutoV);
const selects = ref<Action>(Action.AutoV);
const props = defineProps<{
  active: boolean,
  d: Action
}>();
const emit = defineEmits<{
    (e: "select", action: Action): void;
}>();
function select(action: Action) {    
    emit('select', action);
}

const patterns = ((items: [string, Action, string][]) => (items.map(item => ({ value: item[0], content: item[1], key: item[2]}))))([
    ['object_selector', Action.AutoV, 'V'],
    ['scale', Action.AutoK, 'K']
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
  selected.value = active
 
}

function onMenuBlur() {
  if (popover.value) {
    popover.value.removeEventListener('blur', onMenuBlur);
  }
  var timer = setTimeout(() => {
    popoverVisible.value = false;
    clearTimeout(timer)
  }, 100)
}
onUpdated(()=> {
  if(props.d === Action.AutoV || props.d === Action.AutoK) {
    selects.value = props.d
  }  
})
</script>

<template>
  <div ref="popover" class="popover" tabindex="-1" v-if="popoverVisible">
    <template v-for="item in patterns" :key="item.value">
      <DropSelect @selector="selector" :lg="item.value" :quick="item.key" :d="d" :select="item.content"></DropSelect>
    </template>
    
  </div>
  <ToolButton ref="button" @click="() => {select(selected)}" :selected="props.active">
    <div class="svg-container" title="Cursor">
      <svg-icon :icon-class="props.d === selected ? props.d: selects"></svg-icon>
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
  width: 180px;
  height: auto;
  background-color: var(--theme-color);
  border-radius: 4px;
  outline: none;
  padding: var(--default-padding-half) 0;
}

</style>