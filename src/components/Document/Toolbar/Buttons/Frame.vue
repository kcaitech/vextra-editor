<script setup lang="ts">
import { ref, nextTick, watch, onUnmounted } from 'vue';
import ToolButton from '../ToolButton.vue';
import { useI18n } from 'vue-i18n';
import FrameChild from './FrameChild.vue'
const { t } = useI18n();

type Button = InstanceType<typeof ToolButton>

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
        popover.value.style.top = el.offsetHeight + 2 + 'px';
      } 
    })
    document.addEventListener('click', onMenuBlur);
  }
}

function onMenuBlur(e: MouseEvent) {
  if (e.target instanceof Element && !e.target.closest('.popover') && !e.target.closest('.menu-f')) {
    var timer = setTimeout(() => {
      top.value = 0;
      popoverVisible.value = false;
      clearTimeout(timer)
      document.removeEventListener('click', onMenuBlur);
    }, 10)
  }
  
}


const top = ref(0)
const left = ref(0)
const showChildFrame = (i: number) => {
    
    hoverIndex.value = i
    if(popover.value) {
      left.value = popover.value.offsetWidth
      
    }
    nextTick(() => {
      if(frame.value) {
          let el = (frame.value as any)[i]
          const { y } = offset2Root(i)
          top.value = y - 42
        }        
      })

  
}
function offset2Root(i: number) {
    let el = (frame.value as any)[i];
    let y = el.offsetTop
    el = el.offsetParent as any;
    while (el) {
        y += el.offsetTop
        el = el.offsetParent as any;
    }
    return { y }
}

const closeChildFrame = () => {
  hoverIndex.value = -1
}

// const frames = ['frame.phone', 'frame.tablet', 'frame.deskdop', 'frame.presentation', 'frame.watch', 'frame.paper', 'frame.social_media']
const frames = ['frame.phone', 'frame.tablet']

const framesChild = [
  [['iphone 14', '390 × 844'], ['iphone 14 Pro', '393 × 852']],
  [['iphone 13', '390 × 844'], ['iphone 13 Pro', '393 × 852']]
]

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
        <FrameChild :childFrame="hoverIndex === i" :top="-8" :left="left" :framesChild="framesChild[i]"></FrameChild>
      </div>
    </div>
  </div>
  <ToolButton ref="button">
    <div class="svg-container" title="Frame">
      <svg-icon icon-class="frame"></svg-icon>
    </div>
    <div class="menu-f" @click="showMenu">
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
    width: 50%;
    height: 50%;
  }
}
.menu-f {
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
      .child {
        position: absolute;
        width: 200px;
        height: auto;
        z-index: 999;
        color: #ffffff;
        font-size: var(--font-default-fontsize);
        background-color: var(--theme-color);
        border-radius: 4px;
        outline: none;
        padding: var(--default-padding-half) 0;
        .item {
          width: 100%;
          box-sizing: border-box;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px var(--default-padding);
        }
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