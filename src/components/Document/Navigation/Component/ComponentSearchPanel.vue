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
import {Context} from '@/context';
import ComponentListView from './ComponentListView.vue';
import {SymbolShape} from '@kcaitech/vextra-core';
import {onMounted, ref} from 'vue';
import {useI18n} from 'vue-i18n';

const {t} = useI18n();

interface Props {
    context: Context
    data: SymbolShape[]
    isAttri: boolean
    cardType: "alpha" | "beta"
    root: Element | null;
}

const props = defineProps<Props>();
const scroll_container = ref<Element | null>(null);
const top_wrapper = ref<Element | null>(null);

function register_container() {
    const el = props.root;
    if (!el) return;
    scroll_container.value = el.querySelector('.el-scrollbar > .el-scrollbar__wrap');
}

onMounted(() => {
    register_container();
})
</script>
<template>
    <div class="component-search-panel" ref="top_wrapper">
        <el-scrollbar :always="true">
            <div v-if="scroll_container">
                <ComponentListView :context="props.context" :data="props.data" v-if="props.data.length"
                                   :container="scroll_container" :is-attri="props.isAttri"
                                   :card-type="props.cardType"></ComponentListView>
                <div class="null-result" v-else>
                    {{ t('search.search_results') }}
                </div>
            </div>
        </el-scrollbar>
    </div>
</template>
<style scoped lang="scss">
.component-search-panel {
    width: 100%;
    height: 100%;
    padding-left: 12px;
    box-sizing: border-box;
}

.null-result {
    width: 100%;
    text-align: center;
    margin-top: 82px;
    font-size: 12px;
    color: #8C8C8C;
}

.el-scrollbar {
    padding-right: 10px;
}
</style>