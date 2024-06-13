<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { ref } from 'vue';
import DocumentMenu from './Menu/index.vue';
import DevModeVue from './DevMode.vue';

interface Props {
    context: Context
}

const props = defineProps<Props>();
const ele = ref<number>(1);
const { t } = useI18n();
const showbackhometips = ref(false)

const back = (index: string) => {
    // const project = props.context.comment.isDocumentInfo?.project;
    // switch (index) {
    //     case '1':
    //         router.push({ name: 'recently' });
    //         break;
    //     case '2':
    //         router.push({ name: 'starfile' });
    //         break;
    //     case '3':
    //         router.push({ name: 'meshare' });
    //         break;
    //     case '4':
    //         router.push({ name: 'shareme' });
    //         break;
    //     case '6':
    //         if (project) {
    //             router.push({ path: '/files/project/' + props.context.comment.isDocumentInfo?.project.id });
    //         } else {
    //             router.push({ name: 'recently' });
    //         }
    //         break;
    //     case '7':
    //         if (project) {
    //             router.push({ path: '/files/project/' + props.context.comment.isDocumentInfo?.project.id });
    //         } else {
    //             router.push({ name: 'recently' });
    //         }
    //         break;
    //     case '9':
    //         router.push({ name: 'ProjectShare'});
    //         break;
    //     default:
    //         router.push({ name: 'recently' });
    // }
}

const hasPendingSyncCmd = () => {
    showbackhometips.value = false
    // ElMessageBox.confirm(
    //   `${t('message.unuploaded_msg')}`,
    //   `${t('message.back_home')}`,
    //   {
    //     confirmButtonText: `${t('message.exit_document')}`,
    //     cancelButtonText: `${t('message.cancel')}`,
    //   }
    // )
    //   .then(() => {
    window.document.title = t('product.name');
    // (window as any).sketchDocument = undefined;
    // (window as any).skrepo = undefined;
    const index = sessionStorage.getItem('index');
    if (index) {
        back(index);
    } else {
        // router.push({ name: 'recently' });
        sessionStorage.setItem('index', '1')
    }
    // })
    // .catch(() => {
    //   return
    // })
}

const closeDisband = () => {
    showbackhometips.value = false;
}


const plugins = props.context.pluginsMgr.search2('toolbar.home');
const comps: { component: any, params?: any }[] = []
comps.push(...plugins.begin)
comps.push({ component: DocumentMenu })
comps.push(...plugins.end)
comps.push({ component: DevModeVue })

</script>

<template>
    <div class="container" @dblclick.stop>
        <component v-for="c in comps" :is=c.component :context="props.context" :params="c.params" />
    </div>
    <!-- todo -->
    <!-- <Teleport to="body">
        <ProjectDialog :projectVisible="showbackhometips" :context="t('message.unuploaded_msg')"
            :title="t('message.back_home')" :confirm-btn="t('message.exit_document')" @clode-dialog="closeDisband"
            @confirm="hasPendingSyncCmd"></ProjectDialog>
    </Teleport> -->
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