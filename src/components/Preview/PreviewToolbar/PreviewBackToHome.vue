<script setup lang="ts">
import { Context } from '@/context';
// import * as share_api from '@/request/share';
import { ref, onMounted, onUnmounted } from 'vue';
// import { useRoute } from 'vue-router';
import { WorkSpace } from '@/context/workspace';
import { useI18n } from 'vue-i18n';


interface Props {
    context: Context
}

const props = defineProps<Props>();
const name = ref<string>('');
const { t } = useI18n();


async function init_name() {
    // const result = await share_api.getDocumentInfoAPI({ doc_id: route.query.id });
    // if (result?.code === 0) {
    //     name.value = result.data.document.name;
    // } else {
    //     name.value = props.context?.data.name || '';
    // }
    // if (result.data) {
    //     props.context.comment.setDocumentInfo(result.data);
    // }
}

function workspace_watcher(t?: any) {
    if (t === WorkSpace.INIT_DOC_NAME) {
        init_name();
    }
}

const plugins = props.context.pluginsMgr.search2('preview.toolbar.home');
const comps: { component: any, params?: any }[] = []
comps.push(...plugins.begin)
comps.push(...plugins.end)

</script>

<template>
    <div class="container" @dblclick.stop>
        <component v-for="c in comps" :is=c.component :context="props.context" :params="c.params" />
    </div>
</template>

<style scoped lang="scss">
.container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: auto;
    height: 32px;
}
</style>