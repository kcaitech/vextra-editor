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
import { useI18n } from "vue-i18n";

const t = useI18n().t;

const emits = defineEmits<{
    (e: 'modify'): void;
    (e: 'remove'): void;
}>();
</script>

<template>
    <div id="remove-entrance">
        <div @click="emits('modify')">{{ t('stylelib.modify') }}</div>
        <div @click="emits('remove')">{{ t('stylelib.delete') }}</div>
    </div>
</template>

<style scoped lang="scss">
#remove-entrance {
    position: absolute;
    width: 100px;
    height: fit-content;

    padding: 8px 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-radius: var(--default-radius);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    background-color: var(--theme-color-anti);

    > div {
        width: 100%;
        height: 28px;
        display: flex;
        justify-content: center;
        align-items: center;

        &:hover {
            background-color: var(--active-color);
            color: var(--theme-color-anti);
        }
    }
}
</style>