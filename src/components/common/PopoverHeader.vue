/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import add_icon from "@/assets/icons/svg/add.svg";
import close_icon from "@/assets/icons/svg/close.svg";
import SvgIcon from "@/components/common/SvgIcon.vue";
import toggle_list from "@/assets/icons/svg/toggle-list.svg";
import toggle_grid from "@/assets/icons/svg/toggle-grid.svg";

withDefaults(defineProps<{
    title: string;
    grid?: boolean;
    toggle?: boolean;
    create?: boolean;
    close?: boolean;
}>(), {
    create: true,
    close: true
})

const emits = defineEmits<{
    (e: "create", event: MouseEvent): void;
    (e: "toggle", event: MouseEvent): void;
    (e: "close"): void;
}>();
</script>
<template>
    <div class="header">
        <div class="title">{{ title }}</div>
        <div class="tool">
            <div v-if="toggle" class="add" @click="(event) => emits('toggle', event)">
                <SvgIcon :icon="grid ? toggle_grid : toggle_list"/>
            </div>
            <div v-if="create" class="add" @click="(event) => emits('create', event)">
                <SvgIcon :icon="add_icon"/>
            </div>
            <div v-if="close" class="close" @click="emits('close')">
                <SvgIcon :icon="close_icon"/>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.header {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 12px;
    border-bottom: 1px solid #F5F5F5;

    .tool {
        display: flex;
        align-items: center;
        gap: 4px;

        > .add {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            box-sizing: border-box;

            &:hover {
                background-color: #f5f5f5;
            }

            > img {
                outline: none;
                width: 16px;
                height: 16px;
            }
        }

        > .close {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            box-sizing: border-box;

            &:hover {
                background-color: #f5f5f5;
            }

            > img {
                outline: none;
                width: 16px;
                height: 16px;
                padding: 2px;
                margin-top: 1px;
                box-sizing: border-box;
            }
        }
    }
}
</style>