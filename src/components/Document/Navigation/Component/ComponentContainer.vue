<script setup lang="ts">
import { Context } from '@/context';
import ComponentRootCollapse from './ComponentRootCollapse.vue';
import ComponentLocalData from './ComponentLocalData.vue';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
interface Props {
    context: Context
    search: string
}
const props = defineProps<Props>();
const { t } = useI18n();
const top_wrapper = ref<Element | null>(null);
const scroll_container = ref<Element | null>(null);
function register_container() {
    if (!top_wrapper.value) return;
    scroll_container.value = top_wrapper.value.querySelector('.el-scrollbar > .el-scrollbar__wrap');
}
onMounted(register_container);
</script>
<template>
    <div class="component-container-level-1" ref="top_wrapper">
        <el-scrollbar :always="true">
            <ComponentLocalData v-if="scroll_container" :context="props.context" :container="scroll_container">
            </ComponentLocalData>
            <ComponentRootCollapse v-if="scroll_container" :context="props.context" :extend="false"
                :container="scroll_container" :title="t('compos.lib_line')" :data="[]" :status_set="new Set()">
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