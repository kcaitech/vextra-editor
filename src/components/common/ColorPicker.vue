<script setup lang="ts">
import { defineProps, ref, nextTick, reactive, defineEmits } from 'vue';
import { Color } from '@kcdesign/data';
import { toRGBA } from '@/utils/color';

type RgbMeta = number[]
defineProps<{
  color: Color
}>();
const emit = defineEmits<{
  (e: 'choosecolor', color: number[]): void;
}>();

const widthSaturation = 240;
const heightSaturation = 180;
const lineAtrr: {
  length: 196,
  begin: number,
  end: number
} = { length: 196, begin: 0, end: 196 }

const data = reactive<{
  RGBA: {
    R: number,
    G: number,
    B: number,
    alpha: number
  },
  hueIndicatorAttr: {
    x: number
  },
  alphaIndicatorAttr: {
    x: number
  },
  dotPosition: {
    left: number,
    top: number
  }
}>({
  RGBA: {
    R: 255,
    G: 0,
    B: 0,
    alpha: 1
  },
  hueIndicatorAttr: {
    x: 0
  },
  alphaIndicatorAttr: {
    x: lineAtrr.length
  },
  dotPosition: {
    left: -3,
    top: -3,
  }
})

const { RGBA, hueIndicatorAttr, alphaIndicatorAttr, dotPosition } = data

const sliders = ref<HTMLDivElement>();
const block = ref<HTMLDivElement>();
const popoverEl = ref<HTMLDivElement>();
const hueIndicator = ref<HTMLDivElement>();
const alphaIndicator = ref<HTMLDivElement>();
const popoverVisible = ref<boolean>(false);

function showPopover() {  
  if (popoverVisible.value) return popoverVisible.value = false;
  popoverVisible.value = true;
  nextTick(() => {
    if (popoverEl.value && block.value) {
      let el = popoverEl.value
      let top = Math.min(document.documentElement.clientHeight - 76 - block.value.offsetTop - el.offsetHeight, 0);
      el.style.top = top + 'px';
      el.style.left = -(46 + el.offsetWidth) + 'px';
    }
  })
}
function closePopover() {
  popoverVisible.value = false
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

function hueIndicatorMouseDown() {
  document.addEventListener('mousemove', documentMouseMoveForHue)
  document.addEventListener('mouseup', documentMouseUp)
  if (sliders.value) {
    lineAtrr.begin = sliders.value.getBoundingClientRect().left;
    lineAtrr.end = sliders.value.getBoundingClientRect().right;
  } 
}

function alphaIndicatorMouseDown() {
  document.addEventListener('mousemove', documentMouseMoveForAlpha)
  document.addEventListener('mouseup', documentMouseUp)
  if (sliders.value) {
    lineAtrr.begin = sliders.value.getBoundingClientRect().left;
    lineAtrr.end = sliders.value.getBoundingClientRect().right;
  } 
}
function documentMouseMoveForAlpha(e: MouseEvent) {
  if (e.screenX >= lineAtrr.begin && e.screenX <= lineAtrr.end) {
    alphaIndicatorAttr.x = e.screenX - lineAtrr.begin
  } else if (e.screenX < lineAtrr.begin) {
    alphaIndicatorAttr.x = 0
  } else if (e.screenX > lineAtrr.begin) {
    alphaIndicatorAttr.x = lineAtrr.length
  }
  setAlpha(alphaIndicatorAttr.x);
}
function documentMouseMoveForHue(e: MouseEvent) {
  if (e.screenX >= lineAtrr.begin && e.screenX <= lineAtrr.end) {
    hueIndicatorAttr.x = e.screenX - lineAtrr.begin
  } else if (e.screenX < lineAtrr.begin) {
    hueIndicatorAttr.x = 0
  } else if (e.screenX > lineAtrr.begin) {
    hueIndicatorAttr.x = lineAtrr.length
  }
  setRGB(hueIndicatorAttr.x);
}
function setHueIndicatorPosition(e: MouseEvent) {
  hueIndicatorAttr.x = e.offsetX - 3;
  setRGB(hueIndicatorAttr.x);
}
function setAlphaIndicatorPosition(e: MouseEvent) {
  alphaIndicatorAttr.x = e.offsetX - 3;
  setAlpha(alphaIndicatorAttr.x);
}
function setDotPosition(e: MouseEvent) {
  const { offsetX, offsetY } = e;
  // console.log('X,Y', `${offsetX},${offsetY}`);
  dotPosition.left = offsetX - 3;
  dotPosition.top = offsetY - 3;
  // console.log('dot:X,Y', `${dotPosition.left},${dotPosition.top}`);
}

function setRGB(indicator: number) {
  // console.log('-indicator-', indicator);
  // console.log('-rgb-', `${RGBA.R},${RGBA.G},${RGBA.B}`);
  if (0 <= indicator && indicator <= lineAtrr.length * 0.17) {
    const rate = indicator / (lineAtrr.length * 0.17)
    RGBA.R = 255;
    RGBA.G = Math.floor(255 * rate);
    RGBA.B = 0;
  } else if (lineAtrr.length * 0.17 < indicator && indicator <= lineAtrr.length * 0.33) {
    const rate = (indicator - lineAtrr.length * 0.17) / (lineAtrr.length * 0.33 - lineAtrr.length * 0.17)
    RGBA.R = Math.floor(255 - 255 * rate);
    RGBA.G = 255;
    RGBA.B = 0;
  } else if (lineAtrr.length * 0.33 < indicator && indicator <= lineAtrr.length * 0.50) {
    const rate = (indicator - lineAtrr.length * 0.33) / (lineAtrr.length * 0.50 - lineAtrr.length * 0.33)
    RGBA.R = 0;
    RGBA.G = 255;
    RGBA.B = Math.floor(255 * rate);
  } else if (lineAtrr.length * 0.50 < indicator && indicator <= lineAtrr.length * 0.67) {
    const rate = (indicator - lineAtrr.length * 0.50) / (lineAtrr.length * 0.67 - lineAtrr.length * 0.50)
    RGBA.R = 0;
    RGBA.G = Math.floor(255 - 255 * rate);
    RGBA.B = 255;
  } else if (lineAtrr.length * 0.67 < indicator && indicator <= lineAtrr.length * 0.83) {
    const rate = (indicator - lineAtrr.length * 0.67) / (lineAtrr.length * 0.83 - lineAtrr.length * 0.67)
    RGBA.R = Math.floor(255 * rate);
    RGBA.G = 0;
    RGBA.B = 255;
  } else {
    const rate = (indicator - lineAtrr.length * 0.83) / (lineAtrr.length - lineAtrr.length * 0.83)
    RGBA.R = 255;
    RGBA.G = 0;
    RGBA.B =  Math.floor(255 - 255 * rate);
  }
}
function setAlpha(indicator: number) {
  RGBA.alpha = Number((indicator / lineAtrr.length).toFixed(2));
}

function documentMouseUp() {
  document.removeEventListener('mousemove', documentMouseMoveForAlpha)
  document.removeEventListener('mousemove', documentMouseMoveForHue)
  document.removeEventListener('mouseup', documentMouseUp)
}


function eyedropper() {
  if (!(window as any).EyeDropper) {
    console.log("Your browser does not support the EyeDropper API");
    return;
  }
  const EyeDropper = (window as any).EyeDropper;
  const eyeDropper = new EyeDropper();
  eyeDropper
    .open()
    .then((result: any) => {
      const rgb = hexToX(result.sRGBHex)
      RGBA.R = rgb[0];
      RGBA.G = rgb[1];
      RGBA.B = rgb[2];

      emit('choosecolor', rgb)
    })
    .catch(() => {
      throw new Error("failed");
    });
}

</script>

<template>
  <div class="color-block" :style="{backgroundColor: toRGBA(color)}" ref="block" @click="showPopover">
    <div class="popover" ref="popoverEl" @click.stop v-if="popoverVisible">
      <!-- 头部 -->
      <div class="header">
        <div @click="closePopover">X</div>
      </div>
      <!-- 饱和度 -->
      <div class="saturation"
        @mousedown="e => setDotPosition(e)"
        :style="{backgroundColor: `rgba(${RGBA.R}, ${RGBA.G}, ${RGBA.B}, 1)`}"
      >
        <div class="white"></div>
        <div class="black"></div>
        <div class="dot"
          :style="{left: `${dotPosition.left}px`, top: `${dotPosition.top}px`}"
          @mousedown.stop
        ></div>
      </div>
      <div class="controller">
        <div class="sliders-container" ref="sliders">
          <!-- 色相 -->
          <div class="hue" @mousedown="setHueIndicatorPosition">
            <div
              class="hueIndicator"
              ref="hueIndicator"
              :style="{left: hueIndicatorAttr.x + 'px'}"
              @mousedown.stop="hueIndicatorMouseDown"
            ></div>
          </div>
          <!-- 透明度 -->
          <div class="alpha-bacground">
            <div
              class="alpha"
              @mousedown="setAlphaIndicatorPosition"
              :style="{background: `linear-gradient(to right, rgba(${RGBA.R}, ${RGBA.G}, ${RGBA.B}, 0) 0%, rgb(${RGBA.R}, ${RGBA.G}, ${RGBA.B}) 100%)`}"
            >
              <div
                class="alphaIndicator"
                ref="alphaIndicator"
                :style="{left: alphaIndicatorAttr.x + 'px'}"
                @mousedown.stop="alphaIndicatorMouseDown"
              ></div>
            </div>
          </div>
        </div>
        <div class="current-background">
          <div ref="currentEl" :style="{ backgroundColor: `rgba(${RGBA.R}, ${RGBA.G}, ${RGBA.B}, ${RGBA.alpha})` }">
          </div>
        </div>
      </div>
      <div class="eyedropper">
        <svg-icon icon-class="eyedropper" @click="eyedropper"></svg-icon>
      </div>
    </div>               
  </div>
</template>

<style lang="scss" scoped>
.color-block {
  position: relative;
  width: 16px;
  height: 16px;
  // border: 1px solid var(--theme-color);
  border-radius: 2px;
  box-shadow: 0 0 2px var(--theme-color);
  .popover {
    position: absolute;
    width: 240px;
    height: 360px;
    box-sizing: border-box;
    background-color: #ffffff;
    box-shadow: 0 4px 10px #cecece;
    > .header {
      width: 100%;
      height: 32px;
      position: relative;
      color: #cecece;
      border-bottom: 1px solid #cecece;
      box-sizing: border-box;
      > div {
        width: 16px;
        height: 16px;
        text-align: center;
        line-height: 16px;
        border-radius: 4px;
        position: absolute;
        right: 8px;
        top: 8px;
      }
    }
    > .saturation {
      width: 100%;
      height: 180px;
      position: relative;
      > .white {
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg,#fff,hsla(0,0%,100%,0));
      }
      > .black {
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(0deg,#000,transparent);
      }
      > .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        border: 1px solid #fff;
        position: absolute;
        top: -3px;
        left: -3px;
        box-shadow: 0 0 0 0.5px #fff, inset 0 0 1px 1px rgb(0 0 0 / 30%), 0 0 1px 1px rgb(0 0 0 / 40%);
      }
    }
    > .controller {
      width: 100%;
      height: 52px;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 10px;
      box-sizing: border-box;
      > .sliders-container {
        width: 196px;
        height: 32px;
        > .hue {
          position: relative;
          width: 100%;
          height: 10px;
          background: linear-gradient(90deg,#f00 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,#f00);
          > .hueIndicator {
            height: 12px;
            width: 6px;
            border: 1px solid #cecece;
            border-radius: 2px;
            box-sizing: border-box;
            position: absolute;
            background-color: #fff;
            top: -1px;
          }
        }
        > .alpha-bacground {
          margin-top: 8px;
          width: 100%;
          height: 10px;
          background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADBJREFUOE9jfPbs2X8GPEBSUhKfNAPjqAHDIgz+//+PNx08f/4cfzoYNYCBceiHAQC5flV5JzgrxQAAAABJRU5ErkJggg==");
          background-size: auto 100%;
          > .alpha {
            position: relative;
            width: 100%;
            height: 100%;
            > .alphaIndicator {
              height: 12px;
              width: 6px;
              border: 1px solid #cecece;
              border-radius: 2px;
              box-sizing: border-box;
              position: absolute;
              background-color: #fff;
              top: -1px;
            }
          }
          
        }
      }
      > .current-background {
        margin-left: 8px;
        width: 16px;
        height: 16px;
        border-radius: 2px;
        background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADBJREFUOE9jfPbs2X8GPEBSUhKfNAPjqAHDIgz+//+PNx08f/4cfzoYNYCBceiHAQC5flV5JzgrxQAAAABJRU5ErkJggg==");
        > div {
          width: 100%;
          height: 100%;
          border-radius: 2px;
        }
      }
    }
    > .eyedropper {
      margin-left: 10px;
      width: 16px;
      height: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      > svg {
        width: 90%;
        height: 90%;
      }
    }
  }
}
</style>
