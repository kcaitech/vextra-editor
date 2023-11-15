<script setup lang="ts">
import {ref, nextTick, onMounted, onUnmounted} from 'vue';
import {Context} from '@/context';
import {WorkSpace} from '@/context/workspace';
import {Tool} from '@/context/tool';
import {Menu} from '@/context/menu';
import {v4} from "uuid";

const props = defineProps<{
    title?: string,
    top?: number,
    left: number,
    width?: number,
    height?: string | number,
    context: Context;
}>();
defineExpose({
    show,
    focus,
    popoverClose
})

const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();

function focus() {
    container.value?.focus();
}

function show() {
    if (props.context.menu.ispopover) {
        props.context.menu.notify(Menu.SHUTDOWN_POPOVER);
        popoverClose();
    }
    if (container.value) {
        popoverVisible.value = true;
        props.context.menu.setPopoverVisible(true);
        container.value.focus();
        document.addEventListener('mousedown', handleClickOutside);
        nextTick(() => { // popver 挂载之后计算其布局位置
            if (popover.value) {
                const body_h = document.body.clientHeight;
                const {height} = popover.value.getBoundingClientRect();
                const {y: top, left, width} = container.value!.getBoundingClientRect();
                let propsTop = top
                const su = body_h - top;
                const cur_t = su - height;

                const propsLeft = left - width - props.left;
                if (cur_t > 0) {
                    propsTop = top;
                } else {
                    propsTop = top - Math.abs(cur_t - 10);
                }
                if (propsTop - 40 < 0) {
                    propsTop = 40
                }
                popover.value.style.left = propsLeft + 'px';
                popover.value.style.top = propsTop + 'px';
                props.context.esctask.save(v4(), popoverClose);
            }
        })
    }
}

function handleClickOutside(event: MouseEvent) {
    event.target instanceof Element && !event.target.closest('.__popover-container') && popoverClose();
}

function popoverClose() {
    let exe_result: boolean = false;
    if (popoverVisible.value) {
        exe_result = true;
    }
    popoverVisible.value = false;
    props.context.workspace.focusText();
    document.removeEventListener('click', handleClickOutside);
    return exe_result;
}

function menu_watcher(t?: number) {
    if (t === Menu.SHUTDOWN_POPOVER) popoverClose();
}

onMounted(() => {
    props.context.menu.watch(menu_watcher);
})
onUnmounted(() => {
    props.context.menu.unwatch(menu_watcher);
})
</script>

<template>
    <div class="__popover-container" ref="container" tabindex="-1">
        <slot name="trigger"></slot>
        <div :style="{
      width: `${props.width ? props.width : 360}px`,
      height: `${props.height ? props.height : 200}px`,
    }" class="popover" ref="popover" v-if="popoverVisible">
            <div class="header">
                <span class="title">{{ props.title }}</span>
                <div @click="popoverClose" class="close">
                    <svg-icon icon-class="close"></svg-icon>
                </div>
            </div>
            <div class="body">
                <slot name="body"></slot>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.__popover-container {
    position: relative;
    outline: none;
    z-index: 99;

    > .popover {
        position: fixed;
        outline: none;
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
        background-color: #ffffff;
        z-index: 1;
        border-radius: 4px;

        > .header {
            width: 100%;
            height: 32px;
            border-bottom: 1px solid var(--grey-light);
            display: flex;
            font-size: var(--font-default-fontsize);
            padding: 0 var(--default-padding);
            box-sizing: border-box;
            align-items: center;

            > .title {
                line-height: 32px;
                font-weight: var(--font-default-bold);
            }

            > .close {
                width: 24px;
                height: 24px;
                position: absolute;
                right: var(--default-padding);
                display: flex;
                align-items: center;
                justify-content: center;

                > svg {
                    width: 65%;
                    height: 65%;
                }
            }
        }

        > .body {
            width: 100%;
            height: calc(100% - 32px);
            font-size: var(--font-default-fontsize);
            position: relative;
        }
    }
}
</style>