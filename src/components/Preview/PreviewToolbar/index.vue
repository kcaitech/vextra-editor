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
import { Context } from '@/context';
import BackToHome from "./PreviewBackToHome.vue";
import UserInfo from './PreviewUserInfo.vue';
const props = defineProps<{ context: Context }>();
</script>

<template>
    <div class="toolbar">
        <BackToHome :context="props.context"></BackToHome>
        <UserInfo :context="props.context"></UserInfo>
    </div>
</template>

<style scoped>
.toolbar {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 900px
}
</style>