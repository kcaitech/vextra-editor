<script lang="ts" setup>
import {ref} from 'vue';
import {Search} from '@element-plus/icons-vue';
import ComponentContainer from './ComponentContainer.vue';
import {Context} from '@/context';
import {useI18n} from 'vue-i18n';
import ComponentSearchPanel from './ComponentSearchPanel.vue';
import {SymbolShape} from '@kcdesign/data';
import {search_symbol_by_keywords} from '@/utils/symbol';
import {debounce} from 'lodash';

const {t} = useI18n();

interface Props {
    context: Context
}

const props = defineProps<Props>();
const search = ref('');
const search_result = ref<SymbolShape[]>([]);
const card_type = ref<'alpha' | 'beta'>('beta');
const root = ref<Element | null>(null);

function set_card_type(v: 'alpha' | 'beta') {
    card_type.value = v;
}

function _searching() {
    search_result.value = search_symbol_by_keywords(props.context, search.value);
}

const searching = debounce(_searching, 300);
</script>

<template>
    <div class="container">
        <div class="search_togger">
            <el-input v-model="search" class="w-50 m-2" :placeholder="t('compos.search_compos')" :prefix-icon="Search"
                      @input="searching"/>
            <div class="toggle_list">
                <svg-icon v-if="card_type === 'alpha'" icon-class="resource"
                          @click.stop="() => set_card_type('beta')"></svg-icon>
                <svg-icon v-if="card_type === 'beta'" icon-class="text-bulleted-list"
                          @click.stop="() => set_card_type('alpha')"></svg-icon>
            </div>
        </div>
        <div class="body" v-show="!search">
            <ComponentContainer :context="context" :search="search" :is-attri="false"
                                :card-type="card_type" :root="root"></ComponentContainer>
        </div>
        <div class="body">
            <ComponentSearchPanel v-show="search" :context="props.context" :data="(search_result as SymbolShape[])">
            </ComponentSearchPanel>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    height: 100%;
    min-width: 250px;
    padding: 8px 0 8px 8px;
    font-size: var(--font-default-fontsize);
    box-sizing: border-box;

    .search_togger {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 28px;
        margin-bottom: 10px;

        .el-input {
            height: 28px;
            font-size: 10px;
            line-height: 28px;

            :deep(.el-input__wrapper) {
                background-color: var(--grey-light);
            }

            :deep(.el-input__wrapper.is-focus) {
                box-shadow: 0 0 0 1px var(--active-color) inset !important;
            }
        }

        .toggle_list {
            width: 28px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;

            svg {
                width: 16px;
                height: 16px;
            }
        }
    }

    .body {
        height: calc(100% - 35px);
        box-sizing: border-box;
    }
}
</style>