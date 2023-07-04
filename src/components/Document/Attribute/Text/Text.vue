<script setup lang="ts">
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import SelectFont from './SelectFont.vue';
import {ref} from 'vue';
import TextAdvancedSettings from './TextAdvancedSettings.vue'
import { Context } from '@/context';
import { Shape } from "@kcdesign/data";

interface Props {
    context: Context
    shape: Shape
}
const props = defineProps<Props>();
const { t } = useI18n();
const textValue = ref(12)
const showSize = ref(false)
const sizeList = ref<HTMLDivElement>()
const showFont = ref(false)
const isBold = ref(false)
const isTilt = ref(false)
const isUnderline = ref(false)
const isDeleteline = ref(false)
const selectLevel = ref('left')
const selectVertical = ref('')

const onShowFont = () => {
    if(showFont.value) return showFont.value = false
    showFont.value = true
    document.addEventListener('click', onShowFontBlur);
}

const onShowFontBlur = (e: Event) => {
    if (e.target instanceof Element && !e.target.closest('.font-container') && !e.target.closest('.select-font') ) {
    var timer = setTimeout(() => {
        showFont.value = false;
      clearTimeout(timer)
      document.removeEventListener('click', onShowFontBlur);
    }, 10)
  }
}

const onShowSize = () => {
    if(showSize.value) return showSize.value = false
    showSize.value = true
    document.addEventListener('click', onShowSizeBlur);
}

const onShowSizeBlur = (e: Event) => {
    if (e.target instanceof Element && !e.target.closest('.text-size')) {
    var timer = setTimeout(() => {
        showSize.value = false;
      clearTimeout(timer)
      document.removeEventListener('click', onShowSizeBlur);
    }, 10)
  }
}

const onBold = () => {
    isBold.value = !isBold.value
}
const onTilt = () => {
    isTilt.value = !isTilt.value
}
const onUnderlint = () => {
    isUnderline.value = !isUnderline.value
}
const onDeleteline = () => {
    isDeleteline.value = !isDeleteline.value
}
const onSelectLevel = (icon: string) => {
    selectLevel.value = icon
}
const onSelectVertical = (icon: string) => {
    selectVertical.value = icon
}
const changeTextSize = (size: number) => {
    textValue.value = size
    showSize.value = false;
}
</script>

<template>
    <div class="text-panel">
        <TypeHeader :title="t('attr.text')" class="mt-24">
            <template #tool>
                <TextAdvancedSettings :context="props.context"></TextAdvancedSettings>
            </template>
        </TypeHeader>
        <div class="text-container">
            <div class="text-top">
                <div class="select-font jointly-text" @click="onShowFont">
                    <span>思源黑体</span>
                    <svg-icon icon-class="down"></svg-icon>
                </div>
                <SelectFont v-if="showFont"></SelectFont>
                <div class="perch"></div>
            </div>
            <div class="text-middle">
                <div class="text-middle-size">
                    <div class="text-size jointly-text">
                        <input type="number" v-model="textValue" class="input">
                        <svg-icon icon-class="down" @click="onShowSize"></svg-icon>
                        <div class="font-size-list" ref="sizeList" v-if="showSize">
                            <div @click="changeTextSize(10)">10</div>
                            <div @click="changeTextSize(12)">12</div>
                            <div @click="changeTextSize(14)">14</div>
                            <div @click="changeTextSize(16)">16</div>
                            <div @click="changeTextSize(18)">18</div>
                            <div @click="changeTextSize(24)">24</div>
                            <div @click="changeTextSize(36)">36</div>
                            <div @click="changeTextSize(48)">48</div>
                            <div @click="changeTextSize(64)">64</div>
                        </div>
                    </div>
                    <div class="overbold jointly-text" :class="{selected_bgc: isBold}" @click="onBold">
                        <svg-icon icon-class="text-bold"></svg-icon>
                    </div>
                    <div class="overbold jointly-text" :class="{selected_bgc: isTilt}" @click="onTilt">
                        <svg-icon icon-class="text-tilt"></svg-icon>
                    </div>
                    <div class="overbold jointly-text" :class="{selected_bgc: isUnderline}" @click="onUnderlint">
                        <svg-icon icon-class="text-underline"></svg-icon>
                    </div>
                    <div class="overbold jointly-text" :class="{selected_bgc: isDeleteline}" @click="onDeleteline">
                        <svg-icon icon-class="text-deleteline"></svg-icon>
                    </div>
                </div>
                <div class="perch"></div>
            </div>
            <div class="text-bottom">
                <div class="text-bottom-align">
                    <div class="level-aligning jointly-text">
                        <i class="jointly-text font-posi" :class="{selected_bgc: selectLevel === 'left'}" @click="onSelectLevel('left')"><svg-icon icon-class="text-left"></svg-icon></i>
                        <i class="jointly-text font-posi" :class="{selected_bgc: selectLevel === 'center'}" @click="onSelectLevel('center')"><svg-icon icon-class="text-center"></svg-icon></i>
                        <i class="jointly-text font-posi" :class="{selected_bgc: selectLevel === 'right'}" @click="onSelectLevel('right')"><svg-icon icon-class="text-right"></svg-icon></i>
                        <i class="jointly-text font-posi" :class="{selected_bgc: selectLevel === 'justify'}" @click="onSelectLevel('justify')"><svg-icon icon-class="text-justify"></svg-icon></i>
                    </div>
                    <div class="vertical-aligning jointly-text">
                        <i class="jointly-text font-posi" :class="{selected_bgc: selectVertical === 'top'}" @click="onSelectVertical('top')"><svg-icon icon-class="align-top"></svg-icon></i>
                        <i class="jointly-text font-posi" :class="{selected_bgc: selectVertical === 'middle'}" @click="onSelectVertical('middle')"><svg-icon icon-class="align-middle"></svg-icon></i>
                        <i class="jointly-text font-posi" :class="{selected_bgc: selectVertical === 'bottom'}" @click="onSelectVertical('bottom')"><svg-icon icon-class="align-bottom"></svg-icon></i>
                    </div>
                </div>
                <div class="perch"></div>
            </div>
        </div>
    </div>

</template>

<style scoped lang="scss">
.text-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 10px;
    box-sizing: border-box;
    .trigger {
        width: 22px;
        height: 22px;
        display: flex;
        justify-content: center;
        align-items: center;
        > svg {
            width: 50%;
            height: 50%;
            transition: 0.5s;
        }
        svg:hover {
        transform: rotate(90deg);
      }
    }
    .text-container {
        font-size: var(--font-default-fontsize);
        .jointly-text {
            height: 25px;
            border-radius: 4px;
            background-color: var(--input-background);
            display: flex;
            justify-content: space-between;
            align-items: center;    
            >svg {
                width: 12px;
                height: 12px;
            } 
        }
        .text-top {
            position: relative;
            margin-bottom: 10px;
            display: flex;
            .select-font {
                flex: 1;
                padding: 0 10px;
            }
        }
        .text-middle{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            .text-middle-size {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex: 1;
            }
            .text-size {
                position: relative;
                width: 70px;
                padding: 0 10px;
                .input {
                    width: 55px;
                    background-color: transparent;
                    border: none;
                }
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
                }

                input[type="number"] {
                -moz-appearance: textfield;
                appearance: textfield;
                font-size: 10px;
                }

                input:focus {
                outline: none;
                }
                .font-size-list {
                    position: absolute;
                    top: 30px;
                    left: 0px;
                    width: 90px;
                    height: 225px;
                    background-color: #fff;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
                    padding: 10px 0;
                    >div {
                        display: flex;
                        align-items: center;
                        width: 100%;
                        padding: 0 10px;
                        height: 25px;
                        box-sizing: border-box;

                        &:hover {
                            background-color: var(--input-background);
                        }
                    }
                }
            }
            .overbold {
                width: 25px;
                display: flex;
                justify-content: center;
            }
        }
        .text-bottom{
            display: flex;
            align-items: center;
            justify-content: space-between;
            .text-bottom-align {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex: 1;
            }
            .level-aligning {
                width: 50%;
                padding: 0 5px;
            }
            .vertical-aligning {
                width: 38%;
                padding: 0 5px;
            }
            .font-posi {
                width: 25px;
                height: 25px;
                display: flex;
                justify-content: center;
            }
        }
        .perch {
            width: 22px;
            height: 22px;
        }
    }
    .selected_bgc {
        background-color: var(--left-navi-button-select-color) !important;
    }
}

</style>