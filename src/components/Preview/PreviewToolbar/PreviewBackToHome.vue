<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { router } from '@/router';
import { Context } from '@/context';
import * as share_api from '@/request/share';
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { WorkSpace } from '@/context/workspace';
import SvgIcon from "@/components/common/SvgIcon.vue";
import kcdesk from "@/kcdesk";

const route = useRoute();

interface Props {
    context: Context
}

const props = defineProps<Props>();
const name = ref<string>('');
const { t } = useI18n();
function home() {
    window.document.title = t('product.name');
    (window as any).sketchDocument = undefined;
    (window as any).skrepo = undefined;
    const index = sessionStorage.getItem('index');
    if (index) {
        back(index);
    } else {
        router.push({ name: 'recently' });
        sessionStorage.setItem('index', '1')
    }
}

const back = (index: string) => {
    const project = props.context.comment.isDocumentInfo?.project;
    switch (index) {
        case '1':
            router.push({ name: 'recently' });
            break;
        case '2':
            router.push({ name: 'starfile' });
            break;
        case '3':
            router.push({ name: 'meshare' });
            break;
        case '4':
            router.push({ name: 'shareme' });
            break;
        case '6':
            if (project) {
                router.push({ path: '/files/project/' + props.context.comment.isDocumentInfo?.project.id });
            } else {
                router.push({ name: 'recently' });
            }
            break;
        case '7':
            if (project) {
                router.push({ path: '/files/project/' + props.context.comment.isDocumentInfo?.project.id });
            } else {
                router.push({ name: 'recently' });
            }
            break;
        case '9':
            router.push({ name: 'ProjectShare'});
            break;
        default:
            router.push({ name: 'recently' });
    }
}

async function init_name() {
    const result = await share_api.getDocumentInfoAPI({ doc_id: route.query.id });
    if (result?.code === 0) {
        name.value = result.data.document.name;
    } else {
        name.value = props.context?.data.name || '';
    }
    if (result.data) {
        props.context.comment.setDocumentInfo(result.data);
    }
}

function workspace_watcher(t?: any) {
    if (t === WorkSpace.INIT_DOC_NAME) {
        init_name();
    }
}

onMounted(() => {
    init_name();
    props.context.workspace.watch(workspace_watcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspace_watcher);
})
</script>

<template>
    <div class="container" @dblclick.stop>
        <div class="home" @click="home" v-if="!kcdesk">
            <svg-icon icon-class="home"></svg-icon>
        </div>
        <div class="rename">
            <span>{{ name }}</span>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: auto;
    height: 32px;

    .home {
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 32px;
        border-radius: 4px;

        >svg {
            width: 18px;
            height: 18px;
            fill: #FFFFFF;
        }
    }

    .home:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .rename {
        max-width: 224px;
        line-height: 32px;
        flex: 1;
        box-sizing: border-box;
        padding: 0px 8px;

        span {
            display: block;
            max-width: 210px;
            height: 32px;
            color: #ffffff;
            cursor: pointer;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: HarmonyOS Sans;
            font-size: 14px;
        }
    }
}
</style>