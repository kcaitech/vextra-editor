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
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { ref } from 'vue';
import DocumentMenu from './Menu/index.vue';
import DevModeVue from './DevMode.vue';

interface Props {
    context: Context
}

const props = defineProps<Props>();
const ele = ref<number>(1);
const { t } = useI18n();

const plugins = props.context.pluginsMgr.search2('toolbar.home');
const comps: { component: any, params?: any }[] = []
comps.push(...plugins.begin)
comps.push({ component: DocumentMenu })
comps.push(...plugins.end)
comps.push({ component: DevModeVue })

</script>

<template>
    <div class="container" @dblclick.stop>
        <component v-for="c in comps" :is=c.component :context="props.context" :params="c.params" />
    </div>
    <!-- todo -->
    <!-- <Teleport to="body">
        <ProjectDialog :projectVisible="showbackhometips" :context="t('message.unuploaded_msg')"
            :title="t('message.back_home')" :confirm-btn="t('message.exit_document')" @clode-dialog="closeDisband"
            @confirm="hasPendingSyncCmd"></ProjectDialog>
    </Teleport> -->
</template>

<style scoped lang="scss">
.container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: auto;
    height: 32px;
}
</style>