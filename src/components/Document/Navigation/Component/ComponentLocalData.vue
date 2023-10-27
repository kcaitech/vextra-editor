<script setup lang="ts">
import {Context} from '@/context';
import ComponentRootCollapse from './ComponentRootCollapse.vue';
import {onMounted, onUnmounted, ref} from 'vue';
import {debounce} from 'lodash';
import {useI18n} from 'vue-i18n';
import {Navi} from '@/context/navigate';
import {
    SymbolListItem,
    list_layout,
    classification_level_page,
    modify_parent,
    init_status_set_by_symbol,
    clear_scroll_target
} from '@/utils/symbol';

interface Props {
    context: Context
    container: Element | null
    isAttri: boolean
    cardType: 'alpha' | 'beta'
}

const props = defineProps<Props>();
const {t} = useI18n();
const local_data = ref<SymbolListItem[]>([]);
const status_set = ref<Set<string>>(new Set());

function _list_loader() {
    if (props.context.navi.current_navi_module !== "Comps") return;
    const data = classification_level_page(props.context.data.pagesMgr.resource);
    modify_parent(data as SymbolListItem[]);
    const need_pre_init_set = props.context.component.into_view_target;
    if (need_pre_init_set) {
        init_status_set_by_symbol(data, status_set.value, need_pre_init_set);
        clear_scroll_target(props.context);
    }
    local_data.value = list_layout(data, status_set.value);
    console.log('local component data load result: ', local_data.value);
}

const list_loader = debounce(_list_loader, 1200);

function navi_watch(t: number) {
    if (t === Navi.MODULE_CHANGE) {
        const curr_module = props.context.navi.current_navi_module;
        if (curr_module === "Comps") _list_loader();
    }
}

function update_status_set(id: string) {
    status_set.value.has(id) ? status_set.value.delete(id) : status_set.value.add(id);
    _list_loader();
}

onMounted(() => {
    props.context.data.pagesMgr.watch(list_loader);
    props.context.data.symbolsMgr.watch(list_loader);
    props.context.data.artboardMgr.watch(list_loader);
    props.context.navi.watch(navi_watch);
    _list_loader();
})
onUnmounted(() => {
    props.context.data.pagesMgr.unwatch(list_loader);
    props.context.data.symbolsMgr.unwatch(list_loader);
    props.context.navi.unwatch(navi_watch);
})
</script>
<template>
    <ComponentRootCollapse :context="props.context" :extend="true" :container="props.container"
                           :title="t('compos.lib_local')" :data="(local_data as SymbolListItem[])"
                           :status_set="status_set"
                           @change-status="update_status_set" :is-attri="props.isAttri" :card-type="props.cardType">
    </ComponentRootCollapse>
</template>
<style lang="scss" scoped></style>