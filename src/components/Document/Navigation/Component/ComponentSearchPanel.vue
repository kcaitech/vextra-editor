<script lang="ts" setup>
import { Context } from '@/context';
import ComponentListView from './ComponentListView.vue';
import { SymbolShape } from '@kcdesign/data';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
interface Props {
    context: Context
    data: SymbolShape[]
}
const props = defineProps<Props>();
const scroll_container = ref<Element | null>(null);
function register_container() {
    scroll_container.value = document.querySelector('.component-search-panel > .el-scrollbar > .el-scrollbar__wrap');
}
onMounted(() => {
    register_container();
})
</script>
<template>
    <div class="component-search-panel">
        <el-scrollbar :always="true">
            <div v-if="scroll_container">
                <ComponentListView :context="props.context" :data="props.data" v-if="props.data.length"
                    :container="scroll_container" :is-attri="false" card-type="alpha"></ComponentListView>
                <div class="null-result" v-else>
                    {{ t('search.search_results') }}
                </div>
            </div>
        </el-scrollbar>
    </div>
</template>
<style scoped lang="scss">
.component-search-panel {
    width: 100%;
    height: calc(100% - 35px);
}

.null-result {
    width: 100%;
    text-align: center;
    margin-top: 16px;
    font-size: 8px;
    color: grey;
}

.el-scrollbar {
    padding-right: 10px;
}
</style>