<script setup lang="ts">
import { ref, nextTick, defineEmits } from 'vue';
import ToolButton from '../ToolButton.vue';
import { useI18n } from 'vue-i18n';
import FrameChild from './FrameChild.vue'
import { Action, WorkSpace } from "@/context/workspace";

const { t } = useI18n();

type Button = InstanceType<typeof ToolButton>

const props = defineProps<{
  workspace: WorkSpace,
  active: boolean
}>()
const emit = defineEmits<{
    (e: "select", action: Action): void;
}>();
const visible = ref(false)
function select(action: Action) {  
    emit('select', action);
}
const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const button = ref<Button>();
const frame = ref<HTMLDivElement>();
const hoverIndex = ref<number>(-1);
function showMenu(e: MouseEvent) {
  if (popoverVisible.value) return popoverVisible.value = false;
  if (button.value?.toolButtonEl) {
    let el = button.value?.toolButtonEl;
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

function onMenuBlur(e: MouseEvent) {
  if (e.target instanceof Element && !e.target.closest('.popover') && !e.target.closest('.menu-f')) {
    var timer = setTimeout(() => {
      popoverVisible.value = false;
      clearTimeout(timer)
      document.removeEventListener('click', onMenuBlur);
    }, 10)
  }
  
}

const left = ref(0)
const showChildFrame = (i: number) => {
    hoverIndex.value = i
    if(popover.value) {
      left.value = popover.value.offsetWidth
    }
  
}

const closeChildFrame = () => {
  hoverIndex.value = -1
}

const frames = ['frame.phone', 'frame.tablet', 'frame.deskdop', 'frame.presentation', 'frame.watch', 'frame.paper', 'frame.social_media']

const framesChild = [
  [['iphone 14', '390 × 844'], ['iphone 14 Pro', '393 × 852']],
  [['Surface Pro 8', '1440 × 960'], ['iPad mini 8.3', '744 × 1133']],
  [['MacBook Air', '1280 × 832'], ['Desktop', '1440 × 1024']],
  [['Slide 16:9', '1920 × 1080'], ['Slide 4:3', '1024 × 768']],
  [['Apple Watch 41mm', '176 × 215'], ['Apple Watch 45mm', '198 × 242']],
  [['A4', '595 × 842'], ['A5', '420 × 595']],
  [['Twitter post', '1200 × 675'], ['Twitter header', '1500 × 500']]
]

const closeFrame = () => {
  popoverVisible.value = false;
  hoverIndex.value = -1
}
const isSelect = () => {
  select(Action.AddFrame)
  props.workspace.setFrame({width: 100, height: 100})

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

</script>

<template>
  <div ref="popover" class="popover" tabindex="-1" v-if="popoverVisible">
    <div>
      <span>{{ t('frame.custom') }}</span>
    </div>
    <div ref="frame" v-for="(item, i) in frames" :key="i" style="position: relative;">
      <div class="frame" @mouseenter="showChildFrame(i)" @mouseleave="closeChildFrame">
        <span>{{ t(`${item}`) }}</span>
        <div class="triangle"></div>
        <FrameChild :workspace="props.workspace" :childFrame="hoverIndex === i" :top="-8" :left="left" :framesChild="framesChild[i]" @closeFrame="closeFrame" ></FrameChild>
      </div>
    </div>
  </div>
  <el-tooltip
    class="box-item"
    effect="dark"
    :content="`${t('shape.artboard')} &nbsp;&nbsp; F`"
    placement="bottom"
    :show-after="500"
    :offset="10"
    :hide-after="0"
    :visible="popoverVisible ? false : visible"
  >
  <ToolButton ref="button" @click="isSelect" :selected="props.active" @mouseenter.stop="onMouseenter" @mouseleave.stop="onMouseleave">
    <div class="svg-container">
      <svg-icon icon-class="frame"></svg-icon>
    </div>
    <div class="menu-f" @click="showMenu">
      <svg-icon icon-class="down"></svg-icon>
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
  margin-left: 3px;
  color: #ffffff;
  > svg {
    width: 13px;
    height: 13px;
  }
}
.menu-f {
  width: 10px;
  height: 28px;
  display: flex;
  padding-right: 4px;
  margin-right: 2px;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  transition: 0.3s;
  > svg {
    width: 80%;
    height: 60%;
  }
}
.menu-f:hover {
  transform: translateY(4px);
}
.popover {
  position: absolute;
  color: #ffffff;
  z-index: 999;
  width: 150px;
  height: auto;
  font-size: var(--font-default-fontsize);
  background-color: var(--theme-color);
  border-radius: 4px;
  outline: none;
  padding: var(--default-padding-half) 0;
  >div {
    >span {
      padding: 4px var(--default-padding);
      height: 32px;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      &:hover {
        background-color: var(--active-color);
      }
    }
    .frame {
      position: relative;
      width: 100%;
      box-sizing: border-box;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px var(--default-padding);
      &:hover {
        background-color: var(--active-color);
      }
      .triangle {
        width: 0;
        height: 0;
        padding: 0;
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-left: 10px solid var(--theme-color-anti);
      }
    }
    
  }
}

// @keyframes bounce {
//   0% {
//     transform: translateY(0);
//   }
//   50% {
//     transform: translateY(6px);
//   }
//   100% {
//     transform: translateY(0);
//   }
// }
// .button:hover {
//   .menu > svg {
//     animation-duration: .5s;
//     animation-name: bounce;
//   }
// }
</style>