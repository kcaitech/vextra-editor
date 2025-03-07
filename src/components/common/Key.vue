/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const props = defineProps<{
    code: string
}>();

const render_code = ref<string>(props.code);

function is_mac() {
    return /macintosh|mac os x/i.test(navigator.userAgent);
}

function init_code() {
    if (!is_mac()) return;
    let src = props.code;

    render_code.value = src
        .replace(/ctrl|Ctrl/g, "⌘")
        .replace(/shift|Shift/g, "⇧")
        .replace(/alt|Alt/g, "⌥");
}

onMounted(init_code);
</script>

<template>
<span>{{ render_code }}</span>
</template>