<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, ref } from 'vue';
import ContentView from "./ContentView.vue";
import { Context } from '@/context';
import Navigation from './Navigation/index.vue';
import { Selection } from '@/context/selection';
import Attribute from './Attribute/RightTabs.vue';
import Toolbar from './Toolbar/index.vue'
import ColSplitView from '@/components/common/ColSplitView.vue';
import ApplyFor from './Toolbar/Share/ApplyFor.vue';
import { Document, importDocument, uploadExForm, Repository, Page, CoopRepository } from '@kcdesign/data';
import { Ot } from "@/communication/modules/ot";
import { STORAGE_URL, DOC_UPLOAD_URL, SCREEN_SIZE } from '@/utils/setting';
import * as share_api from '@/apis/share'
import * as user_api from '@/apis/users'
import { useRoute } from 'vue-router';
import { router } from '@/router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Warning } from '@element-plus/icons-vue';
import Loading from '@/components/common/Loading.vue';
import SubLoading from '@/components/common/SubLoading.vue';
import { WorkSpace } from '@/context/workspace';
import { measure } from '@/layout/text/measure';
import Home from "@/components/Document/Toolbar/BackToHome.vue";

const { t } = useI18n();
const curPage = shallowRef<Page | undefined>(undefined);
let context: Context | undefined;
(window as any).__context = context;
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
const leftTriggleVisible = ref<boolean>(false);
const rightTriggleVisible = ref<boolean>(false);
let timerForLeft: any;
let timeForRight: any;
const loading = ref<boolean>(false);
const sub_loading = ref<boolean>(false);
const null_context = ref<boolean>(true);
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
                ctx.workspace.toggleCommentPage()
                curPage.value = undefined;
                ctx.workspace.commentMount(false)
                ctx.selection.selectPage(page);
                (window as any).__context = ctx;
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
function keyboardEventHandler(evevt: KeyboardEvent) {
    const { target, code, ctrlKey, metaKey, shiftKey } = evevt;
    if (target instanceof HTMLInputElement) return; // 在输入框中输入时避免触发编辑器的键盘事件
    if (context) {
        context.workspace.keyboardHandle(evevt); // 编辑器相关的键盘事件
        if (code === 'Backslash') {
            if (ctrlKey || metaKey) {
                shiftKey ? keyToggleTB() : keyToggleLR();
            }
        }
    }
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
    showHint.value = true;
    startCountdown(type);
}
const getUserInfo = async () => {
    const { data } = await user_api.GetInfo()
    if (context) {
        context.workspace.setUserInfo(data)
        localStorage.setItem('avatar', data.avatar)
        localStorage.setItem('nickname', data.nickname)
        localStorage.setItem('userId', data.id)
    }
}

//获取文档信息
let ot: Ot | undefined;
const getDocumentInfo = async () => {
    try {
        loading.value = true;
        const dataInfo = await share_api.getDocumentInfoAPI({ doc_id: route.query.id });
        docInfo.value = dataInfo.data;
        permType.value = dataInfo.data.document_permission.perm_type;
        if (dataInfo.code === 400) {
            //无效链接
            ElMessage({ message: `${t('apply.link_not')}` });
            router.push('/');
        }
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
        const importDocumentParams = {
            endPoint: STORAGE_URL,
            region: "zhuhai-1",
            accessKey: data.access_key,
            secretKey: data.secret_access_key,
            sessionToken: data.session_token,
            bucketName: "document"
        }
        const path = docInfo.value.document.path;
        const document = await importDocument(importDocumentParams, path, "", "", repo, measure)
        if (document) {
            const coopRepo = new CoopRepository(document, repo)
            const file_name = docInfo.value.document?.name || document.name;
            window.document.title = file_name.length > 8 ? `${file_name.slice(0, 8)}... - ProtoDesign` : `${file_name} - ProtoDesign`;
            context = new Context(document, coopRepo);
            context.workspace.setDocumentInfo(dataInfo.data)
            null_context.value = false;
            context.selection.watch(selectionWatcher);
            context.workspace.watch(workspaceWatcher);

            const docId = route.query.id as string;
            const token = localStorage.getItem("token") || "";
            ot = Ot.Make(docId, token, document, context.coopRepo, "0");
            ot.start()
                .catch((e) => {
                    if (!context) {
                        router.push('/');
                        throw new Error(e);
                    }
                }).finally(() => {
                    if (!context) {
                        router.push('/');
                        return;
                    }
                    switchPage(context.data.pagesList[0]?.id);
                    loading.value = false;
                });
            await context.upload.start(docId, token);
        }
        getUserInfo()
    } catch (err) {
        loading.value = false;
        console.log(err)
        throw err;
    }
}

function upload() {
    const token = localStorage.getItem('token');
    if (!token || !context || !context.data) {
        return
    }
    uploadExForm(context.data, DOC_UPLOAD_URL, token, '', (isSuccess, doc_id) => {
        if (isSuccess) {
            router.replace({
                path: '/document',
                query: { id: doc_id }
            });
            ot = Ot.Make(doc_id, localStorage.getItem('token') || "", context!.data, context!.coopRepo, "0");
            ot.start();
            context!.upload.start(doc_id, token);
            context!.workspace.notify(WorkSpace.INIT_DOC_NAME);
        }
    })
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
            getUserInfo()
            context.selection.watch(selectionWatcher);
            context.workspace.watch(workspaceWatcher);
            upload();
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
onMounted(() => {
    init_screen_size();
    init_doc();
})
onUnmounted(() => {
    try {
        ot?.close();
    } catch (err) { }
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
})
</script>

<template>
    <Loading v-if="loading || null_context"></Loading>
    <div id="top" @dblclick="screenSetting" v-if="showTop">
        <Toolbar :context="context!" v-if="!loading && !null_context" />
    </div>
    <div id="visit">
        <ApplyFor></ApplyFor>
    </div>
    <ColSplitView id="center" v-if="!loading && !null_context"
        :left="{ width: Left.leftWidth, minWidth: Left.leftMinWidth, maxWidth: 0.5 }"
        :middle="{ width: middleWidth, minWidth: middleMinWidth, maxWidth: middleWidth }"
        :right="{ width: Right.rightWidth, minWidth: Right.rightMinWidth, maxWidth: 0.5 }"
        :right-min-width-in-px="Right.rightMin" :left-min-width-in-px="Left.leftMin">
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
            <Attribute id="attributes" v-if="!null_context" :context="context!"
                @mouseenter="(e: Event) => { mouseenter('right') }" @mouseleave="() => { mouseleave('right') }"
                :showRight="showRight" :rightTriggleVisible="rightTriggleVisible" @showAttrbute="showHiddenRight">
            </Attribute>
        </template>
    </ColSplitView>
    <SubLoading v-if="sub_loading"></SubLoading>
    <div v-if="showHint" class="notification">
        <el-icon :size="13">
            <Warning />
        </el-icon>
        <span class="text" v-if="permissionChange === PermissionChange.update">{{ t('home.prompt') }}</span>
        <span class="text" v-if="permissionChange === PermissionChange.close">{{ t('home.visit') }}</span>
        <span class="text" v-if="permissionChange === PermissionChange.delete">{{ t('home.delete_file') }}</span>
        <span style="color: #0d99ff;" v-if="countdown > 0">{{ countdown }}</span>
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
    z-index: 2;
    min-height: 40px;
}

#visit {
    position: absolute;
    top: 45px;
    right: 10px;
    z-index: 999;
}

#center {
    display: flex;
    flex-flow: row nowrap;
    flex: 1 1 auto;
    width: 100%;
    height: auto;
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
    top: 50px;
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
</style>
