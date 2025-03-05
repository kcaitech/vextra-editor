<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { Context } from '@/context';
import { Menu } from '@/context/menu';
import { v4 } from "uuid";
interface Props {
    context: Context;

    auto_to_right_line?: boolean
    event?: string;
    title?: string;
    top?: number;
    left?: number;
    width?: number;
    height?: number,
}
const props = defineProps<Props>();
defineExpose({ show, focus, popoverClose });

const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();

function focus() {
    container.value?.focus();
}

function show() {
    if (props.context.menu.isPopoverExisted) {
        props.context.menu.notify(Menu.SHUTDOWN_POPOVER);
        props.context.menu.isPopoverExisted = false;
        popoverClose();
    }

    if (!container.value) return;

    popoverVisible.value = true;
    props.context.menu.isPopoverExisted = true;
    container.value.focus();
    document.addEventListener('click', handleClickOutside);
    props.context.escstack.save(v4(), popoverClose);

    nextTick(locate);
}

function locate() {
    if (!popover.value) return;
    if (!container.value) return;
    const body_h = document.body.clientHeight;

    const { height, width } = popover.value.getBoundingClientRect();

    const { y, x, left } = container.value.getBoundingClientRect();

    // y
    let _top = y
    const su = body_h - y;
    const cur_t = su - height;

    if (cur_t > 0) {
        _top = y;
    } else {
        _top = y - Math.abs(cur_t - 10);
    }
    if (_top - 40 < 0) {
        _top = 40
    }

    // x
    let _left = x - width - (props.left || 0);

    if (props.auto_to_right_line) {
        const r = props.context.workspace.root.right;
        if (left > r) {
            _left = left - (left - r) - width
        } else {
            _left = left - (props.event?.includes('text') ? 208 : 172) - width
        }
    }

    popover.value.style.left = _left + 'px';
    popover.value.style.top = _top + 'px';
}

function handleClickOutside(event: MouseEvent) {
    event.target instanceof Element && !event.target.closest('.__popover-container') && popoverClose();
}

function popoverClose() {
    const exe_result: boolean = popoverVisible.value;
    popoverVisible.value = false;
    props.context.workspace.focusText();
    props.context.menu.isPopoverExisted = false;
    document.removeEventListener('click', handleClickOutside);
    return exe_result;
}

function menu_watcher(t: number) {
    if (t === Menu.SHUTDOWN_POPOVER) {
        popoverClose();
    } else if (t === Menu.UPDATE_LOCATE) {
        locate();
    }
}

onMounted(() => {
    props.context.menu.watch(menu_watcher);
})
onUnmounted(() => {
    props.context.menu.unwatch(menu_watcher);
})

import close_icon from "@/assets/icons/svg/close.svg";
import SvgIcon from './SvgIcon.vue';

</script>

<template>
    <div class="__popover-container" ref="container" tabindex="-1">
        <slot name="trigger" />
        <div ref="popover" v-if="popoverVisible" class="popover" :style="{
            width: props.width ? props.width + 'px' : 'auto',
            height: props.height ? props.height + 'px' : 'auto',
        }">
            <div class="header">
                <span class="title">{{ props.title }}</span>
                <div @click="popoverClose" class="close">
                    <SvgIcon :icon="close_icon"/>
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

    >.popover {
        position: fixed;
        outline: none;
        box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
        background-color: #FFFFFF;
        border-radius: 8px;
        border: 1px solid #F0F0F0;
        z-index: 999;

        >.header {
            width: 100%;
            height: 40px;
            border-bottom: 1px solid #F5F5F5;
            display: flex;
            font-size: var(--font-default-fontsize);
            padding: 14px 12px;
            box-sizing: border-box;
            align-items: center;

            >.title {
                line-height: 12px;
                font-weight: var(--font-default-bold);
                color: #3D3D3D;
            }

            >.close {
                width: 28px;
                height: 28px;
                position: absolute;
                border-radius: 4px;
                right: 11px;
                display: flex;
                align-items: center;
                justify-content: center;

                >svg {
                    width: 12px;
                    height: 12px;
                }

                &:hover {
                    background-color: #F5F5F5;
                }
            }
        }

        >.body {
            width: 100%;
            height: calc(100% - 32px);
            font-size: var(--font-default-fontsize);
            position: relative;
        }
    }
}
</style>