<script setup lang="ts">
import { Context } from '@/context';
import ComponentRootCollapse from './ComponentRootCollapse.vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { debounce } from 'lodash';
import { useI18n } from 'vue-i18n';
import { Navi } from '@/context/navigate';
import { SymbolListItem, list_layout, classification_level_page, modify_parent } from '@/utils/symbol';
interface Props {
    context: Context
    container: Element | null
}
const props = defineProps<Props>();
const { t } = useI18n();
const local_data = ref<SymbolListItem[]>([]);
const status_set = ref<Set<string>>(new Set());
function _list_loader() {
    const resource = props.context.data.pagesMgr.resource;
    local_data.value = list_layout(classification_level_page(resource), status_set.value);
    modify_parent(local_data.value as SymbolListItem[]);
    console.log('local component data load result: ', local_data.value);
}
const list_loader = debounce(_list_loader, 300);
function navi_watch(t: number) {
    if (t === Navi.MODULE_CHANGE) {
        console.log('changed module: comps');
        const curr_module = props.context.navi.current_navi_module;
        if (curr_module === "Comps") _list_loader();
    }
}
function update_status_set(id: string) {
    status_set.value.has(id) ? status_set.value.delete(id) : status_set.value.add(id);
    _list_loader();
}
onMounted(() => {
    console.log('local component data container mounted');
    props.context.data.pagesMgr.watch(list_loader);
    props.context.data.symbolsMgr.watch(list_loader);
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
        :title="t('compos.lib_local')" :data="(local_data as SymbolListItem[])" :status_set="status_set"
        @change-status="update_status_set">
    </ComponentRootCollapse>
</template>
<style lang="scss" scoped></style>