<script setup lang="ts">
import { ref, nextTick, defineProps, defineEmits } from 'vue';
import ToolButton from '../ToolButton.vue';
import { Tools } from '@/context/toolbar';

type Button = InstanceType<typeof ToolButton>;

const props = defineProps<{
    active: boolean,
    pattern: Tools | undefined,
}>();
const emit = defineEmits<{
    (e: "select", pattern: Tools): void;
}>();

const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const button = ref<Button>();
const container =  ref<HTMLDivElement>();

const patterns = ((items: [string, Tools, string][]) => (items.map(item => ({ value: item[0], content: item[1], key: item[2]}))))([
    ['Rectangle', Tools.PattnerR, 'R'],
    ['Line', Tools.PattnerL, 'L']
]);

function showMenu() {
  if (popoverVisible.value) {
    close();
  }
  if (button.value?.toolButtonEl) {
    const el = button.value?.toolButtonEl;
    popoverVisible.value = true;
    nextTick(() => {
      if (popover.value && container.value) {      
        popover.value.style.left = el.offsetLeft + 'px';
        popover.value.style.top = el.offsetHeight + 2 + 'px';
        container.value.addEventListener('blur', onMenuBlur);
        container.value.focus();
      } 
    })
  }
}
function close() {
    popoverVisible.value = false;
    container.value && container.value.removeEventListener('blur', onMenuBlur);
}
function onMenuBlur() {
  if (container.value) {
    close();
  }
}
function select(pattern: Tools) {    
    emit('select', pattern);
    close();
}
</script>
<template>
    <div ref="container" class="container" tabindex="-1">
        <ToolButton ref="button" :selected="props.active">
            <div class="svg-container" title="Frame">
                <svg-icon :icon-class="props.pattern ? props.pattern : 'pattern-rectangle'"></svg-icon>
            </div>
            <div class="menu" @click="showMenu">
                <svg-icon icon-class="down"></svg-icon>
            </div>
        </ToolButton>
        <div class="popover" ref="popover" v-if="popoverVisible">
            <div v-for="item in patterns" :key="item.value" class="pattern-item" @click="() => {select(item.content)}">
                <div class="check" :style="{ visibility: props.pattern === item.content ? 'visible' : 'hidden'  }"></div>
                <svg-icon :icon-class="item.content"></svg-icon>
                <span>{{ item.value }}</span>
                <span>{{ item.key }}</span>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.container {
    outline: none;
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
        z-index: 1;
        width: 200px;
        background-color: var(--theme-color);
        border-radius: 4px;
        outline: none;
        box-sizing: border-box;
        padding: var(--default-padding-half) 0;
        > .pattern-item {
            display: flex;
            flex-direction: row;
            align-items: center;
            height: 32px;
            width: 100%;
            color: var(--theme-color-anti);
            padding: 0 var(--default-padding);
            box-sizing: border-box;
            > .check {
                border-style: solid;
                border-color: var(--theme-color-anti);
                width: 10px;
                height: 6px;
                border-width: 0px 0px 2px 2px;
                transform: rotate(-45deg);
                visibility: hidden;
            }
            > svg {
                display: block;
                flex: 0 0 16px;
                height: 16px;
                margin-left: var(--default-margin);
            }
            > span {
                flex: 0 0 48px;
                margin-left: var(--default-margin-half);
            }
            > span + span {
                flex: 1 1 auto;
                text-align: right;
            }
        }
        > .pattern-item:hover {
            background-color: var(--active-color);
        }

    }
}



</style>