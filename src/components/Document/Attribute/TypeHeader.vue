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
interface Props {
    title: string
    active: boolean
}

const props = withDefaults(defineProps<Props>(), {
    active: true
})
</script>
<template>
    <div class="header-container">
        <div class="header">
            <div :class="{ title: true, active }">{{ props.title }}</div>
            <div class="tool">
                <slot name="tool" />
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.header-container {
    width: 100%;
    min-height: 28px;
    box-sizing: border-box;
    position: relative;
    display: flex;
    align-items: center;

    .header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;

        >.title {
            flex: 0 0 auto;
            height: 14px;
            font-size: 12px;
            font-weight: normal;
            font-feature-settings: "kern" on;
            color: #737373;
        }

        .active {
            color: #000000;
        }

        .tool {
            display: flex;
            align-items: center;
            flex: 0 0 auto;
            gap: 8px;
        }
    }

    >.header+.line {
        margin-top: 4px;
        margin-left: -10px;
        width: 250px;
        height: 1px;
        background-color: var(--theme-color-line);
        flex: 0 0 auto;
    }
}
</style>