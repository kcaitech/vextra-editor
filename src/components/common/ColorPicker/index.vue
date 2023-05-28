<script setup lang="ts">
import { defineProps, ref, nextTick, reactive, defineEmits, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import { Color } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { simpleId } from '@/utils/common';
import { Eyedropper } from './eyedropper';
import { drawTooltip, toRGBA } from './utils';
type RgbMeta = number[];
interface Props {
  context: Context
  color: Color
}
interface Emits {
  (e: 'change', color: Color): void;
}
interface RGBA {
  R: number
  G: number
  B: number,
  alpha: number
}
interface Indicator {
  x: number
}
interface LineAttribute {
  length: 196,
  begin: number,
  end: number
}
interface DotPosition {
  left: number
  top: number
}
const INDICATOR_WIDTH = 12;

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'choosecolor', color: number[]): void;
}>();
const { t } = useI18n();
const saturation = ref<HTMLElement>();
const hueEl = ref<HTMLElement>();
const alphaEl = ref<HTMLElement>();
const blockId: string = simpleId();
const lineAttribute: LineAttribute = { length: 196, begin: 0, end: 196 }
const data = reactive<{
  rgba: RGBA
  hueIndicatorAttr: Indicator
  alphaIndicatorAttr: Indicator
  dotPosition: DotPosition
}>({
  rgba: { R: 255, G: 0, B: 0, alpha: 1 },
  hueIndicatorAttr: { x: 0 },
  alphaIndicatorAttr: { x: lineAttribute.length - INDICATOR_WIDTH },
  dotPosition: { left: -5, top: -5, }
})
const { rgba, hueIndicatorAttr, alphaIndicatorAttr, dotPosition } = data;

const sliders = ref<HTMLDivElement>();
const block = ref<HTMLDivElement>();
const popoverEl = ref<HTMLDivElement>();
const hueIndicator = ref<HTMLDivElement>();
const alphaIndicator = ref<HTMLDivElement>();
const popoverVisible = ref<boolean>(false);
const eyeDropper: Eyedropper = eyeDropperInit();

function triggle() {
  const workspace = props.context.workspace;
  const exsit = workspace.isColorPickerMount;
  if (exsit) {
    if (exsit === blockId) {
      workspace.removeColorPicker();
    } else {
      workspace.removeColorPicker();
      colorPickerMount();
    }
  } else {
    colorPickerMount();
  }
}
function colorPickerMount() {
  popoverVisible.value = true;
  props.context.workspace.colorPickerSetup(blockId);
  nextTick(() => {
    if (popoverEl.value && block.value) {
      let el = popoverEl.value
      let top = Math.min(document.documentElement.clientHeight - 76 - block.value.offsetTop - el.offsetHeight, 0);
      el.style.top = top + 'px';
      el.style.left = -(46 + el.offsetWidth) + 'px';
    }
  })
}
function removeColorPicker() {
  popoverVisible.value = false;
}

// 16进制色彩转10进制
function hexToX(hex: string): RgbMeta {
  hex = hex.slice(1);
  let result: number[] = [];
  if (hex.length === 3) {
    let temp = hex.split('');
    result = temp.map(v => {
      return Number(eval(`0x${v}${v}`).toString(10));
    })
  } else if (hex.length === 6) {
    let temp = hex.split('');
    for (let i = 0; i < 6; i = i + 2) {
      result.push(Number(eval(`0x${temp[i]}${temp[i + 1]}`).toString(10)));
    }
  }
  return result
}
//  10进制色彩转16进制
function xTohex(rgb: [number, number, number]): string {
  let str: string = '#';
  rgb.forEach(i => {
    str = str + (rgb[i].toString(16).length === 1 ? `0${rgb[i].toString(16).length === 1}` : rgb[i].toString(16).length === 1)
  })
  return str
}

function alphaIndicatorMouseDown() {
  if (sliders.value) {
    const { left, right } = sliders.value.getBoundingClientRect();
    lineAttribute.begin = left;
    lineAttribute.end = right;
  }
  document.addEventListener('mousemove', documentMouseMoveForAlpha);
  document.addEventListener('mouseup', documentMouseUp);
}
function documentMouseMoveForAlpha(e: MouseEvent) {
  if (e.screenX >= lineAttribute.begin && e.screenX <= lineAttribute.end - INDICATOR_WIDTH) {
    alphaIndicatorAttr.x = e.screenX - lineAttribute.begin;
  } else if (e.screenX < lineAttribute.begin) {
    alphaIndicatorAttr.x = 0;
  } else if (e.screenX > lineAttribute.end) {
    alphaIndicatorAttr.x = lineAttribute.length - INDICATOR_WIDTH;
  }
  setAlpha(alphaIndicatorAttr.x);
}
function documentMouseMoveForHue(e: MouseEvent) {
  if (e.x >= lineAttribute.begin && e.x <= lineAttribute.end - INDICATOR_WIDTH) {
    hueIndicatorAttr.x = e.x - lineAttribute.begin
  } else if (e.x < lineAttribute.begin) {
    hueIndicatorAttr.x = 0
  } else if (e.x > lineAttribute.end) {
    hueIndicatorAttr.x = lineAttribute.length - INDICATOR_WIDTH;
  }
  setRGB(hueIndicatorAttr.x);
}
function setHueIndicatorPosition(e: MouseEvent) {
  if (sliders.value) {
    const { x, right } = sliders.value.getBoundingClientRect();
    lineAttribute.begin = x;
    lineAttribute.end = right;
    hueIndicatorAttr.x = Math.min(Math.max(e.x - INDICATOR_WIDTH / 2, 0) - x, lineAttribute.length - INDICATOR_WIDTH);
    setRGB(hueIndicatorAttr.x);
    document.addEventListener('mousemove', documentMouseMoveForHue);
    document.addEventListener('mouseup', documentMouseUp);
  }
}
function setAlphaIndicatorPosition(e: MouseEvent) {
  alphaIndicatorAttr.x = Math.min(Math.max(e.offsetX - INDICATOR_WIDTH / 2, 0), lineAttribute.length - INDICATOR_WIDTH);
  setAlpha(alphaIndicatorAttr.x);
}
function setDotPosition(e: MouseEvent) {
  if (saturation.value) {
    const { x: saturationX, y: saturationY } = saturation.value.getBoundingClientRect();
    const { x: mx, y: my } = e;
    dotPosition.left = mx - saturationX - 5;
    dotPosition.top = my - saturationY - 5;
  }
}

function setRGB(indicator: number) {
  const start = 0 + INDICATOR_WIDTH / 2;
  const end = lineAttribute.length - INDICATOR_WIDTH / 2;
  if (start <= indicator && indicator <= end * 0.17) {
    const rate = indicator / (end * 0.17)
    rgba.R = 255;
    rgba.G = Math.floor(255 * rate);
    rgba.B = 0;
  } else if (end * 0.17 < indicator && indicator <= end * 0.33) {
    const rate = (indicator - end * 0.17) / (end * 0.33 - end * 0.17)
    rgba.R = Math.floor(255 - 255 * rate);
    rgba.G = 255;
    rgba.B = 0;
  } else if (end * 0.33 < indicator && indicator <= end * 0.50) {
    const rate = (indicator - end * 0.33) / (end * 0.50 - end * 0.33)
    rgba.R = 0;
    rgba.G = 255;
    rgba.B = Math.floor(255 * rate);
  } else if (end * 0.50 < indicator && indicator <= end * 0.67) {
    const rate = (indicator - end * 0.50) / (end * 0.67 - end * 0.50)
    rgba.R = 0;
    rgba.G = Math.floor(255 - 255 * rate);
    rgba.B = 255;
  } else if (end * 0.67 < indicator && indicator <= end * 0.83) {
    const rate = (indicator - end * 0.67) / (end * 0.83 - end * 0.67)
    rgba.R = Math.floor(255 * rate);
    rgba.G = 0;
    rgba.B = 255;
  } else {
    const rate = (indicator - end * 0.83) / (end - end * 0.83)
    rgba.R = 255;
    rgba.G = 0;
    rgba.B = Math.floor(255 - 255 * rate);
  }
  emit('choosecolor', [rgba.R, rgba.G, rgba.B])
}
function setAlpha(indicator: number) {
  rgba.alpha = Number((indicator / lineAttribute.length).toFixed(2));
}
function documentMouseUp() {
  document.removeEventListener('mousemove', documentMouseMoveForAlpha)
  document.removeEventListener('mousemove', documentMouseMoveForHue)
  document.removeEventListener('mouseup', documentMouseUp)
}
function eyedropper() {
  if (!(window as any).EyeDropper) { // 不支持系统自带的接口，使用自实现的接口
    eyeDropper.start(t('color.esc'));
  } else { // 调用系统自带的接口
    systemEyeDropper();
  }
}
function blockUnmount() {
  const workspace = props.context.workspace;
  const exsit = workspace.isColorPickerMount;
  if (exsit === blockId) {
    workspace.removeColorPicker();
  }
}
// 系统自带的取色器
function systemEyeDropper() {
  const System_EyeDropper = (window as any).EyeDropper;
  const s_eye_dropper = new System_EyeDropper();
  s_eye_dropper.open().then((result: any) => {
    const rgb = hexToX(result.sRGBHex);
    rgba.R = rgb[0];
    rgba.G = rgb[1];
    rgba.B = rgb[2];
    emit('choosecolor', rgb);
  }).catch(() => {
    throw new Error("failed");
  });
  const tooltip = drawTooltip(t('color.esc'));
  document.body.appendChild(tooltip);
  setTimeout(() => tooltip?.parentNode?.removeChild(tooltip), 2000);
}
// 自制取色器
function eyeDropperInit(): Eyedropper {
  // init
  const root = props.context.workspace.root.element;
  return new Eyedropper({
    container: root,
    scale: 2,
    listener: {
      onOk: ({ color }) => {
        const rgb = hexToX(color);
        rgba.R = rgb[0];
        rgba.G = rgb[1];
        rgba.B = rgb[2];
        emit('choosecolor', rgb);
      }
    }
  });
}
function workspaceWatcher(t: any) {
  if (t === WorkSpace.REMOVE_COLOR_PICKER) {
    removeColorPicker();
  }
}
onMounted(() => {
  props.context.workspace.watch(workspaceWatcher);
});
onBeforeUnmount(() => {
  blockUnmount();
})
onUnmounted(() => {
  eyeDropper.destroy();
  props.context.workspace.unwatch(workspaceWatcher);
})
</script>

<template>
  <div class="color-block" :style="{ backgroundColor: toRGBA(color) }" ref="block" @click="triggle">
    <div class="popover" ref="popoverEl" @click.stop v-if="popoverVisible">
      <!-- 头部 -->
      <div class="header">
        <div class="color-type">{{ t('color.solid') }}</div>
        <div @click="removeColorPicker" class="close">X</div>
      </div>
      <!-- 饱和度 -->
      <div class="saturation" @mousedown.stop="e => setDotPosition(e)"
        :style="{ backgroundColor: `rgba(${rgba.R}, ${rgba.G}, ${rgba.B}, 1)` }" ref="saturation">
        <div class="white"></div>
        <div class="black"></div>
        <div class="dot" :style="{ left: `${dotPosition.left}px`, top: `${dotPosition.top}px` }"></div>
      </div>
      <div class="controller">
        <div class="eyedropper">
          <svg-icon icon-class="eyedropper" @click="eyedropper"></svg-icon>
        </div>
        <div class="sliders-container" ref="sliders">
          <!-- 色相 -->
          <div class="hue" @mousedown.stop="setHueIndicatorPosition" ref="hueEl">
            <div class="hueIndicator" ref="hueIndicator" :style="{ left: hueIndicatorAttr.x + 'px' }"></div>
          </div>
          <!-- 透明度 -->
          <div class="alpha-bacground">
            <div class="alpha" @mousedown.stop="setAlphaIndicatorPosition" ref="alphaEl"
              :style="{ background: `linear-gradient(to right, rgba(${rgba.R}, ${rgba.G}, ${rgba.B}, 0) 0%, rgb(${rgba.R}, ${rgba.G}, ${rgba.B}) 100%)` }">
              <div class="alphaIndicator" ref="alphaIndicator" :style="{ left: alphaIndicatorAttr.x + 'px' }"
                @mousedown="alphaIndicatorMouseDown"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.color-block {
  position: relative;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  box-shadow: 0 0 2px var(--theme-color);

  .popover {
    position: absolute;
    width: 240px;
    height: 360px;
    box-sizing: border-box;
    background-color: #ffffff;
    box-shadow: 0 0px 10px 4px rgba($color: #000000, $alpha: 0.1);
    border-radius: 4px;

    >.header {
      width: 100%;
      height: 32px;
      position: relative;
      color: #cecece;
      border-bottom: 1px solid #cecece;
      box-sizing: border-box;

      .color-type {
        position: absolute;
        left: 8px;
        top: 8px;
        color: var(--theme-color);
        user-select: none;
      }

      >.close {
        width: 16px;
        height: 16px;
        text-align: center;
        line-height: 16px;
        border-radius: 4px;
        position: absolute;
        right: 8px;
        top: 8px;
        user-select: none;
      }
    }

    >.saturation {
      width: 100%;
      height: 180px;
      position: relative;
      cursor: pointer;

      >.white {
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0));
      }

      >.black {
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(0deg, #000, transparent);
      }

      >.dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 1px solid #fff;
        position: absolute;
        box-sizing: border-box;
        box-shadow: 0 0 0 0.5px #fff, inset 0 0 1px 1px rgb(0 0 0 / 30%), 0 0 1px 1px rgb(0 0 0 / 40%);
      }
    }

    >.controller {
      width: 100%;
      height: 52px;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 10px;
      box-sizing: border-box;
      justify-content: space-around;

      >.sliders-container {
        width: 196px;
        height: 32px;

        >.hue {
          position: relative;
          width: 100%;
          height: 10px;
          background: linear-gradient(90deg, #f00 0, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00);
          border-radius: 5px 5px 5px 5px;
          cursor: pointer;

          >.hueIndicator {
            top: -1px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 1px solid #fff;
            position: absolute;
            box-sizing: border-box;
            box-shadow: 0 0 0 0.5px #fff, inset 0 0 1px 1px rgb(0 0 0 / 30%), 0 0 1px 1px rgb(0 0 0 / 40%);
          }
        }

        >.alpha-bacground {
          margin-top: 8px;
          width: 100%;
          height: 10px;
          background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADBJREFUOE9jfPbs2X8GPEBSUhKfNAPjqAHDIgz+//+PNx08f/4cfzoYNYCBceiHAQC5flV5JzgrxQAAAABJRU5ErkJggg==");
          background-size: auto 75%;
          border-radius: 5px 5px 5px 5px;
          cursor: pointer;

          >.alpha {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 5px 5px 5px 5px;

            >.alphaIndicator {
              top: -1px;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              border: 1px solid #fff;
              position: absolute;
              box-sizing: border-box;
              box-shadow: 0 0 0 0.5px #fff, inset 0 0 1px 1px rgb(0 0 0 / 30%), 0 0 1px 1px rgb(0 0 0 / 40%);
            }
          }

        }
      }

      >.current-background {
        margin-left: 8px;
        width: 16px;
        height: 16px;
        border-radius: 2px;
        background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADBJREFUOE9jfPbs2X8GPEBSUhKfNAPjqAHDIgz+//+PNx08f/4cfzoYNYCBceiHAQC5flV5JzgrxQAAAABJRU5ErkJggg==");
        background-size: auto 50%;

        >div {
          width: 100%;
          height: 100%;
          border-radius: 2px;
        }
      }

      >.eyedropper {
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;

        >svg {
          width: 80%;
          height: 80%;
        }
      }
    }
  }
}
</style>
