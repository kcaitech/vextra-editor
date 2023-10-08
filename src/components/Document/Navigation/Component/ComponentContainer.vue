<script setup lang="ts">
import { Context } from '@/context';
import ComponentListView from './ComponentListView.vue';
import ComponentRootCollapse from './ComponentRootCollapse.vue';
import { onMounted } from 'vue';
interface Props {
    context: Context
    search: string
}
const props = defineProps<Props>();
function list_loader() {
    console.log('list loadeer');

}
onMounted(() => {
    list_loader();
    props.context.data.pagesMgr.watch(list_loader);
})
</script>
<template>
    <div class="component-container-level-1">
        <ComponentRootCollapse title="本地" collapse-type="navi"></ComponentRootCollapse>
        <ComponentRootCollapse title="线框图组件库" collapse-type="navi"></ComponentRootCollapse>
        <ComponentListView :search="props.search" :context="props.context"></ComponentListView>
    </div>
</template>
<style scoped lang="scss">
.component-container-level-1 {
    width: 100%;
    height: 100%;
    overflow: auto;

    &::-webkit-scrollbar {
        width: 0px;
    }

    &::-webkit-scrollbar-track {
        background-color: none;
    }

    &::-webkit-scrollbar-thumb {
        background-color: none;
    }

    &::-webkit-scrollbar-thumb:hover {
        background-color: none;
    }

    &::-webkit-scrollbar-thumb:active {
        background-color: none;
    }
}
</style>