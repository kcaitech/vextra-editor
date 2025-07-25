/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { ref } from "vue";
import { Context } from "@/context";
export interface ItemData {
    name: string
    id: string
    selected: boolean
    context: Context
    rightTarget: boolean
}
const props = defineProps<{ data: ItemData }>();
const emit = defineEmits<{
    (e: "switchpage", id: string): void;
}>();
const MOUSE_LEFT = 0;
const pageItem = ref<HTMLDivElement>();
function onMouseDown(e: MouseEvent) {
    e.stopPropagation();
    if (e.button === MOUSE_LEFT) {
        document.addEventListener("mouseup", function onMouseUp() {
            e.stopPropagation();
            emit("switchpage", props.data.id);
            document.removeEventListener('mouseup', onMouseUp)
        });
    }
}
import SvgIcon from "@/components/common/SvgIcon.vue";
import page_select_icon from '@/assets/icons/svg/page-select.svg';
</script>

<template>
    <div class="pageItem" ref="pageItem"
        :class="{ container: true, 'right-target': props.data.rightTarget && !props.data.selected }"
        @mousedown="onMouseDown">
        <div class="ph">
            <SvgIcon v-if="props.data.selected" :icon="page_select_icon"/>
        </div>
        <div class="item zero-symbol">
            <div class="title" :class="{ selected: props.data.selected }">{{ props.data.name }}</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    height: 32px;
    width: calc(100% - 6px);
    line-height: 32px;
    font-weight: 500;
    color: var(--left-font-color);
    background-color: var(--left-navi-bg-color);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: visible;
    display: flex;
    flex-direction: row;
    position: relative;
    border-radius: var(--default-radius);
    transition: 0.08s;

    .item {
        display: flex;
        align-items: center;
        width: calc(100% - 46px);
        position: relative;

        >.title {
            width: 100%;
            height: 100%;
            font-size: 12px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }
}

div.container:hover {
    cursor: default;
    background-color: #efefef;
}

div.container.right-target {
    background-color: var(--left-navi-button-hover-color);
}

.ph {
    padding-left: 15px;
    box-sizing: border-box;
    width: 40px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    >svg {
        width: 12px;
        height: 12px;
    }
}

.items-wrap {
    padding: 0 10px;

    &:hover {
        background-color: var(--active-color);
    }
}

.selected {
    color: #000;
}

.select {
    background-color: rgba($color: #1878F5, $alpha: 0.2) !important;
}
</style>