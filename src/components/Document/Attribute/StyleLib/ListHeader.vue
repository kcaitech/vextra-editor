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
import SvgIcon from "@/components/common/SvgIcon.vue";
import add_icon from "@/assets/icons/svg/add.svg";
defineProps<{ title: string, create?: boolean }>();
const emits = defineEmits(["create"]);
</script>
<template>
    <div class="list-header">
        <div class="title">{{ title }}</div>
        <div v-if="!create" class="create" @click.stop="emits('create')">
            <SvgIcon :icon="add_icon" />
        </div>
    </div>
</template>
<style scoped lang="scss">
.list-header {
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0 8px;
    box-sizing: border-box;

    .create {
        width: 28px;
        height: 28px;
        display: flex;
        border-radius: 4px;

        &:hover {
            background-color: #F5F5F5;
        }

        img {
            width: 16px;
            height: 16px;
            margin: auto;
        }
    }
}
</style>