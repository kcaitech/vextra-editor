<script setup lang="ts">
import { Context } from '@/context';
import { Component } from '@/context/component';
import ComponentRootCollapse from './ComponentRootCollapse.vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { debounce } from 'lodash';
import { SymbolListItem, list_layout, classification_level_page, modify_parent } from '@/utils/symbol';
import { useI18n } from 'vue-i18n';
interface Props {
    context: Context
    search: string
}
const props = defineProps<Props>();
const { t } = useI18n();
const local_data = ref<SymbolListItem[]>([]);
function _list_loader() {
    const status = props.context.component.list_status;
    local_data.value = list_layout(classification_level_page(props.context.data.pagesMgr.resource), status);
    modify_parent(local_data.value as SymbolListItem[]);
    console.log('list loader result: ', local_data.value);
}
const list_loader = debounce(_list_loader, 300);
function component_watcher(t: number) {
    if (t === Component.EXTEND_FOLDER) _list_loader();
}
onMounted(() => {
    props.context.data.pagesMgr.watch(list_loader);
    props.context.data.symbolsMgr.watch(list_loader);
    props.context.component.watch(component_watcher);
    props.context.component.reset_list_status();
    props.context.component.init_component_container();
    _list_loader();
    console.log('container mounted');
})
onUnmounted(() => {
    props.context.data.pagesMgr.unwatch(list_loader);
    props.context.data.symbolsMgr.unwatch(list_loader);
    props.context.component.unwatch(component_watcher);
})
</script>
<template>
    <div class="component-container-level-1">
        <el-scrollbar :always="true">
            <ComponentRootCollapse :context="props.context" :extend="true" :title="t('compos.lib_local')"
                :data="(local_data as SymbolListItem[])">
            </ComponentRootCollapse>
            <ComponentRootCollapse :context="props.context" :extend="false" :title="t('compos.lib_line')" :data="[]">
            </ComponentRootCollapse>
        </el-scrollbar>
    </div>
</template>
<style scoped lang="scss">
.component-container-level-1 {
    width: 100%;
    height: 100%;
}

.el-scrollbar {
    padding-right: 10px;
}
</style>