/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
// handle 管理 --暂停
import { Context } from "@/context";
import { onMounted, onUnmounted } from "vue";
import { Path } from "@/context/path";

const props = defineProps<{
    context: Context;
}>();

function render() {
    const path = props.context.path;

    if (path.isSingleSelection) {
        // 单个选择的场景
    } else {
        // 选中多个点
        const points = path.syntheticPoints;
    }
}

function pathWatcher(t: number) {
    if (t === Path.SELECTION_CHANGE) {
        render();
    }
}

onMounted(() => {
    props.context.path.watch(pathWatcher)
});
onUnmounted(() => {
    props.context.path.unwatch(pathWatcher)
})
</script>
<template>

</template>
<style scoped lang="scss">

</style>