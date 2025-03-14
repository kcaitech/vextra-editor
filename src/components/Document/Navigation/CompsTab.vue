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
import { Context } from "@/context";
import ComponentList from "./Component/ComponentList.vue";

interface Props {
    context: Context
}
const props = defineProps<Props>();

</script>

<template>
    <div class="comps-container">
        <ComponentList :context="props.context"/>
    </div>
</template>

<style scoped lang="scss">
.comps-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: #fff;
    font-size: var(--font-default-fontsize);
    box-sizing: border-box;
    overflow: hidden;

    .el-scrollbar {
        padding-right: 10px;

        .demo-collapse {
            box-sizing: border-box;

        }

        .el-collapse {
            --el-collapse-border-color: none;

            :deep(.el-collapse-item__content) {
                padding-bottom: 10px;
            }
        }

    }

    :deep(.el-collapse-item__header) {
        height: 35px;
        font-size: 12px;
        border-bottom-color: transparent;
        border-radius: 4px;
        padding-left: 4px;

        &:hover {
            background-color: var(--grey-light);
        }
    }
}
</style>