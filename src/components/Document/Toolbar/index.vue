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
import { shallowRef } from "vue"
import { Context } from '@/context';
import Home from "./Home/index.vue";
import EditorTools from "./Tools/index.vue";
import UserInfo from './Others/index.vue';
const props = defineProps<{ context: Context }>();
const selection = shallowRef(props.context.selection);
</script>

<template>
    <div class="toolbar">
        <Home :context="props.context"></Home>
        <EditorTools :context="context" :selection="selection"></EditorTools>
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
}
</style>