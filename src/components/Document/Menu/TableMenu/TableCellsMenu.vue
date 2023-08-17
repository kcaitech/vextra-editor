<script setup lang="ts">
import { ref } from 'vue';
import TableContextAlgin from './TableContextAlgin.vue';
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { Color } from '@kcdesign/data';
import { Context } from '@/context';
import { Delete } from '@element-plus/icons-vue'
interface Props {
    context: Context
}
const props = defineProps<Props>();
const isPopoverVisible = ref('col');
const isAlginMenu = ref('')
const showAlginMenu = (meun: string) => {
    if (isAlginMenu.value) return isAlginMenu.value = '';
    isAlginMenu.value = meun
}
const color = ref<Color>(new Color(1, 255, 0, 0));
</script>

<template>
    <div class="custom-popover">
        <div v-if="isPopoverVisible === 'selectCells'" class="popover-content">
            <div class="hor selected_bgc">
                <svg-icon icon-class="text-left"></svg-icon>
                <div class="menu" @click="showAlginMenu('hor')">
                    <svg-icon icon-class="down"></svg-icon>
                </div>
                <TableContextAlgin v-if="isAlginMenu === 'hor'" :menu="isAlginMenu"></TableContextAlgin>
            </div>
            <div class="ver selected_bgc">
                <svg-icon icon-class="align-top"></svg-icon>
                <div class="menu" @click="showAlginMenu('ver')">
                    <svg-icon icon-class="down"></svg-icon>
                </div>
                <TableContextAlgin v-if="isAlginMenu === 'ver'" :menu="isAlginMenu"></TableContextAlgin>
            </div>
            <div style="display: flex; align-items: center; justify-content: center;">
                <ColorPicker :context="props.context" :color="(color as Color)" :late="-270" :top="24"></ColorPicker>
            </div>
            <div>
                <svg width="16" height="16" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M7.35355 11.3536C7.54882 11.1583 7.54882 10.8417 7.35355 10.6464L4.17157 7.46447C3.97631 7.2692 3.65973 7.2692 3.46447 7.46447C3.2692 7.65973 3.2692 7.97631 3.46447 8.17157L6.29289 11L3.46447 13.8284C3.2692 14.0237 3.2692 14.3403 3.46447 14.5355C3.65973 14.7308 3.97631 14.7308 4.17157 14.5355L7.35355 11.3536ZM0 11.5H7V10.5H0V11.5Z"
                        fill="#6243ED" />
                    <path d="M8.5 1L0.5 1L0.5 21H8.5" stroke="black" />
                    <path
                        d="M12.1464 11.3536C11.9512 11.1583 11.9512 10.8417 12.1464 10.6464L15.3284 7.46447C15.5237 7.2692 15.8403 7.2692 16.0355 7.46447C16.2308 7.65973 16.2308 7.97631 16.0355 8.17157L13.2071 11L16.0355 13.8284C16.2308 14.0237 16.2308 14.3403 16.0355 14.5355C15.8403 14.7308 15.5237 14.7308 15.3284 14.5355L12.1464 11.3536ZM19.5 11.5H12.5V10.5H19.5V11.5Z"
                        fill="#6243ED" />
                    <path d="M12 1L20 1V21H12" stroke="black" />
                </svg>
            </div>
        </div>
        <div v-if="isPopoverVisible === 'row' || isPopoverVisible === 'col'" class="popover-content">
            <div style="display: flex; align-items: center; justify-content: center;">
                <ColorPicker :context="props.context" :color="(color as Color)" :late="-270" :top="24"></ColorPicker>
            </div>
            <div :style="{ transform: isPopoverVisible === 'row' ? `rotate(180deg)` : `rotate(270deg)` }">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="9" height="20" fill="#D8D8D8" />
                    <line x1="11" y1="9.5" x2="20" y2="9.5" stroke="black" />
                    <line x1="15.5" y1="5" x2="15.5" y2="14" stroke="black" />
                </svg>
            </div>
            <div :style="{ transform: isPopoverVisible === 'row' ? `rotate(0deg)` : `rotate(90deg)` }">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="9" height="20" fill="#D8D8D8" />
                    <line x1="11" y1="9.5" x2="20" y2="9.5" stroke="black" />
                    <line x1="15.5" y1="5" x2="15.5" y2="14" stroke="black" />
                </svg>
            </div>
            <div>
                <Delete style="width: 1em; height: 1em" />
            </div>
        </div>
        <div class="tip"></div>
    </div>
</template>

<style scoped lang="scss">
.custom-popover {
    position: relative;
    width: 140px;
    height: 32px;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;

    .tip {
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 8px;
        height: 8px;
        transform: translateX(-50%) translateY(50%) rotate(45deg);
        background-color: white;
        z-index: -1;
    }
}

.popover-content {
    width: 100%;
    height: 100%;
    padding: 0 5px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;

    >div {
        display: flex;
        border-radius: 4px;
        padding: 4px;

        >svg {
            width: 16px;
            height: 16px;
        }

        >div {
            height: 16px;

            >svg {
                width: 8px;
                height: 8px;
            }
        }
    }

    .hor {
        position: relative;
    }

    .ver {
        position: relative;
    }
}

.selected_bgc {
    background-color: var(--active-color) !important;
}
</style>