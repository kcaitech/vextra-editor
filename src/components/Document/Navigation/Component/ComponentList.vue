<script lang="ts" setup>
import {ref} from 'vue';
import {Search} from '@element-plus/icons-vue';
import ComponentContainer from './ComponentContainer.vue';
import {Context} from '@/context';
import {useI18n} from 'vue-i18n';
import ComponentSearchPanel from './ComponentSearchPanel.vue';
import {Page, SymbolShape} from '@kcdesign/data';
import {classification_level_page, get_search_symbol_list, search_symbol_by_keywords} from '@/utils/symbol';
import {debounce} from 'lodash';
import Border from "@/components/Document/Attribute/Border/Border.vue";
import SvgIcon from "@/components/common/SvgIcon.vue";

const {t} = useI18n();

interface Props {
    context: Context
}

const props = defineProps<Props>();
const search = ref('');
const search_result = ref<SymbolShape[]>([]);
const card_type = ref<'alpha' | 'beta'>('beta');
const root = ref<Element | null>(null);
const root2 = ref<Element | null>(null);
// const isClick = ref(false);

function set_card_type(v: 'alpha' | 'beta') {
    card_type.value = v;
}

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
// function toggleList() {
//     isClick.value = !isClick.value;
// }

const searching = debounce(_searching, 300);
</script>

<template>
    <div class="container">
        <div class="search_togger">
            <el-input v-model="search" class="w-50 m-2" :placeholder="t('compos.search_compos')"
                      @input="searching">
                <template v-slot:prefix>
                    <svg-icon icon-class="search" style="width: 12px;height: 12px"></svg-icon>
                </template >
            </el-input>
            <div class="toggle_list">
                <svg-icon v-if="card_type === 'alpha'" icon-class="source"
                          @click.stop="() => set_card_type('beta')"></svg-icon>
                <svg-icon v-if="card_type === 'beta'" icon-class="menu"
                          @click.stop="() => set_card_type('alpha')"></svg-icon>
            </div>
        </div>
        <div class="body" ref="root" v-show="!search">
            <ComponentContainer :context="context" :search="search" :is-attri="false"
                                :card-type="card_type" :root="root"></ComponentContainer>
        </div>
        <div class="body" ref="root2">
            <ComponentSearchPanel v-if="search" :context="props.context" :data="(search_result as SymbolShape[])"
                                  :is-attri="false" :card-type="card_type" :root="root2">
            </ComponentSearchPanel>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    height: 100%;
    min-width: 240px;
    font-size: var(--font-default-fontsize);
    box-sizing: border-box;

    .search_togger {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 50px;
        padding: 8px 4px 8px 12px;
        box-sizing: border-box;

        .el-input {
            width: 192px;
            height: 34px;
            font-size: 12px;
            border: none;

            :deep(.el-input__wrapper) {
                background-color: #F5F5F5;
                border-radius: 8px;
                box-shadow: none;
            }

            :deep(.el-input__wrapper.is-focus) {
                box-shadow: 0 0 0 1px var(--active-color) inset !important;
            }

            :deep(.el-input__inner::placeholder) {
                color: #BFBFBF;
            }

            :deep(.el-input__wrapper:hover) {
                background-color: #EBEBEB;
            }

            :deep(.el-input__inner) {
                font-size: 13px;
                color: #262626;
            }

            :deep(.el-input__prefix-inner) {
                color: #333333;
            }
        }

        .toggle_list {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--default-radius);

            svg {
                width: 16px;
                height: 16px;
            }
        }

        .toggle_list:hover {
            background-color: #F5F5F5;
        }

        .active {
            background-color: #EBEBEB;
        }
    }

    .body {
        height: calc(100% - 35px);
        box-sizing: border-box;
    }
}
</style>