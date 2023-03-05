<script setup lang="ts">
import { defineProps, ref, nextTick, reactive } from 'vue';
import "@/assets/icons/svg/eyedropper.svg";
type RgbMeta = (number | undefined)[]
defineProps<{
  color: string
}>();

const widthSaturation = 200;
const heightSaturation = 150;
const lineAtrr: {
  length: 172,
  begin: number,
  end: number
} = { length: 172, begin: 0, end: 172 }

const data = reactive<{
  hueIndicatorAttr: {
    x: number
  },
  alphaIndicatorAttr: {
    x: number
  }
}>({
  hueIndicatorAttr: {
    x: 0
  },
  alphaIndicatorAttr: {
    x: 0
  }
})

const { hueIndicatorAttr, alphaIndicatorAttr } = data

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
      el.style.left = -(60 + el.offsetWidth) + 'px';
    }
  })
}
function closePopover() {
  popoverVisible.value = false
}

// 16进制色彩转10进制
function hexToX(hex: string): RgbMeta {
  debugger
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

function documentMouseMoveForHue(e: MouseEvent) {
  if (e.screenX >= lineAtrr.begin && e.screenX <= lineAtrr.end) {
    hueIndicatorAttr.x = e.screenX - lineAtrr.begin
  } else if (e.screenX < lineAtrr.begin) {
    hueIndicatorAttr.x = 0
  } else if (e.screenX > lineAtrr.begin) {
    hueIndicatorAttr.x = lineAtrr.length
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
      console.log(result.sRGBHex);
    })
    .catch(() => {
      throw new Error("failed");
    });
}

</script>

<template>
  <div class="color-block" :style="{backgroundColor: color}" ref="block" @click="showPopover">
    <div class="popover" ref="popoverEl" @click.stop v-if="popoverVisible">
      <!-- 头部 -->
      <div class="header">
        <div @click="closePopover">X</div>
      </div>
      <!-- 饱和度 -->
      <div class="saturation">
        <div class="white"></div>
        <div class="black"></div>
      </div>
      <div class="controller">
        <div class="sliders-container" ref="sliders">
          <!-- 色相 -->
          <div class="hue">
            <div
              class="hueIndicator"
              ref="hueIndicator"
              :style="{left: hueIndicatorAttr.x + 'px'}"
              @mousedown="hueIndicatorMouseDown"
            ></div>
          </div>
          <!-- 透明度 -->
          <div class="alpha-bacground">
            <div class="alpha">
              <div
                class="alphaIndicator"
                ref="alphaIndicator"
                :style="{left: alphaIndicatorAttr.x + 'px'}"
                @mousedown="alphaIndicatorMouseDown"
              ></div>
            </div>
          </div>
        </div>
        <div class="current-background">
          <div ref="currentEl">
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
  background-color: #cecece;
  .popover {
    position: absolute;
    width: 224px;
    height: 360px;
    padding: 12px;
    box-sizing: border-box;
    background-color: #ffffff;
    box-shadow: 0 4px 10px #cecece;
    > .header {
      width: 100%;
      height: 32px;
      position: relative;
      color: #cecece;
      > div {
        width: 16px;
        height: 16px;
        text-align: center;
        line-height: 16px;
        border-radius: 4px;
        position: absolute;
        right: 0px;
      }
    }
    > .saturation {
      width: 100%;
      height: 150px;
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
    }
    > .controller {
      width: 100%;
      height: 32px;
      display: flex;
      flex-direction: row;
      align-items: center;
      > .sliders-container {
        margin-top: 4px;
        width: 172px;
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
            background: linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 100%);
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
          background-color: antiquewhite;
        }
      }
    }
    > .eyedropper {
      margin-top: 12px;
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
