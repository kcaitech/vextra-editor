<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {Search} from '@element-plus/icons-vue';
import ComponentContainer from './ComponentContainer.vue';
import {Context} from '@/context';
import {useI18n} from 'vue-i18n';
import {get_search_symbol_list, search_symbol_by_keywords} from '@/utils/symbol';
import {debounce} from 'lodash';
import {Page, SymbolShape} from '@kcdesign/data';
import ComponentSearchPanel from './ComponentSearchPanel.vue';

const {t} = useI18n();

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
</script>

<template>
    <div class="container">
        <div class="header">
            <span class="title">{{ t('compos.compos') }}</span>
            <div class="close">
                <svg-icon icon-class="close" @click.stop="close"></svg-icon>
            </div>
        </div>
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
        <div class="body" ref="root" v-show="!search">
            <ComponentContainer :context="context" :search="search" :is-attri="true"
                                :card-type="card_type" :root="root"></ComponentContainer>
        </div>
        <div class="body" ref="root2">
            <ComponentSearchPanel v-if="search" :context="props.context" :data="(search_result as SymbolShape[])"
                                  :is-attri="true" :card-type="card_type" :root="root2">
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

    .header {
        width: 100%;
        height: 32px;
        border-bottom: 1px solid var(--grey-light);
        display: flex;
        box-sizing: border-box;
        align-items: center;
        margin-bottom: 10px;

        .title {
            line-height: 32px;
            font-weight: var(--font-default-bold);
        }

        .close {
            width: 24px;
            height: 24px;
            position: absolute;
            right: var(--default-padding-half);
            display: flex;
            align-items: center;
            justify-content: center;

            > svg {
                width: 65%;
                height: 65%;
            }
        }
    }

    .search_togger {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 28px;
        margin-bottom: 10px;

        .el-input {
            height: 28px;
            font-size: 12px;
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
        height: calc(100% - 80px);
        box-sizing: border-box;
    }
}
</style>