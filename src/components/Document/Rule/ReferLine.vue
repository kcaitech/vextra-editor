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
import { useI18n } from 'vue-i18n';


const { t } = useI18n();

import TypeHeader from "@/components/Document/Attribute/TypeHeader.vue";
</script>
<template>
    <div class="refer-line-container">
        <TypeHeader :title="t('attr.fill')" class="mt-24" :active="true"></TypeHeader>
    </div>
</template>
<style scoped lang="scss">

</style>