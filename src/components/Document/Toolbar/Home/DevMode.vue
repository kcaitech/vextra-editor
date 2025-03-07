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
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { ref, onMounted, onUnmounted } from 'vue';
import { Tool } from '@/context/tool';

interface Props {
    context: Context,
    params: any,
}

const props = defineProps<Props>();
const { t } = useI18n();

const isLable = ref(props.context.tool.isLable);
const tool_watcher = (t: number) => {
    if (t === Tool.LABLE_CHANGE) {
        isLable.value = props.context.tool.isLable;
    }
}

onMounted(() => {
    props.context.tool.watch(tool_watcher);
})
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher);
})
</script>

<template>

    <div class="model" v-if="isLable" >
        <span style="color: #BFBFBF; font-size: 12px">【开发模式】</span>
    </div>


</template>

<style scoped lang="scss">
.model {
    flex: 0 0 72px;
    display: flex;
    align-items: center;
}
</style>