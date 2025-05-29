/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import {computed} from 'vue';

interface Props {
    content: string
    offset?: number
    placement?: any
    show?: number
}

const props = defineProps<Props>();

function is_mac() {
    return /macintosh|mac os x/i.test(navigator.userAgent);
}

const render_code_computed = computed(() => {
    if (is_mac()) {
        let src = props.content;
        src = src.replace(/ctrl|Ctrl/g, "⌘");
        src = src.replace(/shift|Shift/g, "⇧");
        src = src.replace(/alt|Alt/g, "⌥");
        return src;
    } else {
        return props.content;
    }
})
</script>

<template>
    <el-tooltip class="box-item" effect="dark" :content="render_code_computed" :placement="placement || 'bottom'"
                :show-after=" show || 500" :offset="offset || 10" :hide-after="0">
        <slot/>
    </el-tooltip>
</template>

<style scoped lang="scss">
</style>
