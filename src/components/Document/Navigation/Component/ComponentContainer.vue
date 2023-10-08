<script setup lang="ts">
import { Context } from '@/context';
import { Component } from '@/context/component';
import ComponentRootCollapse from './ComponentRootCollapse.vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { debounce } from 'lodash';
import { SymbolListItem, list_layout, classification_level_page } from '@/utils/symbol';
interface Props {
    context: Context
    search: string
}
const props = defineProps<Props>();
const local_data = ref<SymbolListItem[]>([]);
const extend_set: Set<string> = new Set();
function _list_loader() {
    local_data.value = list_layout(classification_level_page(props.context.data.pagesMgr.resource), extend_set);
    
}
const list_loader = debounce(_list_loader, 300);
function component_watcher(t: number) {
    if (t === Component.EXTEND_FOLDER) update_by_context_component();
}
function update_by_context_component() {
    const target = props.context.component.list_action_target;
    if (extend_set.has(target)) {
        extend_set.delete(target);
    } else {
        extend_set.add(target);
    }
    _list_loader();
}
onMounted(() => {
    props.context.data.pagesMgr.watch(list_loader);
    props.context.data.symbolsMgr.watch(list_loader);
    props.context.component.watch(component_watcher);
    _list_loader();
    console.log('mount');
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
            <ComponentRootCollapse :context="props.context" :extend="true" title="本地"
                :data="(local_data as SymbolListItem[])">
            </ComponentRootCollapse>
            <ComponentRootCollapse :context="props.context" :extend="false" title="线框图组件库" :data="[]">
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