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
import Scale from './Scale.vue';
import { Context } from '@/context';
import LableToggle from './LableToggle.vue';

const props = defineProps<{
    context: Context
}>();

const plugins = props.context.pluginsMgr.search2('toolbar.others');
const comps: { component: any, params?: any }[] = []

comps.push(...plugins.begin)
comps.push({ component: LableToggle })
comps.push({ component: Scale })
comps.push(...plugins.end)
</script>
<template>
<div class="others" @dblclick.stop>
    <component v-for="c in comps" :is=c.component :context="props.context" :params="c.params"/>
</div>
</template>

<style scoped lang="scss">
.others {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    position: absolute;
    right: 0;

    div {
        margin: auto 0 auto 8px;
    }
}
</style>