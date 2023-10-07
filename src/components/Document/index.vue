<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, ref, watchEffect } from 'vue';
import ContentView from "./ContentView.vue";
import { Context } from '@/context';
import Navigation from './Navigation/index.vue';
import { Selection } from '@/context/selection';
import Attribute from './Attribute/RightTabs.vue';
import Toolbar from './Toolbar/index.vue'
import ColSplitView from '@/components/common/ColSplitView.vue';
import ApplyFor from './Toolbar/Share/ApplyFor.vue';
import { Document, importDocument, Repository, Page, CoopRepository } from '@kcdesign/data';
import { STORAGE_URL, SCREEN_SIZE } from '@/utils/setting';
import * as share_api from '@/apis/share'
import * as user_api from '@/apis/users'
import { useRoute } from 'vue-router';
import { router } from '@/router';
import { useI18n } from 'vue-i18n';
import { Warning } from '@element-plus/icons-vue';
import Loading from '@/components/common/Loading.vue';
import SubLoading from '@/components/common/SubLoading.vue';
import { Perm, WorkSpace } from '@/context/workspace';
import NetWorkError from '@/components/NetworkError.vue'
import { ResponseStatus } from "@/communication/modules/doc_upload";
import { insertNetworkInfo } from "@/utils/message"
import { S3Storage, StorageOptions } from "@/utils/storage";
import { NetworkStatus } from '@/communication/modules/network_status'
import { Comment } from '@/context/comment';
import { DocSelectionOp } from "@/context/communication/doc_selection_op";
import { throttle } from "@/utils/timing_util";
import { DocSelectionOpData, DocSelectionOpType } from "@/communication/modules/doc_selection_op";
import { debounce } from '@/utils/timing_util';
import { NetworkStatusType } from "@/communication/types";
import { _updateRoot } from '@/utils/content';

const { t } = useI18n();
const curPage = shallowRef<Page | undefined>(undefined);
let context: Context | undefined;
const middleWidth = ref<number>(0.8);
const middleMinWidth = ref<number>(0.3);
const route = useRoute();
const Right = ref({ rightMin: 250, rightMinWidth: 0.1, rightWidth: 0.1 });
const Left = ref({ leftMin: 250, leftWidth: 0.1, leftMinWidth: 0.1 });
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
const isRead = ref(false)
const canComment = ref(false)
const isEdit = ref(true)
function screenSetting() {
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
    const delay = 2000;
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
function switchPage(id?: string) {
    if (!id) return
    if (context) {
        const ctx: Context = context;
        const pagesMgr = ctx.data.pagesMgr;
        pagesMgr.get(id).then((page: Page | undefined) => {
            if (page) {
                ctx.comment.toggleCommentPage()
                curPage.value = undefined;
                ctx.comment.commentMount(false)
                ctx.selection.selectPage(page);
                curPage.value = page;
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

function keyboardEventHandler(event: KeyboardEvent) {
    const { target, code, ctrlKey, metaKey, shiftKey } = event;
    if (target instanceof HTMLInputElement) return; // 在输入框中输入时避免触发编辑器的键盘事件
    if (context) {
        if (code === 'Backslash') {
            if (ctrlKey || metaKey) {
                shiftKey ? keyToggleTB() : keyToggleLR();
            }
        }
        if (context.workspace.documentPerm !== Perm.isEdit) {
            if (permKeyBoard(event)) {
                context.workspace.keyboardHandle(event); // 只读可评论的键盘事件
            }
        } else {
            context.esctask.keyboardHandle(event);
            context.workspace.keyboardHandle(event); // 编辑器相关的键盘事件
            context.tool.keyhandle(event);
        }
    }
}
const permKeyBoard = (e: KeyboardEvent) => {
    const { code, ctrlKey, metaKey, shiftKey } = e;
    if (code === 'KeyV' || code === 'KeyC' || code === 'KeyA' || code === 'Digit0 ' || ctrlKey || metaKey || shiftKey) return true
    else false
}

const showHiddenRight = () => {
    if (showRight.value) {
        Right.value.rightMin = 0
        Right.value.rightWidth = 0
        Right.value.rightMinWidth = 0
        middleWidth.value = middleWidth.value + 0.1
        showRight.value = false
    } else {
        Right.value.rightMin = 250
        Right.value.rightWidth = 0.1
        Right.value.rightMinWidth = 0.1
        middleWidth.value = middleWidth.value - 0.1
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
        middleWidth.value = middleWidth.value + 0.1
        showLeft.value = false
    } else {
        Left.value.leftMin = 250
        Left.value.leftWidth = 0.1
        Left.value.leftMinWidth = 0.1
        middleWidth.value = middleWidth.value - 0.1
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

//只读权限隐藏右侧属性栏
watchEffect(() => {
    if (isRead.value || canComment.value) {
        Right.value.rightMin = 0
        Right.value.rightWidth = 0
        Right.value.rightMinWidth = 0
        middleWidth.value = middleWidth.value + 0.1
    }
})

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
        if (data.data.perm_type !== permType.value) {
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
            isRead.value = true
        } else if (data.data.perm_type === 2) {
            isRead.value = false
            canComment.value = true
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
        router.push('/')
    } else {
        router.go(0)
    }
}
const showNotification = (type?: number) => {
    insertNetworkInfo('networkError', false, network_error);
    window.removeEventListener('beforeunload', onBeforeUnload);
    showHint.value = true;
    startCountdown(type);
}
const getUserInfo = async () => {
    const { data } = await user_api.GetInfo()
    if (context) {
        context.comment.setUserInfo(data)
        localStorage.setItem('avatar', data.avatar)
        localStorage.setItem('nickname', data.nickname)
        localStorage.setItem('userId', data.id)
    }
}

//获取文档信息
const getDocumentInfo = async () => {
    try {
        loading.value = true;
        noNetwork.value = false
        const dataInfo = await share_api.getDocumentInfoAPI({ doc_id: route.query.id });
        docInfo.value = dataInfo.data;
        if (dataInfo.code === 400) {
            //无效链接
            // ElMessage({ message: `${t('apply.link_not')}` });
            // return router.push('/');
            router.push({
                name: 'apply',
                query: {
                    id: route.query.id
                }
            })
            return
        }
        permType.value = dataInfo.data.document_permission.perm_type;
        //获取文档类型是否为私有文档且有无权限
        if (docInfo.value.document_permission.perm_type === 0) {
            router.push({
                name: 'apply',
                query: {
                    id: route.query.id
                }
            })
            return
        }
        const { data } = await share_api.getDocumentKeyAPI({ doc_id: route.query.id });
        // documentKey.value = data

        const repo = new Repository();
        const importDocumentParams: StorageOptions = {
            endPoint: STORAGE_URL,
            region: "zhuhai-1",
            accessKey: data.access_key,
            secretKey: data.secret_access_key,
            sessionToken: data.session_token,
            bucketName: "document"
        }
        const path = docInfo.value.document.path;
        const document = await importDocument(new S3Storage(importDocumentParams), path, "", dataInfo.data.document.version_id ?? "", repo)
        if (document) {
            const coopRepo = new CoopRepository(document, repo)
            const file_name = docInfo.value.document?.name || document.name;
            window.document.title = file_name.length > 8 ? `${file_name.slice(0, 8)}... - ProtoDesign` : `${file_name} - ProtoDesign`;
            context = new Context(document, coopRepo);
            context.workspace.setDocumentPerm(dataInfo.data.document_permission.perm_type)
            getDocumentAuthority();
            getUserInfo()
            
            context.comment.setDocumentInfo(dataInfo.data)
            null_context.value = false;
            context.selection.watch(selectionWatcher);
            context.workspace.watch(workspaceWatcher);

            const docId = route.query.id as string;
            const token = localStorage.getItem("token") || "";
            if (await context.communication.docOp.start(token, docId, document, context.coopRepo, dataInfo.data.document.version_id ?? "")) {
                switchPage(context!.data.pagesList[0]?.id);
                loading.value = false;
            } else {
                router.push("/");
                return;
            }
            await context.communication.docResourceUpload.start(token, docId);
            await context.communication.docCommentOp.start(token, docId);
            await context.communication.docSelectionOp.start(token, docId, context);
            context.communication.docSelectionOp.addOnMessage(teamSelectionModifi)
        }
    } catch (err) {
        loading.value = false;
        noNetwork.value = true
        console.log(err)
        throw err;
    }
}

async function upload(projectId: string) {
    const token = localStorage.getItem("token");
    if (!token || !context || !context.data) return;
    if (!await context.communication.docUpload.start(token, projectId)) {
        // todo 上传通道开启失败处理
        return;
    }
    let result;
    try {
        result = await context.communication.docUpload.upload(context.data);
    } catch (e) {
        // todo 上传失败处理
        return;
    }
    if (!result || result.status !== ResponseStatus.Success || !result.data?.doc_id || typeof result.data?.doc_id !== "string") {
        // todo 上传失败处理
        return;
    }
    const doc_id = result!.data.doc_id;
    router.replace({
        path: '/document',
        query: { id: doc_id },
    });
    if (!await context.communication.docOp.start(token, doc_id, context!.data, context.coopRepo, result!.data.version_id ?? "")) {
        // todo 文档操作通道开启失败处理
    }
    context.communication.docResourceUpload.start(token, doc_id);
    context.communication.docCommentOp.start(token, doc_id);
    await context.communication.docSelectionOp.start(token, doc_id, context);
    context.communication.docSelectionOp.addOnMessage(teamSelectionModifi);
    context.workspace.notify(WorkSpace.INIT_DOC_NAME);
}
let timer: any = null;
function init_screen_size() {
    localStorage.setItem(SCREEN_SIZE.KEY, SCREEN_SIZE.NORMAL);
}
function init_doc() {
    if (route.query.id) { // 从远端读取文件
        getDocumentInfo();
        document.addEventListener('keydown', keyboardEventHandler);
        timer = setInterval(() => {
            getDocumentAuthority();
        }, 30000);
    } else { // 从本地读取文件
        if ((window as any).sketchDocument) {
            context = new Context((window as any).sketchDocument as Document, ((window as any).skrepo as CoopRepository));
            null_context.value = false;
            getUserInfo();
            context.selection.watch(selectionWatcher);
            context.workspace.watch(workspaceWatcher);
            const project_id = localStorage.getItem('project_id') || ''; 
            upload(project_id);
            localStorage.setItem('project_id', '');
            switchPage(((window as any).sketchDocument as Document).pagesList[0]?.id);
            document.addEventListener('keydown', keyboardEventHandler);
        } else {
            router.push('/');
        }
    }
}
function workspaceWatcher(t: number) {
    if (t === WorkSpace.FREEZE) {
        sub_loading.value = true;
    } else if (t === WorkSpace.THAW) {
        sub_loading.value = false;
    } else if (t === WorkSpace.HIDDEN_UI) {
        keyToggleTB();
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
const networkDebounce = debounce(networkMessage, 1000)

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
        // 网络断开连接
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
        //网络连接成功
        if (context) {
            if (context.communication.docOp.hasPendingSyncCmd() || netErr) {
                //有未上传资源
                hasPendingSync()
            } else {
                networkDebounce(status)
            }
            context.comment.notify(Comment.EDIT_COMMENT)
            clearInterval(loopNet)
        }
    }
})

function onBeforeUnload(event: any) {
    if (context?.communication.docOp.hasPendingSyncCmd()) return event.returnValue = t('message.leave'); // 浏览器弹框提示
    return event.preventDefault();
}

function onUnloadForCommunication() {
    try {
        context?.communication.docOp.close();
        context?.communication.docResourceUpload.close();
        context?.communication.docCommentOp.close();
        context?.communication.docSelectionOp.close();
    } catch (err) { }
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

onMounted(() => {
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('unload', onUnload);
    init_screen_size();
    init_doc();
})

onUnmounted(() => {
    closeNetMsg();
    onUnloadForCommunication();
    window.document.title = t('product.name');
    (window as any).sketchDocument = undefined;
    (window as any).skrepo = undefined;
    context?.selection.unwatch(selectionWatcher);
    context?.workspace.unwatch(workspaceWatcher);
    document.removeEventListener('keydown', keyboardEventHandler);
    clearInterval(timer);
    localStorage.removeItem('docId')
    showHint.value = false;
    countdown.value = 10;
    window.removeEventListener('beforeunload', onBeforeUnload);
    window.removeEventListener('unload', onUnload);
    clearInterval(loopNet);
    clearInterval(netErr);
    networkStatus.close();
})
</script>

<template>
    <div class="main" style="height: 100vh;">
        <Loading v-if="loading || null_context"></Loading>
        <div id="top" @dblclick="screenSetting" v-if="showTop">
            <Toolbar :context="context!" v-if="!loading && !null_context" />
        </div>
        <div id="visit">
            <ApplyFor></ApplyFor>
        </div>
        <ColSplitView id="center" :style="{ height: showTop ? 'calc(100% - 40px)' : '100%' }"
            v-if="!loading && !null_context" :left="{ width: Left.leftWidth, minWidth: Left.leftMinWidth, maxWidth: 0.5 }"
            :middle="{ width: middleWidth, minWidth: middleMinWidth, maxWidth: middleWidth }"
            :right="{ width: Right.rightWidth, minWidth: Right.rightMinWidth, maxWidth: 0.5 }"
            :right-min-width-in-px="Right.rightMin" :left-min-width-in-px="Left.leftMin" :context="context!">
            <template #slot1>
                <Navigation v-if="curPage !== undefined && !null_context" id="navigation" :context="context!"
                    @switchpage="switchPage" @mouseenter="() => { mouseenter('left') }" @showNavigation="showHiddenLeft"
                    @mouseleave="() => { mouseleave('left') }" :page="(curPage as Page)" :showLeft="showLeft"
                    :leftTriggleVisible="leftTriggleVisible">
                </Navigation>
            </template>
            <template #slot2>
                <ContentView v-if="curPage !== undefined && !null_context" id="content" :context="context!"
                    :page="(curPage as Page)">
                </ContentView>
            </template>
            <template #slot3>
                <Attribute id="attributes" v-if="!null_context && !isRead" :context="context!"
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
            <span style="color: #0d99ff;" v-if="countdown > 0">{{ countdown }}</span>
        </div>
    </div>
</template>
<style>
:root {
    /* top toolbar */
    --top-toolbar-bg-color: var(--theme-color);
    --top-toolbar-font-color: var(--theme-color-anti);
    /* left navigation col */
    --left-navi-bg-color: var(--theme-color-anti);
    --left-navi-button-hover-color: var(--grey-light);
    --left-navi-button-select-color: var(--grey-dark);
    --left-navi-font-color: var(--theme-color);
    /* right attribute col */
    --right-attr-bg-color: var(--theme-color-anti);
    /* center content area */
    --center-content-bg-color: var(--grey-light);
}
</style>
<style scoped lang="scss">
#top {
    display: flex;
    position: relative;
    flex-flow: row nowrap;
    width: 100%;
    height: 40px;
    background-color: var(--top-toolbar-bg-color);
    z-index: 10;
    min-height: 40px;
}

.network {
    position: absolute;
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
    flex: 1 1 auto;
    width: 100%;
    overflow: hidden;
    position: relative;

    #navigation {
        height: 100%;
        background-color: var(--left-navi-bg-color);
        z-index: 9;
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
    background-color: var(--active-color-beta);
    padding: 7px 30px;
    border: 1px solid var(--active-color-beta);
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
</style>
