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
import Scale from './PreviewScale.vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { Context } from '@/context';
interface Props {
    context: Context
}
const props = defineProps<Props>();
const isFull = ref<boolean>(false);

const watchFull = () => {
    if (document.fullscreenElement) {
        isFull.value = true;
    } else {
        isFull.value = false;
    }
}

onMounted(() => {
    document.addEventListener('fullscreenchange', watchFull);
})

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', watchFull);
})
const plugins = props.context.pluginsMgr.search2('preview.toolbar.others');
const comps: { component: any, params?: any }[] = []
comps.push(...plugins.begin)
comps.push({ component: Scale })
comps.push(...plugins.end)
</script>
<template>
    <div class="user-info" @dblclick.stop>
        <component v-for="c in comps" :is=c.component :context="props.context" :params="c.params" />
    </div>
</template>

<style scoped lang="scss">
.user-info {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    position: absolute;
    right: 0px;

    div {
        margin: auto 0 auto 8px;
    }

    .full {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        svg {
            width: 18px;
            height: 18px;
        }
    }
}
</style>