/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import LableType from './LableType.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
</script>

<template>
    <div class="container">
        <LableType :title="t('lable.select_multiple_layers')">
            <template #select>
                <div class="palce"></div>
            </template>
        </LableType>
    </div>
</template>

<style scoped lang="scss">
.palce {
    height: 30px;
}
</style>