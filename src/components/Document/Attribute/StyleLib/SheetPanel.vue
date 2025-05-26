/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { ref } from "vue";
import SvgIcon from "@/components/common/SvgIcon.vue";
import down_icon from "@/assets/icons/svg/triangle-down.svg";
import right_icon from "@/assets/icons/svg/triangle-right.svg";
import { Context } from "@/context";
import { SheetCatch, StyleCtx } from "@/components/Document/Attribute/stylectx";

/**
 * 样式表面板：用于以列表形式展示一个样式表内所有的样式，其中item为表中容纳子元素的组件
 */
defineProps<{
    context: Context;
    manager: StyleCtx;
    data: SheetCatch;
    item: any;
    listStatus?: boolean;
}>();
const emits = defineEmits<{
    (e: 'update'): void;
}>();
const extend = ref<boolean>(true);
</script>
<template>
    <div class="sheet-panel">
        <div class="header" @click="extend = !extend">
            <SvgIcon :icon="extend ? down_icon : right_icon" />
            <span>{{ data.name }}</span>
        </div>
        <div v-if="extend" style="width: 100%; height: fit-content;" :class="{ grid: listStatus }">
            <component v-for="c in data.variables" :key="c.id" :is="item" :context="context" :manager="manager"
                       :data="c" @update="emits('update')"/>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.sheet-panel {
    width: 100%;
    height: fit-content;

    .header {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 32px;
        padding: 6px;
        border-radius: 6px;
        box-sizing: border-box;
        font-weight: var(--font-weight-medium);

        &:hover {
            background-color: #f5f5f5;
        }

        img {
            width: 14px;
            height: 14px;
        }
    }

    .grid {
        display: flex;
        flex-wrap: wrap;
    }
}
</style>