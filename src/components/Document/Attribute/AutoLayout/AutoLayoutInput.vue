/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { StackSizing } from "@kcdesign/data";
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import Tooltip from '@/components/common/Tooltip.vue';

interface Props {
    icon: string;
    value: string | number;
    name: string;
    item?: string | number;
    disabled?: boolean;
    draggable?: boolean;
    isMenu?: boolean;
    show?: boolean;
}

const { t } = useI18n();

interface Emits {
    (e: "change", value: string): void;

    (e: "dragstart", event: MouseEvent): void;

    (e: "dragging", event: MouseEvent): void;

    (e: "dragend"): void;

    (e: "wheel", event: WheelEvent): void;
    (e: "shwoMenu", v: boolean): void;

    (e: "changeItem", value: StackSizing): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const inputEl = ref<HTMLInputElement>();
const active = ref<boolean>();
const hoverItem = ref(props.value);
let isDown = false;

function down(e: MouseEvent) {
    if (isDown || e.button !== 0) {
        return;
    }

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    window.addEventListener('blur', windowBlur);

    emits('dragstart', e);
}

function move(e: MouseEvent) {
    emits('dragging', e);
}

function clearDragStatus() {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
    window.removeEventListener('blur', windowBlur);

    emits('dragend');
}

function up(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }

    clearDragStatus();
}

function windowBlur() {
    clearDragStatus();
}

const is_select = ref(false);

function click() {
    if (!inputEl.value) return;
    const el = inputEl.value;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_select.value) return;
    el.select();
    is_select.value = true;
}

function change(e: Event) {
    emits('change', (e.target as HTMLInputElement).value);

    const el = inputEl.value;
    if (!el) {
        return;
    }
    el.blur();
}

function blur() {
    active.value = false;
    is_select.value = false;
}

function foucs() {
    active.value = true;
}

const showMenu = () => {
    emits('shwoMenu', true);
    document.addEventListener('click', handleClick);
}

const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.target instanceof Element && !e.target.closest('.auto-layout-options') && close();
}

const close = () => {
    emits('shwoMenu', false);
    document.removeEventListener('click', handleClick);
}

const changeItem = (v: StackSizing) => {
    emits('shwoMenu', false);
    emits('changeItem', v);
}

function wheel(event: WheelEvent) {
    if (!active.value) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();

    emits('wheel', event);
}

onMounted(() => {

})
onUnmounted(() => {

})

import SvgIcon from "@/components/common/SvgIcon.vue";
import down_icon from "@/assets/icons/svg/down.svg";
import white_select_icon from "@/assets/icons/svg/white-select.svg";
import page_select_icon from "@/assets/icons/svg/page-select.svg";

</script>

<template>
    <div :class="{ 'md-number-input': true, active }" @wheel="wheel">
        <Tooltip :content="t(`autolayout.${name}`)">
            <div class="drag-icon">
                <SvgIcon :icon="icon" :class="{ 'un-draggable': disabled || draggable }" @mousedown="down" />
            </div>
        </Tooltip>
        <input :disabled="disabled" :style="{ opacity: draggable ? '0.4' : '1' }" ref="inputEl" :value="value"
            @click="click" @change="change" @blur="blur" @focus="foucs" />
        <div class="layout-menu-svg" v-if="isMenu" @click.stop="showMenu">
            <SvgIcon :icon="down_icon" />
        </div>
        <div class="auto-layout-options" :style="{ top: item === value ? '-4px' : '-36px' }"
            v-if="isMenu && show && (typeof item !== 'undefined')">
            <div class="item" :class="{ hovered: hoverItem === item }" @click="changeItem(StackSizing.Fixed)"
                @mouseenter="hoverItem = item">
                <div class="icon">
                    <SvgIcon v-if="item === value"
                        :icon="hoverItem === item ? white_select_icon : page_select_icon"/>
                </div>
                <div class="text">{{ item }}</div>
            </div>
            <div class="item" :class="{ hovered: hoverItem !== item }" @click="changeItem(StackSizing.Auto)"
                @mouseenter="hoverItem = t(`autolayout.${disabled ? 'adapt' : StackSizing.Auto}`)">
                <div class="icon">
                    <SvgIcon v-if="item !== value"
                        :icon="hoverItem !== item ? white_select_icon : page_select_icon"/>
                </div>
                <div class="text">{{ t(`autolayout.${disabled ? 'adapt' : StackSizing.Auto}`) }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.md-number-input {
    display: flex;
    align-items: center;
    position: relative;
    width: 88px;
    height: 32px;
    padding: 0 0 0 8px;
    border: 1px solid transparent;
    box-sizing: border-box;
    background-color: var(--input-background);
    border-radius: var(--default-radius);

    .drag-icon {
        flex: 0 0 12px;
        height: 12px;

        >img {
            width: 12px;
            height: 12px;
            display: block;
            cursor: -webkit-image-set(url("@/assets/cursor/scale.png") 1.5x) 14 14, auto;
        }
    }

    .un-draggable {
        pointer-events: none;
        cursor: auto;
    }

    .layout-menu-svg {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
            flex: 0 0 12px;
            height: 12px;
            display: block;
        }

        &:hover {
            background-color: #EBEBEB;
        }
    }

    .un-draggable {
        pointer-events: none;
        cursor: auto;
    }

    >input {
        flex: 1;
        width: 40px;
        border: none;
        font-size: var(--font-default-fontsize);
        outline: none;
        text-overflow: ellipsis;
        background-color: transparent;
        font-family: var(--font-family);
        padding-left: 5px;
        display: block;
        box-sizing: border-box;
        color: #000;
    }

    input::selection {
        color: #FFFFFF;
        background: #1878F5;
    }

    input::-moz-selection {
        color: #FFFFFF;
        background: #1878F5;
    }

    .auto-layout-options {
        position: absolute;
        left: 0;
        width: 88px;
        border-radius: 4px;
        padding: 4px 0;
        border: 1px solid #f5f5f5;
        box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.08);
        background-color: #FFFFFF;
        z-index: 99;

        .item {
            display: flex;
            align-items: center;
            height: 32px;

            .icon {
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            img {
                width: 12px;
                height: 12px;
            }
        }
    }
}

.disabled {
    pointer-events: none;
    opacity: 0.4;
}

.active {
    background-color: transparent !important;
    border: 1px solid #1878F5;
}

.hovered {
    background-color: #1878F5;
    color: #fff;
}
</style>