<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, ref, watch } from 'vue';
import ContentView from "./ContentView.vue";
import { Context } from '@/context';
import Navigation from './Navigation/index.vue';
import { Selection } from '@/context/selection';
import Attribute from './Attribute/RightTabs.vue';
import Toolbar from './Toolbar/index.vue'
import ColSplitView from '@/components/common/ColSplitView.vue';
import ApplyFor from './Toolbar/Share/ApplyFor.vue';
import {
    Document,
    importRemote,
    Repository,
    Page,
    CoopRepository,
    IStorage,
    PageView,
    PageListItem
} from '@kcdesign/data';
import { SCREEN_SIZE } from '@/settings';
import * as share_api from '@/request/share'
import * as user_api from '@/request/users'
import { useRoute } from 'vue-router';
import { router } from '@/router';
import { useI18n } from 'vue-i18n';
import { Warning } from '@element-plus/icons-vue';
import Loading from '@/components/common/Loading.vue';
import SubLoading from '@/components/common/SubLoading.vue';
import { WorkSpace } from '@/context/workspace';
import NetWorkError from '@/components/NetworkError.vue'
import { ResponseStatus } from "@/communication/modules/doc_upload";
import { insertNetworkInfo, message } from "@/utils/message"
import { OssStorage, S3Storage, StorageOptions } from "@/utils/storage";
import { NetworkStatus } from '@/communication/modules/network_status'
import { Comment } from '@/context/comment';
import { DocSelectionOpData, DocSelectionOpType } from "@/communication/modules/doc_selection_op";
import { debounce } from '@/utils/timing_util';
import { NetworkStatusType } from "@/communication/types";
import Bridge from "@/components/Document/Bridge.vue";
import { Component } from '@/context/component';
import { initpal } from './initpal';
import { setup as keyboardUints } from '@/utils/keyboardUnits';
import { Tool } from '@/context/tool';
import { ElMessage } from 'element-plus';
import HelpEntrance from '../Help/HelpEntrance.vue';
import kcdesk from '@/kcdesk';
import { newFile2, openFile3 } from '@/utils/neworopen';
import { scroll_to_view } from '@/utils/listview';

const { t } = useI18n();
const curPage = shallowRef<PageView | undefined>(undefined);
let context: Context | undefined;
const route = useRoute();
const rightWidth = ref(250);
const Left = ref({ leftMin: 250, leftWidth: 250, leftMinWidth: 250 });
const showRight = ref<boolean>(true);
const showLeft = ref<boolean>(true);
const showTop = ref<boolean>(true);
const showBottom = ref<boolean>(true);
const permType = ref<number>();
const docInfo: any = ref({});
const showHint = ref(false);
const countdown = ref(10);
const noNetwork = ref(false)
const leftTriggleVisible = ref<boolean>(false);
const rightTriggleVisible = ref<boolean>(false);
let timerForLeft: any;
let timeForRight: any;
const loading = ref<boolean>(false);
const sub_loading = ref<boolean>(false);
const null_context = ref<boolean>(true);
const isRead = ref(false);
const canComment = ref(false);
const isEdit = ref(true);
const bridge = ref<boolean>(false);
const inited = ref(false);
const fileName = ref<string>(t('product.name'));
let uninstall_keyboard_units: () => void = () => {
};

function switchFullScreen() {
    if (kcdesk) return;
    const element = document.documentElement;
    const isFullScreen = document.fullscreenElement;
    if (isFullScreen === null) {
        element.requestFullscreen && element.requestFullscreen();
        localStorage.setItem(SCREEN_SIZE.KEY, SCREEN_SIZE.FULL);
    } else {
        document.exitFullscreen && document.exitFullscreen();
        localStorage.setItem(SCREEN_SIZE.KEY, SCREEN_SIZE.NORMAL);
    }
}

function mouseenter(t: 'left' | 'right') {
    if (t === 'left') {
        if (timerForLeft) {
            clearTimeout(timerForLeft);
            timerForLeft = undefined;
        }
        leftTriggleVisible.value = true;
    } else {
        if (timeForRight) {
            clearTimeout(timeForRight);
            timeForRight = undefined;
        }
        rightTriggleVisible.value = true;
    }
}

function mouseleave(t: 'left' | 'right') {
    const delay = 80;
    if (t === 'left') {
        timerForLeft = setTimeout(() => {
            if (!timerForLeft) return;
            leftTriggleVisible.value = false;
            clearTimeout(timerForLeft);
            timerForLeft = undefined;
        }, delay);
    } else {
        timeForRight = setTimeout(() => {
            if (!timeForRight) return;
            rightTriggleVisible.value = false;
            clearTimeout(timeForRight);
            timeForRight = undefined;
        }, delay);
    }
}

function switchPage(id?: string, frame_id?: string) {
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
                if (frame_id) {
                    const shape = pagedom.childs.find(item => item.id.slice(0, 8) == frame_id.slice(0, 8));
                    if(!shape) return;
                    scroll_to_view(ctx, shape);
                }
            }
        })
    }
}


function selectionWatcher(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        if (context) {
            const ctx: Context = context;
            curPage.value = ctx.selection.selectedPage;
        }
    }
    if (t === Selection.COMMENT_CHANGE_PAGE) {
        if (context) {
            const pageId = context.selection.commentPageId
            switchPage(pageId)
        }
    }
}

const isLable = ref<boolean>(false);
const showHiddenRight = () => {
    if (showRight.value || (!isEdit.value && !isLable.value)) {
        rightWidth.value = 0
        showRight.value = false
    } else {
        rightWidth.value = 250
        showRight.value = true
    }
}
const showHiddenLeft = () => {
    if (!context) return;
    const w = context.workspace;
    if (showLeft.value) {
        Left.value.leftMin = 0
        Left.value.leftWidth = 0
        Left.value.leftMinWidth = 0
        showLeft.value = false
    } else {
        Left.value.leftMin = 250
        Left.value.leftWidth = 250
        Left.value.leftMinWidth = 250
        showLeft.value = true
    }
    w.notify(WorkSpace.CHANGE_NAVI);
}

function keyToggleLR() {
    if (showRight.value !== showLeft.value) {
        showHiddenLeft();
    } else {
        showHiddenLeft();
        showHiddenRight();
    }
}

function keyToggleTB() {
    if (!context) return;
    if (showRight.value !== showLeft.value) {
        showHiddenLeft();
        return;
    }
    if (showTop.value !== showLeft.value) {
        showHiddenLeft();
        showHiddenRight();
        return;
    }
    showHiddenLeft();
    showHiddenRight();
    showBottom.value = !showBottom.value;
    showTop.value = showBottom.value;
    if (showTop.value) {
        context.workspace.matrix.trans(0, -40);
    } else {
        context.workspace.matrix.trans(0, 40);
    }
    context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}

const tool_watcher = (t: number) => {
    if (!context) return;
    if (t === Tool.LABLE_CHANGE) {
        isLable.value = context.tool.isLable;
        not_perm_hidden_right();
    }
}
const not_perm_hidden_right = () => {
    if (!isEdit.value && !isLable.value) {
        rightWidth.value = 0
    } else if (isLable.value && !isEdit.value) {
        rightWidth.value = 250
    } else if (!isLable.value && isEdit.value && !showRight.value) {
        rightWidth.value = 250
    }
}

enum PermissionChange {
    update,
    close,
    delete
}

const getDocumentAuthority = async () => {
    try {
        const data = await share_api.getDocumentAuthorityAPI({ doc_id: route.query.id })
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
const permissionChange = ref(-1);
// 权限被修改后的倒计时
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
const hideNotification = (type?: number) => {
    showHint.value = false;
    countdown.value = 10;
    if (type === 0) {
        router.push('/files')
    } else {
        window.location.reload();
    }
}
const showNotification = (type?: number) => {
    insertNetworkInfo('networkError', false, network_error);
    showHint.value = true;
    startCountdown(type);
}
const getUserInfo = async () => {
    const { data } = await user_api.GetInfo()
    if (data && context) {
        context.comment.setUserInfo(data)
        localStorage.setItem('avatar', data.avatar)
        localStorage.setItem('nickname', data.nickname)
        localStorage.setItem('userId', data.id)
    }
}

type UnwrappedPromise<T> = T extends Promise<infer U> ? U : T
let documentLoader: UnwrappedPromise<ReturnType<typeof importRemote>>['loader'] | undefined = undefined;
const product_name = t('product.name');
//获取文档信息
const getDocumentInfo = async () => {
    try {
        loading.value = true;
        noNetwork.value = false;
        const docInfoPromise = share_api.getDocumentInfoAPI({ doc_id: route.query.id });
        const docKeyPromise = share_api.getDocumentKeyAPI({ doc_id: route.query.id });
        const [docInfoRes, docKeyRes] = await Promise.all([docInfoPromise, docKeyPromise]);
        if (docInfoRes.code !== 0 || docKeyRes.code !== 0) { // 打开文档失败
            if (docKeyRes.code === 403) {
                if (docKeyRes.message === "审核不通过") {
                    router.push("/files");
                    ElMessage.error({ duration: 3000, message: t('system.sensitive_reminder3') })
                    return;
                }
                if (docKeyRes.message === "无访问权限") {
                    const query = route.query.page_id ? {
                        id: route.query.id,
                        page_id: route.query.page_id.slice(0, 8)
                    } : { id: route.query.id };
                    router.push({
                        name: "apply",
                        query: query,
                    });
                    return;
                }
                router.push("/files");
                ElMessage.error({ duration: 3000, message: docKeyRes.message })
                return;
            } else {
                router.push("/files");
                ElMessage.error({ duration: 3000, message: docInfoRes.message })
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
            } : { id: route.query.id };
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
        const d = await importRemote(storage, path, "", versionId, repo)
        const document = d.document;
        documentLoader = d.loader;
        if (document) {
            const coopRepo = new CoopRepository(document, repo);
            const file_name = docInfo.value.document?.name || document.name;
            fileName.value = file_name;
            window.document.title = file_name.length > 8 ? `${file_name.slice(0, 8)}... - ${t('product.name')}` : `${file_name} - ${t('product.name')}`;
            kcdesk?.fileSetName(file_name);
            context = new Context(document, coopRepo);
            context.workspace.setDocumentPerm(perm);
            getDocumentAuthority();
            getUserInfo();
            context.comment.setDocumentInfo(docInfoData);
            null_context.value = false;
            init_watcher();
            init_keyboard_uints();
            const docId = route.query.id as string;
            const getToken = () => Promise.resolve(localStorage.getItem("token") || "");
            if (!await context.communication.docOp.start(getToken, docId, document, context.coopRepo, versionId)) {
                router.push("/files");
                return;
            }
            perm < 3 && showHiddenRight();
            if (perm >= 3) await context.communication.docResourceUpload.start(getToken, docId);
            await context.communication.docCommentOp.start(getToken, docId);
            await context.communication.docSelectionOp.start(getToken, docId, context);
            context.communication.docSelectionOp.addOnMessage(teamSelectionModifi);
            const route_p_id = route.query.page_id ? route.query.page_id as string : context!.data.pagesList[0]?.id;
            const page: PageListItem | undefined = context!.data.pagesList.filter((item) => item.id.slice(0, 8) === route_p_id.slice(0, 8))[0];
            const route_frame_id = route.query.frame_id as string;
            switchPage(page?.id || context!.data.pagesList[0]?.id, route_frame_id);
            updateDocumentKeyTimer = setInterval(updateDocumentKey, 1000 * 60 * 30); // 30分钟更新一次文档密钥
        }
    } catch (err) {
        loading.value = false;
        noNetwork.value = true;
        console.log(err);
        throw err;
    }
}

async function updateDocumentKey() {
    if (!documentLoader) return;
    const docKeyRes = await share_api.getDocumentKeyAPI({ doc_id: route.query.id });
    if (docKeyRes.code !== 0) return;
    const docKeyData = docKeyRes.data;
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
    documentLoader.setStorage(storage);
}

let updateDocumentKeyTimer: ReturnType<typeof setInterval> | Parameters<typeof clearInterval>[0] = undefined;

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
    console.log("文档上传成功", doc_id);
    if (route.name !== 'document') return;
    router.replace({
        path: '/document',
        query: { id: doc_id },
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
        permType.value !== 3 && showHiddenRight();
    })
}

let timer: any = null;

function init_screen_size() {
    localStorage.setItem(SCREEN_SIZE.KEY, SCREEN_SIZE.NORMAL);
}

function init_watcher() {
    if (!context) {
        return;
    }
    context.selection.watch(selectionWatcher);
    context.workspace.watch(workspaceWatcher);
    context.component.watch(component_watcher);
    context.tool.watch(tool_watcher);
}

function init_keyboard_uints() {
    if (!context) {
        return;
    }
    uninstall_keyboard_units = keyboardUints(context)
}

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
        init_keyboard_uints();
        const project_id = localStorage.getItem('project_id') || '';
        upload(project_id);
        localStorage.setItem('project_id', '');
        switchPage(((window as any).sketchDocument as Document).pagesList[0]?.id);
    } else if (kcdesk && route.query.from === 'kcdesk') {
        if (route.query.newfile) {
            // 新建
            newFile2();
            init_doc();
        } else if (route.query.localfile) {
            // 打开本地文档
            kcdesk.osOpenFile(route.query.localfile as string).then(file => {
                if (file) {
                    openFile3(file).then(() => {
                        init_doc();
                    }).catch(e => {
                        console.error(e);
                    })
                } else {
                    // ??
                }
            });
        }
    } else {
        router.push('/files');
    }
}

function workspaceWatcher(t: number, o?: any) {
    if (t === WorkSpace.FREEZE) {
        sub_loading.value = true;
    } else if (t === WorkSpace.THAW) {
        sub_loading.value = false;
    } else if (t === WorkSpace.HIDDEN_UI) {
        o ? keyToggleLR() : keyToggleTB();
    }
}

const autosave = t('message.autosave');
const link_success = t('message.link_success');
const network_anomaly = t('message.network_anomaly');
const network_error = t('message.network_error');

// 保存文档成功message信息
const autoSaveSuccess = () => {
    insertNetworkInfo('saveSuccess', true, autosave);
    const timer = setTimeout(() => {
        insertNetworkInfo('saveSuccess', false, autosave);
        clearTimeout(timer)
    }, 3000)
}
//网络连接成功message信息
const networkLinkSuccess = () => {
    insertNetworkInfo('netError', false, network_anomaly);
    insertNetworkInfo('networkSuccess', true, link_success);
    const timer = setTimeout(() => {
        insertNetworkInfo('networkSuccess', false, link_success);
        clearTimeout(timer)
    }, 3000)
}
// 网络断开连接提示信息
const networkLinkError = () => {
    insertNetworkInfo('networkSuccess', false, link_success);
    insertNetworkInfo('netError', true, network_anomaly);
    const timer = setTimeout(() => {
        insertNetworkInfo('netError', false, network_anomaly);
        clearTimeout(timer);
    }, 3000)
}

let previousStatus: NetworkStatusType = NetworkStatusType.Online
const networkMessage = (status: NetworkStatusType) => {
    if (status === previousStatus) return;
    previousStatus = status
    if (status === NetworkStatusType.Offline) {
        networkLinkError()
    } else {
        networkLinkSuccess()
    }
}
const networkDebounce = (() => {
    const df = debounce(networkMessage, 1000)
    return (status: NetworkStatusType) => {
        df(status).catch((e) => {
            console.log(e)
        });
    }
})();

//文档获取失败 重试刷新页面
const refreshDoc = () => {
    location.reload();
}

const hasPendingSync = () => {
    if (context && context.communication.docOp.hasPendingSyncCmd() && !netErr) {
        insertNetworkInfo('networkError', true, network_error);
        netErr = setInterval(() => {
            if (context && !context.communication.docOp.hasPendingSyncCmd()) {
                insertNetworkInfo('networkError', false, network_error);
                autoSaveSuccess();
                clearInterval(netErr);
                netErr = null;
            }
        }, 1000);
    }
}
// 检测是否有未上传的数据
let loopNet: any = null
//监听网络状态
let netErr: any = null
const token = localStorage.getItem("token") || "";
const networkStatus = NetworkStatus.Make(token);
networkStatus.addOnChange((status: NetworkStatusType) => {
    if (status === NetworkStatusType.Offline) {
        console.log("网络断开连接")
        if (context) {
            clearInterval(loopNet);
            loopNet = null;
            loopNet = setInterval(() => {
                hasPendingSync()
            }, 1000)
            if (context.communication.docOp.hasPendingSyncCmd() || netErr) {
                //有未上传资源
                hasPendingSync()
            } else {
                networkDebounce(status)
            }
        }
    } else {
        console.log("网络连接成功")
        if (context) {
            if (context.communication.docOp.hasPendingSyncCmd() || netErr) {
                //有未上传资源
                hasPendingSync()
            } else {
                networkDebounce(status)
            }
            context.comment.notify(Comment.TOGGLE_COMMENT_PAGE)
            clearInterval(loopNet)
        }
    }
})

function onBeforeUnload(event: any) {
    if (!context?.communication.docOp.hasPendingSyncCmd()) return; // 不需要弹框
    event.preventDefault();
    return event.returnValue = t('message.leave');
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

function onUnload(event: any) {
    onUnloadForCommunication();
}

function closeNetMsg() {
    insertNetworkInfo('saveSuccess', false, autosave);
    insertNetworkInfo('networkError', false, network_error);
    insertNetworkInfo('netError', false, network_anomaly);
    insertNetworkInfo('networkSuccess', false, link_success);
}

const closeLoading = () => {
    loading.value = false;
}

const changeLeftWidth = (width: number) => {
    Left.value.leftWidth = width;
}

//协作人员操作文档执行
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

function component_watcher(t: number) {
    if (!context) {
        return;
    }
    if (t === Component.BRIDGE_CHANGE) {
        bridge.value = context.component.bridge;
    }
}

const stop = watch(() => null_context.value, (v) => {
    if (!v) {
        const _name = context?.data.name || '';
        const file_name = docInfo.value.document?.name || _name;
        const timer = setTimeout(() => {
            window.document.title = file_name.length > 8 ? `${file_name.slice(0, 8)}... - ${product_name}` : `${file_name} - ${product_name}`;
            kcdesk?.fileSetName(file_name);
            clearTimeout(timer);
        }, 500)
    }
})

watch(fileName, (NewNanme) => {
    if (NewNanme) {
        (window as any).wx.miniProgram.postMessage({
            data: {
                name: NewNanme,
                id: docInfo.value.document.id
            }
        });
    }
})

onMounted(() => {
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('unload', onUnload);
    init_screen_size();
    init_doc();
    initpal().then(() => {
        inited.value = true;
    }).catch((e) => {
        console.log(e)
    })
})

onUnmounted(() => {
    closeNetMsg();
    onUnloadForCommunication();
    window.document.title = t('product.name');
    (window as any).sketchDocument = undefined;
    (window as any).skrepo = undefined;
    context?.selection.unwatch(selectionWatcher);
    context?.workspace.unwatch(workspaceWatcher);
    context?.tool.unwatch(tool_watcher);
    clearInterval(timer);
    localStorage.removeItem('docId')
    showHint.value = false;
    countdown.value = 10;
    window.removeEventListener('beforeunload', onBeforeUnload);
    window.removeEventListener('unload', onUnload);
    clearInterval(loopNet);
    clearInterval(netErr);
    networkStatus.close();
    context?.component.unwatch(component_watcher);
    uninstall_keyboard_units();
    stop();
    clearInterval(updateDocumentKeyTimer); // 清除更新文档密钥定时器
})
</script>

<template>
    <div class="main" style="height: 100vh;">
        <Loading v-if="loading" :size="20"></Loading>
        <div id="top" @dblclick="switchFullScreen" v-if="showTop">
            <Toolbar :context="context!" v-if="!loading && !null_context" />
        </div>
        <div id="visit">
            <ApplyFor></ApplyFor>
        </div>
        <ColSplitView id="center" :style="{ height: showTop ? 'calc(100% - 46px)' : '100%' }"
            v-if="inited && !null_context" :left="{ width: Left.leftWidth, minWidth: Left.leftMinWidth, maxWidth: 0.4 }"
            :right="rightWidth" :context="context!" @changeLeftWidth="changeLeftWidth">
            <template #slot1>
                <Navigation v-if="curPage !== undefined && !null_context" id="navigation" :context="context!"
                    @switchpage="switchPage" @mouseenter="() => { mouseenter('left') }" @showNavigation="showHiddenLeft"
                    :page="(curPage as PageView)" :showLeft="showLeft" :leftTriggleVisible="leftTriggleVisible">
                </Navigation>
            </template>

            <template #slot2>
                <ContentView v-if="curPage !== undefined && !null_context" id="content" :context="context!"
                    @mouseenter="() => { mouseleave('left') }" :page="(curPage as PageView)"
                    @closeLoading="closeLoading">
                </ContentView>
            </template>

            <template #slot3>
                <Attribute id="attributes" v-if="!null_context && !loading" :context="context!"
                    @mouseenter="(e: Event) => { mouseenter('right') }" @mouseleave="() => { mouseleave('right') }"
                    :showRight="showRight" :rightTriggleVisible="rightTriggleVisible" @showAttrbute="showHiddenRight">
                </Attribute>
            </template>
        </ColSplitView>
        <SubLoading v-if="sub_loading"></SubLoading>
        <div class="network" v-if="noNetwork">
            <NetWorkError @refresh-doc="refreshDoc" :top="true"></NetWorkError>
        </div>
        <div v-if="showHint" class="notification">
            <el-icon :size="13">
                <Warning />
            </el-icon>
            <span class="text" v-if="permissionChange === PermissionChange.update">{{ t('home.prompt') }}</span>
            <span class="text" v-if="permissionChange === PermissionChange.close">{{ t('home.visit') }}</span>
            <span class="text" v-if="permissionChange === PermissionChange.delete">{{ t('home.delete_file') }}</span>
            <span style="color: #1878F5;" v-if="countdown > 0">{{ countdown }}</span>
        </div>
        <Bridge v-if="bridge" :context="context!"></Bridge>
        <HelpEntrance v-if="!null_context" :context="context!" />
    </div>
</template>

<style scoped lang="scss">
.main {
    min-width: 460px;
    width: 100%;
    overflow-x: auto;

    @media (max-width: 460px) {
        overflow-x: scroll;
    }

    &::-webkit-scrollbar {
        display: none;
    }

    &::-webkit-scrollbar-track {
        display: none;
    }

    &::-webkit-scrollbar-thumb {
        display: none;
    }

    &::-webkit-scrollbar-thumb:hover {
        display: none;
    }

    &::-webkit-scrollbar-thumb:active {
        display: none;
    }

    #top {
        display: flex;
        flex-flow: row nowrap;
        width: 100%;
        height: 46px;
        background: var(--theme-color);
        padding: 10px 8px;
        box-sizing: border-box;
        position: relative;
        z-index: 19;
    }

    .network {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
    }

    #visit {
        position: absolute;
        top: 45px;
        right: 10px;
        z-index: 999;
        overflow: hidden;
        height: calc(100% - 45px);
    }

    #center {
        display: flex;
        flex-flow: row nowrap;
        width: 100%;
        overflow: hidden;
        position: relative;

        #navigation {
            height: 100%;
            background-color: var(--left-navi-bg-color);
        }

        #content {
            width: 100%;
            height: 100%;
            overflow: hidden;
            position: relative;
        }

        #attributes {
            height: 100%;
            background-color: var(--right-attr-bg-color);
            z-index: 9;
        }
    }

    .notification {
        position: fixed;
        font-size: var(--font-default-fontsize);
        display: flex;
        align-items: center;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        color: red;
        background-color: #fff;
        border: 1px solid #ccc;
        padding: 7px 30px;
        border-radius: 4px;

        .text {
            margin: 0 15px 0 10px;
        }
    }

    .network_error {
        position: fixed;
        font-size: var(--font-default-fontsize);
        display: flex;
        align-items: center;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        color: #f1f1f1;
        background-color: var(--active-color);
        padding: 7px 30px;
        border: 1px solid var(--active-color);
        border-radius: 4px;

        .loading-spinner {
            >svg {
                width: 15px;
                height: 15px;
                color: #000;
            }

            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }
    }
}
</style>
