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
import { Context } from '@/context';

interface Props {
    context: Context,
    params: any
}
const props = defineProps<Props>();

</script>
<template>
    <div style="width: 16px;height: 52px;display: flex;align-items: center;justify-content: center;">
        <div class="vertical-line" />
    </div>
</template>

<style scoped lang="scss">
.vertical-line {
    width: 1px;
    height: 20px;
    background-color: grey;
    flex: 0 0 auto;
    margin-left: 5px;
    margin-right: 5px;
}
</style>