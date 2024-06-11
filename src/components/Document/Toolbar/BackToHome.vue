<script setup lang="ts">
import { useI18n } from 'vue-i18n';
// import { router } from '@/router';
import { Context } from '@/context';
// import * as user_api from '@/request/users';
// import * as share_api from '@/request/share';
import { nextTick, ref, onMounted, onUnmounted } from 'vue';
import Saving from './Saving.vue';
// import { useRoute } from 'vue-router';
import { WorkSpace, Perm } from '@/context/workspace';
import { message } from '@/utils/message';
// import { ElMessage } from 'element-plus'
import { Tool } from '@/context/tool';
import DocumentMenu from './DocumentMenu/DocumentMenu.vue';
import SvgIcon from "@/components/common/SvgIcon.vue";
// import ProjectDialog from '@/components/TeamProject/ProjectDialog.vue';
// import kcdesk from "@/kcdesk";

// const route = useRoute();

interface Props {
    context: Context
}

const props = defineProps<Props>();
const ele = ref<number>(1);
const input = ref<HTMLInputElement>();
const name = ref<string>('');
const { t } = useI18n();
const showbackhometips = ref(false)
function home() {
    // if (props.context.communication.docOp.hasPendingSyncCmd()) {
    //     return showbackhometips.value = true;
    // }
    // window.document.title = t('product.name');
    // (window as any).sketchDocument = undefined;
    // (window as any).skrepo = undefined;
    // const index = sessionStorage.getItem('index');
    // if (index) {
    //     back(index);
    // } else {
    //     router.push({ name: 'recently' });
    //     sessionStorage.setItem('index', '1')
    // }
}

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
    (window as any).sketchDocument = undefined;
    (window as any).skrepo = undefined;
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

function rename() {
    if (props.context.workspace.documentPerm !== Perm.isEdit) return;
    ele.value = 2;
    nextTick(() => {
        if (input.value) {
            input.value.value = name.value;
            input.value.select();
            input.value.addEventListener('blur', blur);
        }
    })
    document.addEventListener('keydown', enter);

}

function enter(e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') blur();
}

async function blur() {
    if (input.value) {
        const p_name = input.value.value.trim();
        if (p_name.length < 1) {
            ele.value = 1;
            message('info', props.context.workspace.t('system.null_file_name'));
            return;
        }
        if (p_name.length > 50) {
            ele.value = 1;
            message('info', props.context.workspace.t('navi.overname'));
            return;
        }
        if (p_name === name.value) {
            ele.value = 1;
            return;
        }
        try {
            // ele.value = 3;
            // const { code, message } = await user_api.Setfilename({ doc_id: route.query.id, name: p_name });
            // if (code === 0) {
            //     name.value = p_name;
            // } else {
            //     ElMessage.error({ duration: 1500, message: message === '审核不通过' ? t('system.sensitive_reminder') : message })
            // }
            // window.document.title = `${name.value} - ${t('product.name')}`;
            // kcdesk?.fileSetName(name.value);
            // document.removeEventListener('keydown', enter);
        } catch (error) {
            console.log(error);
            if ((error as any)?.data?.code == '403') {
                message('info', props.context.workspace.t('permission.no_authority_to_rename'));
            }
        } finally {
            ele.value = 1;
        }
    }
}

async function init_name() {
    ele.value = 3;
    // const result = await share_api.getDocumentInfoAPI({ doc_id: route.query.id });
    // if (result?.code === 0) {
    //     name.value = result.data.document.name;
    // } else {
    //     name.value = props.context?.data.name || '';
    // }
    // ele.value = 1;
    // if (result.data) {
    //     const page = props.context.selection.selectedPage;
    //     if (!page) return;
    //     router.replace({
    //         path: '/document',
    //         query: { id: result.data.document.id, page_id: page.id.slice(0, 8) },
    //     });
    //     props.context.workspace.setDocumentPerm(result.data.document_permission.perm_type);
    //     props.context.comment.setDocumentInfo(result.data);
    // }
}

function workspace_watcher(t?: any) {
    if (t === WorkSpace.INIT_DOC_NAME) {
        init_name();
    }
}
const isLable = ref(props.context.tool.isLable);
const tool_watcher = (t: number) => {
    if (t === Tool.LABLE_CHANGE) {
        isLable.value = props.context.tool.isLable;
    }
}

const closeDisband = () => {
    showbackhometips.value = false;
}

onMounted(() => {
    init_name();
    props.context.workspace.watch(workspace_watcher);
    props.context.tool.watch(tool_watcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspace_watcher);
    props.context.tool.unwatch(tool_watcher);
})
</script>

<template>
    <div class="container" @dblclick.stop>
        <!-- <div class="home" @click="home" v-if="!kcdesk">
            <svg-icon icon-class="home"></svg-icon>
        </div> -->
        <DocumentMenu :context="props.context" @rename="rename"></DocumentMenu>
        <div class="rename">
            <span v-if="ele === 1" @click="rename">{{ name }}</span>
            <input v-if="ele === 2" type="text" ref="input" />
            <!-- <div class="save" v-if="ele === 3">
                <Saving></Saving>
            </div> -->
        </div>
        <div class="model">
            <span v-if="isLable" style="color: #BFBFBF; font-size: 12px">【开发模式】</span>
        </div>
    </div>
    <Teleport to="body">
        <!-- <ProjectDialog :projectVisible="showbackhometips" :context="t('message.unuploaded_msg')"
            :title="t('message.back_home')" :confirm-btn="t('message.exit_document')" @clode-dialog="closeDisband"
            @confirm="hasPendingSyncCmd"></ProjectDialog> -->
    </Teleport>
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

        .save {
            width: 12px;
            height: 12px;
            position: relative;
            top: -2px;
        }

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

        input {
            display: block;
            max-width: 210px;
            height: 18px;
            border: none;
            outline: none;
            background-color: transparent;
            color: #FFFFFF;
            font-family: HarmonyOS Sans;
            font-size: 14px;
        }
    }

    .model {
        flex: 0 0 72px;
        display: flex;
        align-items: center;
    }
}
</style>