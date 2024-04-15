<script setup lang="ts">
import { router } from '@/router';
import { onMounted, onUnmounted, reactive, ref, shallowRef, watch } from "vue";
import { initpal } from "@/components/Document/initpal";
import { Context } from "@/context";
import {
    CoopRepository,
    Document,
    importDocument,
    IStorage, Matrix,
    Page,
    PageListItem,
    PageView,
    Repository
} from "@kcdesign/data";
import * as share_api from "@/request/share";
import { ElMessage } from "element-plus";
import { OssStorage, S3Storage, StorageOptions } from "@/utils/storage";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { insertNetworkInfo, message } from "@/utils/message";
import * as user_api from "@/request/users";
import { DocSelectionOpData, DocSelectionOpType } from "@/communication/modules/doc_selection_op";
import { ResponseStatus } from "@/communication/modules/doc_upload";
import { WorkSpace } from "@/context/workspace";
import { Selection } from "@/context/selection";
import { NetworkStatus } from "@/communication/modules/network_status";
import PageViewVue from "@/components/Document/Content/PageView.vue";
import { adapt_page2 } from "@/utils/content";
import { PROJECT_NAME } from "@/const";

const route = useRoute();
const initialized = ref<boolean>(false);
const {t} = useI18n();
let context: Context | undefined;
const permType = ref<number>();
const docInfo: any = ref({});
const noNetwork = ref(false)
const loading = ref<boolean>(false);
const null_context = ref<boolean>(true);
const isRead = ref(false);
const isEdit = ref(true);
const permissionChange = ref(-1);
const showHint = ref(false);
const canComment = ref(false);
const curPage = shallowRef<PageView | undefined>(undefined);

const HEAD_HEIGHT = 44;
const HEAD_HEIGHT_CSS = `${HEAD_HEIGHT}px`;

const fileName = ref<string>(PROJECT_NAME);

const emit = defineEmits<{
    (e: 'closeLoading'): void;
}>();

enum PermissionChange {
    update,
    close,
    delete
}

const autosave = t('message.autosave');
const link_success = t('message.link_success');
const network_anomaly = t('message.network_anomaly');
const network_error = t('message.network_error');
const countdown = ref(10);

const showNotification = (type?: number) => {
    insertNetworkInfo('networkError', false, network_error);
    showHint.value = true;
    startCountdown(type);
}
const hideNotification = (type?: number) => {
    showHint.value = false;
    countdown.value = 10;
    if (type === 0) {
        router.push('/files')
    } else {
        window.location.reload();
    }
}
const startCountdown = (type?: number) => {
    const timer = setInterval(() => {
        if (countdown.value > 1) {
            countdown.value--;
        } else {
            hideNotification(type);
            clearInterval(timer);
        }
    }, 1000);
}
const getDocumentAuthority = async () => {
    try {
        const data = await share_api.getDocumentAuthorityAPI({doc_id: route.query.id})
        if (data.code === 400) {
            permissionChange.value = PermissionChange.delete
            showNotification(0)
        }
        if (permType.value && data.data.perm_type !== permType.value) {
            if (data.data.perm_type === 1) {
                permissionChange.value = PermissionChange.update
                showNotification(data.data.perm_type)
            } else if (data.data.perm_type === 2) {
                permissionChange.value = PermissionChange.update
                showNotification(data.data.perm_type)
            } else if (data.data.perm_type === 3) {
                permissionChange.value = PermissionChange.update
                showNotification(data.data.perm_type)
            } else if (data.data.perm_type === 0) {
                permissionChange.value = PermissionChange.close
                showNotification(data.data.perm_type)
            }
        }
        if (data.data.perm_type === 1) {
            isRead.value = true;
            canComment.value = false;
            isEdit.value = false;
        } else if (data.data.perm_type === 2) {
            isRead.value = false
            canComment.value = true;
            isEdit.value = false;
        } else if (data.data.perm_type === 3) {
            isRead.value = false
            canComment.value = false
            isEdit.value = true
        }
        permType.value = data.data.perm_type
        context && context.workspace.setDocumentPerm(data.data.perm_type)
    } catch (err) {
        console.log(err);
    }
}
const getUserInfo = async () => {
    const {data} = await user_api.GetInfo()
    if (data && context) {
        context.comment.setUserInfo(data)
        localStorage.setItem('avatar', data.avatar)
        localStorage.setItem('nickname', data.nickname)
        localStorage.setItem('userId', data.id)
    }
}
const getDocumentInfo = async () => {
    try {
        loading.value = true;
        noNetwork.value = false;
        const docInfoPromise = share_api.getDocumentInfoAPI({doc_id: route.query.id});
        const docKeyPromise = share_api.getDocumentKeyAPI({doc_id: route.query.id});
        const [docInfoRes, docKeyRes] = await Promise.all([docInfoPromise, docKeyPromise]);
        if (docInfoRes.code !== 0 || docKeyRes.code !== 0) { // 打开文档失败
            if (docKeyRes.code === 403) {
                if (docKeyRes.message === "审核不通过") {
                    router.push("/files");
                    ElMessage.error({duration: 3000, message: t('system.sensitive_reminder3')})
                    return;
                }
                if (docKeyRes.message === "无访问权限") {
                    const query = route.query.page_id ? {
                        id: route.query.id,
                        page_id: route.query.page_id.slice(0, 8)
                    } : {id: route.query.id};
                    router.push({
                        name: "apply",
                        query: query,
                    });
                    return;
                }
                router.push("/files");
                ElMessage.error({duration: 3000, message: docKeyRes.message})
                return;
            } else {
                router.push("/files");
                ElMessage.error({duration: 3000, message: docInfoRes.message})
                return;
            }
        }
        const docInfoData = docInfoRes.data;
        const docKeyData = docKeyRes.data;
        const perm = docInfoData.document_permission.perm_type;
        if (perm === 0) { // 无权限
            const query = route.query.page_id ? {
                id: route.query.id,
                page_id: route.query.page_id.slice(0, 8)
            } : {id: route.query.id};
            router.push({
                name: "apply",
                query: query,
            });
            return;
        }

        docInfo.value = docInfoData;
        permType.value = perm;
        const repo = new Repository();
        const storageOptions: StorageOptions = {
            endPoint: docKeyData.endpoint,
            region: docKeyData.region,
            accessKey: docKeyData.access_key,
            secretKey: docKeyData.secret_access_key,
            sessionToken: docKeyData.session_token,
            bucketName: docKeyData.bucket_name,
        }
        let storage: IStorage;
        if (docKeyData.provider === "oss") {
            storage = new OssStorage(storageOptions);
        } else {
            storage = new S3Storage(storageOptions);
        }
        const path = docInfo.value.document.path;
        const versionId = docInfo.value.document.version_id ?? "";
        const document = await importDocument(storage, path, "", versionId, repo)
        if (document) {
            const coopRepo = new CoopRepository(document, repo);
            const file_name = docInfo.value.document?.name || document.name;
            fileName.value = file_name;
            window.document.title = file_name.length > 8 ? `${file_name.slice(0, 8)}... - ${PROJECT_NAME}` : `${file_name} - ${PROJECT_NAME}`;
            context = new Context(document, coopRepo);
            context.workspace.setDocumentPerm(perm);
            getDocumentAuthority();
            getUserInfo();
            context.comment.setDocumentInfo(docInfoData);
            null_context.value = false;
            init_watcher();
            const docId = route.query.id as string;
            const getToken = () => Promise.resolve(localStorage.getItem("token") || "");
            if (!await context.communication.docOp.start(getToken, docId, document, context.coopRepo, versionId)) {
                router.push("/files");
                return;
            }
            loading.value = false;
            if (perm >= 3) await context.communication.docResourceUpload.start(getToken, docId);
            await context.communication.docCommentOp.start(getToken, docId);
            await context.communication.docSelectionOp.start(getToken, docId, context);
            context.communication.docSelectionOp.addOnMessage(teamSelectionModifi);
            const route_p_id = route.query.page_id ? route.query.page_id as string : context!.data.pagesList[0]?.id;
            const page: PageListItem | undefined = context!.data.pagesList.filter((item) => item.id.slice(0, 8) === route_p_id.slice(0, 8))[0];
            switchPage(page?.id || context!.data.pagesList[0]?.id);
        }
    } catch (err) {
        loading.value = false;
        noNetwork.value = true;
        console.log(err);
        throw err;
    }
}

const teamSelectionModifi = (docCommentOpData: DocSelectionOpData) => {
    const data = docCommentOpData.data
    if (context && (docCommentOpData.user_id !== context.comment.isUserInfo?.id) && context.comment.isUserInfo?.id) {
        const addUset = context!.teamwork.getUserSelection
        if (docCommentOpData.type === DocSelectionOpType.Exit) {
            const index = addUset.findIndex(obj => obj.user_id === docCommentOpData.user_id);
            context?.teamwork.userSelectionExit(index)
        } else if (docCommentOpData.type === DocSelectionOpType.Update) {
            const index = addUset.findIndex(obj => obj.user_id === docCommentOpData.user_id);
            context?.teamwork.userSelectionUpdate(data, index)
        }
    }
}

async function upload(projectId: string) {
    const getToken = () => Promise.resolve(localStorage.getItem("token") || "");
    if (!await getToken() || !context || !context.data) return;
    if (!await context.communication.docUpload.start(getToken, projectId)) {
        // todo 上传通道开启失败处理
        console.log("文档上传通道开启失败")
        return;
    }
    let result;
    try {
        console.log("开始上传文档")
        result = await context.communication.docUpload.upload(context.data);
    } catch (e) {
        // todo 上传失败处理√
        message('danger', '文档上传失败');
        console.log("文档上传失败", e)
        return;
    }
    if (!result || result.status !== ResponseStatus.Success || !result.data?.doc_id || typeof result.data?.doc_id !== "string") {
        // todo 上传失败处理√
        message('danger', '文档上传失败');
        console.log("文档上传失败", result)
        return;
    }
    const doc_id = result!.data.doc_id;
    console.log("文档上传成功", doc_id)
    router.replace({
        path: '/document',
        query: {id: doc_id},
    });
    if (!await context.communication.docOp.start(getToken, doc_id, context!.data, context.coopRepo, result!.data.version_id ?? "")) {
        console.log("文档操作通道开启失败")
        // todo 文档操作通道开启失败处理
    }
    getDocumentAuthority().then(async () => {
        if (!context) return;
        if (permType.value === 3) context.communication.docResourceUpload.start(getToken, doc_id);
        context.communication.docCommentOp.start(getToken, doc_id);
        await context.communication.docSelectionOp.start(getToken, doc_id, context);
        context.communication.docSelectionOp.addOnMessage(teamSelectionModifi);
        context.workspace.notify(WorkSpace.INIT_DOC_NAME);
    })
}

function switchPage(id?: string) {
    if (!id) return
    if (context) {
        const ctx: Context = context;
        const pagesMgr = ctx.data.pagesMgr;
        const cur_page = context.selection.selectedPage;
        if (cur_page && cur_page.id === id) return;
        pagesMgr.get(id).then((page: Page | undefined) => {
            if (page) {
                ctx.comment.toggleCommentPage()
                curPage.value = undefined;
                ctx.comment.commentMount(false)
                const pagedom = ctx.getPageDom(page).dom;
                ctx.selection.selectPage(pagedom);
                curPage.value = pagedom;
                console.log('success:', pagedom);
            }
        })
    }
}


let timer: any = null;

function init_doc() {
    if (route.query.id) { // 从远端读取文件
        getDocumentInfo();
        timer = setInterval(() => {
            getDocumentAuthority();
        }, 30000);
    } else if ((window as any).sketchDocument) {
        loading.value = true;
        context = new Context((window as any).sketchDocument as Document, ((window as any).skrepo as CoopRepository));
        null_context.value = false;
        getUserInfo();
        init_watcher();
        const project_id = localStorage.getItem('project_id') || '';
        upload(project_id);
        localStorage.setItem('project_id', '');
        switchPage(((window as any).sketchDocument as Document).pagesList[0]?.id);
    } else {
        router.push('/files');
    }
}

function selectionWatcher(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        if (context) {
            curPage.value = context!.selection.selectedPage;
        }
    }
}

function workspace_watcher(type?: number) {
    if (type === WorkSpace.MATRIX_TRANSFORMATION && context) {
        matrix.reset(context.workspace.matrix);
    }
}

function init_watcher() {
    if (!context) {
        return;
    }
    context.selection.watch(selectionWatcher);
    context.workspace.watch(workspace_watcher);
}

function onBeforeUnload(event: any) {
    if (!context?.communication.docOp.hasPendingSyncCmd()) return; // 不需要弹框
    event.preventDefault();
    return event.returnValue = t('message.leave');
}

function onUnload(event: any) {
    onUnloadForCommunication();
}

function onUnloadForCommunication() {
    try {
        context?.communication.docOp.close();
        context?.communication.docResourceUpload.close();
        context?.communication.docCommentOp.close();
        context?.communication.docSelectionOp.close();
    } catch (err) {
    }
}

const token = localStorage.getItem("token") || "";
const networkStatus = NetworkStatus.Make(token);
// 检测是否有未上传的数据
let loopNet: any = null;
//监听网络状态
let netErr: any = null;

function closeNetMsg() {
    insertNetworkInfo('saveSuccess', false, autosave);
    insertNetworkInfo('networkError', false, network_error);
    insertNetworkInfo('netError', false, network_anomaly);
    insertNetworkInfo('networkSuccess', false, link_success);
}

const closeLoading = () => {
    emit('closeLoading');
}

const matrix: Matrix = reactive((context?.workspace.matrix || new Matrix()) as any);
const matrixMap = new Map<string, { m: Matrix, x: number, y: number }>();

function initMatrix(cur: PageView) {
    if (!context) {
        return;
    }
    let info = matrixMap.get(cur.id);
    if (!info) {
        const m = new Matrix(adapt_page2(context, document.documentElement.clientWidth, document.documentElement.clientHeight - HEAD_HEIGHT));
        info = {m, x: cur.frame.x, y: cur.frame.y};
        matrixMap.set(cur.id, info);
    }
    matrix.reset(info.m.toArray());
    context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}

const stop2 = watch(() => curPage.value, (page, old) => {
    if (page) {
        if (old) {
            let info = matrixMap.get(old.id);
            info!.m.reset(matrix.toArray())
        }

        initMatrix(page);
    }
})

onMounted(() => {
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('unload', onUnload);
    init_doc();
    initpal().then(() => {
        initialized.value = true;
    }).catch((e) => {
        console.log(e)
    })
})
onUnmounted(() => {
    closeNetMsg();
    onUnloadForCommunication();
    context?.selection.unwatch(selectionWatcher);
    context?.workspace.unwatch(workspace_watcher);
    clearInterval(timer);
    localStorage.removeItem('docId');
    window.removeEventListener('beforeunload', onBeforeUnload);
    window.removeEventListener('unload', onUnload);
    clearInterval(loopNet);
    clearInterval(netErr);
    networkStatus.close();
    stop();
    stop2();
})
</script>

<template>
    <div class="status-bar">
        <div class="back" @click="router.go(-1)">
            <svg-icon icon-class="back-icon"></svg-icon>
        </div>

        <span>{{ fileName }}</span>
    </div>
    <div class="pageview">
        <PageViewVue v-if="!null_context && curPage" :context="context!" :data="(curPage as PageView)" :matrix="matrix"
                     @closeLoading="closeLoading"/>
    </div>
</template>


<style scoped lang="scss">
.status-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    height: v-bind('HEAD_HEIGHT_CSS');
    background-color: #fff;
    box-sizing: border-box;

    .back {
        width: 28px;
        height: 28px;
        position: absolute;
        left: 8px;

        svg {
            width: 100%;
            height: 100%;

        }
    }

}

.pageview {
    width: 100%;
    height: calc(100% - v-bind('HEAD_HEIGHT_CSS'));
    background-color: #EFEFEF;
}
</style>
