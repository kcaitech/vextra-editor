<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { useFrame, useCutout } from "@/components/Document/Creator/execute";
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { Action, Tool } from '@/context/tool';
import { XY } from "@/context/selection";

interface Props {
  context: Context;
  params: {
    active: boolean,
  }
}
const { t } = useI18n();
const props = defineProps<Props>();

const currentTool = ref<string>(Action.AddFrame);
const popover = ref<boolean>(false);
const tipsVisible = ref<boolean>(false);
const selected = ref<boolean>(false);
const popoverXY = ref<XY>({ x: 0, y: 0 });

// 当前工具Icon
const pattern = computed<string>(() => {
  switch (currentTool.value) {
    case Action.AddFrame:
      return 'frame';
    case Action.AddCutout:
      return 'cutout';
    default:
      return 'frame';
  }
});

// 当前工具Tips
const tips = computed<string>(() => {
  const defaultFrame = `${t('shape.artboard')}\u00a0\u00a0\u00a0\u00a0F`;
  switch (currentTool.value) {
    case Action.AddFrame:
      return defaultFrame;
    case Action.AddCutout:
      return `${t('cutoutExport.cutout')}\u00a0\u00a0\u00a0\u00a0S`;
    default:
      return defaultFrame;
  }
});

let timer: any = null;
function enter() {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    tipsVisible.value = true;
    clearTimeout(timer);
    timer = null;
  }, 600);
}

function leave() {
  clearTimeout(timer);
  tipsVisible.value = false;
}

function shot() {
  switch (currentTool.value) {
    case Action.AddFrame:
      return useFrame(props.context);
    case Action.AddCutout:
      return useCutout(props.context);
    default:
      return useFrame(props.context);
  }
}

function showMenu(e: MouseEvent) {
  props.context.menu.menuMount()
  const el = (e.target as Element)!.closest('.frame-button') as HTMLDivElement;
  if (!el) return;
  if (popover.value) {
    popover.value = false;
    return;
  }

  popover.value = true;
  tipsVisible.value = false;

  popoverXY.value.x = el.offsetLeft;
  popoverXY.value.y = 45;
}

function toolWatcher(t: number) {
  if (t === Tool.CHANGE_ACTION) {
    const action = props.context.tool.action;
    selected.value = action === Action.AddFrame
      || action === Action.AddCutout
    if (selected.value) {
      currentTool.value = action;
    }
  }
}

function blur(e: MouseEvent) {
  if (!(e.target as Element).closest('.popover-frame-tool, .tool-frame-menu-trigger')) popover.value = false;
}

const stop = watch(() => popover.value, (v) => {
    if (v) {
        props.context.escstack.save('frame-menu', () => {
            const achieve = popover.value;
            popover.value = false;
            return achieve;
        });
        document.addEventListener('click', blur);
    } else {
        document.removeEventListener('click', blur);
    }
})


onMounted(() => {
  props.context.tool.watch(toolWatcher);
});
onUnmounted(() => {
  props.context.tool.unwatch(toolWatcher);
  stop();
  document.removeEventListener('click', blur);
})

</script>

<template>
  <el-tooltip effect="dark" :content="tips" :show-after="600" :offset="10" :visible="!popover && tipsVisible">
    <div :class="{ 'frame-button': true, 'frame-button-selected': selected, active: popover }" @mouseenter.stop="enter"
      @mouseleave.stop="leave">
      <div class="svg-container" @click="shot">
        <svg-icon :icon-class="pattern"/>
      </div>
        <div class="tool-frame-menu-trigger" @click="showMenu">
            <svg-icon icon-class="white-down"/>
      </div>
    </div>
  </el-tooltip>

  <div v-if="popover" class="popover-frame-tool" :style="{ left: popoverXY.x + 'px', top: popoverXY.y + 'px' }">
    <!--容器-->
    <div class="item" @click="() => { useFrame(context);popover = false; }">
      <div v-if="currentTool === Action.AddFrame" class="check">
        <svg-icon icon-class="white-select"></svg-icon>
      </div>
      <div class="desc">
        <svg-icon icon-class="frame"></svg-icon>
        <span>{{ t('shape.artboard') }}</span>
      </div>
      <div class="shortKey">F</div>
    </div>
    <!--切图-->
    <div class="item" @click="() => { useCutout(context);popover = false;  }">
      <div v-if="currentTool === Action.AddCutout" class="check">
        <svg-icon icon-class="white-select"></svg-icon>
      </div>
      <div class="desc">
        <svg-icon icon-class="cutout"></svg-icon>
        <span>{{ t('cutoutExport.cutout') }}</span>
      </div>
      <div class="shortKey">S</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.active {
  background-color: rgba(255, 255, 255, 0.1);
}

.svg-container {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 6px 6px 6px;
  box-sizing: border-box;

  >svg {
    width: 18px;
    height: 18px;
  }
}

.frame-button {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  width: 48px;
  height: 32px;

  .svg-container {
    display: flex;
    align-items: center;
    flex: 10;
    flex-direction: row-reverse;
    height: 100%;

    >svg {
      width: 18px;
      height: 18px;
    }
  }

  .tool-frame-menu-trigger {
    flex: 9;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    >svg {
      width: 12px;
      height: 12px;
      transition: 0.2s;
    }
  }

  .tool-frame-menu-trigger:hover {
    >svg {
      transform: translateY(2px);
    }
  }
}

.frame-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.frame-button-selected {
  background-color: var(--active-color) !important;
}


.popover-frame-tool {
  width: 158px;

  position: absolute;
  padding: 6px 0;
  box-sizing: border-box;
    background-color: var(--theme-color);
  color: var(--theme-color-anti);

  border-radius: 4px;

  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.08);

  .item {
    width: 100%;
    height: 32px;

    position: relative;
    box-sizing: border-box;
    padding: 8px 12px 8px 32px;

    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-default-fontsize);

    .check {
      position: absolute;
      left: 8px;

      display: flex;
      align-items: center;

      >svg {
        width: 12px;
        height: 12px;
      }
    }

    .desc {
      display: flex;
      align-items: center;
      justify-content: space-between;

      >svg {
        width: 14px;
        height: 14px;
      }

      >span {
        margin-left: 8px;
      }
    }
  }

  .item:hover {
    background-color: var(--active-color);
  }
}
</style>