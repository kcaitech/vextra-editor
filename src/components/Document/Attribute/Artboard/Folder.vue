/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { TL } from "@/components/Document/Attribute/Artboard/template";
import SvgIcon from "@/components/common/SvgIcon.vue";

interface Props {
    title: string;
    extend: boolean;
    list: TL[];
}

interface Emits {
    (e: 'toggle'): void;

    (e: 'action', temp: TL): void;
}

defineProps<Props>();
const emits = defineEmits<Emits>();

import right_icon from '@/assets/icons/svg/right.svg';
</script>
<template>
    <div class="container">
        <div class="title" @click="() => {emits('toggle')}">
            <SvgIcon :icon="right_icon" :class="extend ? 'extend' :'fold'"/>
            <div class="name">{{ title }}</div>
        </div>
        <div v-if="extend" class="list-container">
            <div v-for="(tl, index) in list" :key="index" class="tl" @click="() => {emits('action', tl)}">
                <div class="name">{{ tl.name }}</div>
                <div class="size">{{ `${tl.width} x ${tl.height}` }}</div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.container {
    width: 100%;
    border-bottom: 1px solid #EBEBEB;
    box-sizing: border-box;

    .title {
        width: inherit;
        height: 40px;
        padding: 12px 14px;
        box-sizing: border-box;

        display: flex;
        align-items: center;

        .extend {
            width: 12px;
            height: 12px;
            transform: rotate(90deg);
        }

        .fold {
            width: 12px;
            height: 12px;
        }

        .name {
            margin-left: 2px;
            line-height: 16px;
        }
    }

    .list-container {
        width: inherit;
        padding: 4px 8px;
        box-sizing: border-box;

        .tl {
            box-sizing: border-box;
            padding: 0 6px;
            height: 32px;
            width: inherit;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: var(--default-radius);
        }

        .tl:hover {
            background-color: rgb(239, 239, 239);
        }
    }
}
</style>