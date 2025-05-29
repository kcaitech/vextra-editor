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
import { onMounted, ref } from 'vue';
import ComponentContainer from './ComponentContainer.vue';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { get_search_symbol_list, search_symbol_by_keywords } from '@/utils/symbol';
import { debounce } from 'lodash';
import { Page, SymbolShape } from '@kcdesign/data';
import ComponentSearchPanel from './ComponentSearchPanel.vue';
import SvgIcon from "@/components/common/SvgIcon.vue";
import Tooltip from "@/components/common/Tooltip.vue";

const { t } = useI18n();

interface Props {
    context: Context
    currentInstanceFrom: string
}

interface Emits {
    (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const search = ref('');
const card_type = ref<'alpha' | 'beta'>('beta');
const root = ref<Element | null>(null);
const root2 = ref<Element | null>(null);

function set_card_type(v: 'alpha' | 'beta') {
    if (props.currentInstanceFrom) {
        props.context.component.set_scroll_target(props.currentInstanceFrom);
    }
    card_type.value = v;
    localStorage.setItem('card_type', v)
}

const search_result = ref<SymbolShape[]>([]);

function _searching() {
    const pagelist = props.context.data.pagesList;
    const list: Page[] = [];
    for (let i = 0, len = pagelist.length; i < len; i++) {
        const desc = pagelist[i];
        const p = props.context.data.pagesMgr.getSync(desc.id);
        if (p) list.push(p);
    }
    const symbols = get_search_symbol_list(list);
    search_result.value = search_symbol_by_keywords(props.context, search.value, symbols);
}

const searching = debounce(_searching, 300);
const close = () => {
    emit('close');
}

onMounted(() => {
    if (localStorage.getItem('card_type')) {
        card_type.value = localStorage.getItem('card_type') as 'alpha' | 'beta'
    }

})

import close_icon from '@/assets/icons/svg/close.svg';
import search_icon from '@/assets/icons/svg/search.svg';
import resource_icon from '@/assets/icons/svg/resource-icon.svg';
import text_bulleted_list_icon from '@/assets/icons/svg/text-bulleted-list.svg';

</script>

<template>
    <div class="container">
        <div class="header">
            <span class="title">{{ t('compos.compos') }}</span>
            <div class="close" @click.stop="close">
                <SvgIcon :icon="close_icon"/>
            </div>
        </div>
        <div class="search_togger">
            <el-input v-model="search" class="w-50 m-2" :placeholder="t('compos.search_compos')" @input="searching">
                <template v-slot:prefix>
                    <SvgIcon :icon="search_icon" style="width: 12px;height: 12px"/>
                </template>
            </el-input>
            <Tooltip :content="`${t('compos.toggle_list_style')}`">
                <div class="toggle_list">
                    <SvgIcon v-if="card_type === 'alpha'" :icon="resource_icon"
                              @click.stop="() => set_card_type('beta')"/>
                    <SvgIcon v-if="card_type === 'beta'" :icon="text_bulleted_list_icon"
                              @click.stop="() => set_card_type('alpha')"/>
                </div>
            </Tooltip>
        </div>
        <div class="body" ref="root" v-show="!search">
            <ComponentContainer :context="context" :search="search" :is-attri="true" :card-type="card_type" :root="root">
            </ComponentContainer>
        </div>
        <div class="body" ref="root2">
            <ComponentSearchPanel v-if="search" :context="props.context" :data="(search_result as SymbolShape[])"
                :is-attri="true" :card-type="card_type" :root="root2">
            </ComponentSearchPanel>
        </div>
    </div>
</template>

<style scoped lang="scss">
:deep(.el-input__inner) {
    --el-input-inner-height: 32px !important;
}

:deep(.el-input__prefix) {
    color: #333333;
    height: 32px;
}

.container {
    height: 100%;
    min-width: 240px;
    // padding: 0 12px;
    font-size: var(--font-default-fontsize);
    box-sizing: border-box;

    .header {
        width: 100%;
        height: 40px;
        padding: 0 12px;
        border-bottom: 1px solid #F5F5F5;
        display: flex;
        box-sizing: border-box;
        align-items: center;
        justify-content: space-between;

        .title {
            line-height: 32px;
            font-weight: var(--font-default-bold);
        }

        .close {
            width: 24px;
            height: 24px;
            padding: 6px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;

            &:hover {
                background-color: #F5F5F5;
            }

            &:active {
                background-color: #EBEBEB;
            }

            >svg {
                width: 100%;
                height: 100%;
            }
        }
    }

    .search_togger {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 48px;
        gap: 4px;
        padding: 0 10px;

        .el-input {
            height: 32px;
            width: 192px;
            font-size: 12px;
            line-height: 32px;

            :deep(.el-input__wrapper) {
                background-color: #F5F5F5;
                border: 1px solid #F5F5F5;
                border-radius: 8px;
                box-shadow: none;
                box-sizing: border-box;

                &:hover {
                    background-color: #EBEBEB;
                }
            }

            :deep(.el-input__wrapper.is-focus) {
                border: 1px solid #1878F5;
                background-color: #F5F5F5;
                color: #262626;
                box-shadow: none;
            }
        }

        .toggle_list {
            width: 28px;
            height: 28px;
            //padding: 4px;
            border-radius: 6px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;

            &:hover {
                background-color: #F5F5F5;
            }

            &:active {
                background-color: #EBEBEB;
            }

            svg {
                width: 16px;
                height: 16px;
            }
        }
    }

    .body {
        height: calc(100% - 88px);
        box-sizing: border-box;
    }
}
</style>