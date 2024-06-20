<script setup lang="ts">
import { Context } from '@/context';
// import { useRoute } from 'vue-router';
// import { router } from '@/router';
import { useI18n } from 'vue-i18n';
// import * as share_api from '@/request/share'
import { ElMessage } from 'element-plus';
import { importRemote, Repository, Page, CoopRepository, IStorage, PageView, PageListItem } from '@kcdesign/data';
// import { OssStorage, S3Storage, StorageOptions } from '@/utils/storage';
import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
// import kcdesk from '@/kcdesk';
import { WorkSpace } from '@/context/workspace';
// import { SCREEN_SIZE } from '@/settings';
import { initpal } from '../Document/initpal';
import Toolbar from '@/components/Preview/PreviewToolbar/index.vue'
import ColSplitView from '@/components/common/ColSplitView.vue';
import Loading from '@/components/common/Loading.vue';
import Navigation from '@/components/Preview/PreviewNavigation/index.vue'
import SubLoading from '@/components/common/SubLoading.vue';
import { Preview } from '@/context/preview';
import PreviewContent from './PreviewContent.vue';
import { getFrameList, keyboard } from '@/utils/preview';
import { IContext } from '@/openapi';

const props = defineProps<{ context: IContext }>()
const context = props.context as Context;

const { t } = useI18n();
// let context: Context | undefined;
// const route = useRoute();
const loading = ref<boolean>(false);
// const null_context = ref<boolean>(true);
const showLeft = ref<boolean>(true);
const curPage = shallowRef<PageView | undefined>(undefined);
const sub_loading = ref<boolean>(false);
const leftTriggleVisible = ref<boolean>(false);
let uninstall_keyboard_units: () => void = () => {
};
const showTop = ref<boolean>(true);
const Left = ref({ leftMin: 250, leftWidth: 250, leftMinWidth: 250 });
const inited = ref(false);
// const docInfo: any = ref({});
// type UnwrappedPromise<T> = T extends Promise<infer U> ? U : T
// let documentLoader: UnwrappedPromise<ReturnType<typeof importRemote>>['loader'] | undefined = undefined;
// const getDocumentInfo = async () => {
//     try {
//         loading.value = true;
//         const docInfoPromise = share_api.getDocumentInfoAPI({ doc_id: route.query.id });
//         const docKeyPromise = share_api.getDocumentKeyAPI({ doc_id: route.query.id });
//         const [docInfoRes, docKeyRes] = await Promise.all([docInfoPromise, docKeyPromise]);
//         if (docInfoRes.code !== 0 || docKeyRes.code !== 0) { // 打开文档失败
//             if (docKeyRes.code === 403) {
//                 if (docKeyRes.message === "审核不通过") {
//                     router.push("/files");
//                     ElMessage.error({ duration: 3000, message: t('system.sensitive_reminder3') })
//                     return;
//                 }
//                 router.push("/files");
//                 ElMessage.error({ duration: 3000, message: docKeyRes.message })
//                 return;
//             } else {
//                 router.push("/files");
//                 ElMessage.error({ duration: 3000, message: docInfoRes.message })
//                 return;
//             }
//         }
//         const docInfoData = docInfoRes.data;
//         const docKeyData = docKeyRes.data;
//         docInfo.value = docInfoData;
//         const repo = new Repository();
//         const storageOptions: StorageOptions = {
//             endPoint: docKeyData.endpoint,
//             region: docKeyData.region,
//             accessKey: docKeyData.access_key,
//             secretKey: docKeyData.secret_access_key,
//             sessionToken: docKeyData.session_token,
//             bucketName: docKeyData.bucket_name,
//         }
//         let storage: IStorage;
//         if (docKeyData.provider === "oss") {
//             storage = new OssStorage(storageOptions);
//         } else {
//             storage = new S3Storage(storageOptions);
//         }
//         const path = docInfoData.document.path;
//         const versionId = docInfoData.document.version_id ?? "";
//         const d = await importRemote(storage, path, "", versionId, repo)
//         const document = d.document;
//         documentLoader = d.loader;
//         if (document) {
//             const coopRepo = new CoopRepository(document, repo);
//             const file_name = docInfoData.document?.name || document.name;
//             window.document.title = file_name.length > 8 ? `${file_name.slice(0, 8)}... - ${t('product.name')}` : `${file_name} - ${t('product.name')}`;
//             kcdesk?.fileSetName(file_name);
//             context = new Context(document, coopRepo);
//             context.comment.setDocumentInfo(docInfoData);
//             null_context.value = false;
//             init_watcher();
//             init_keyboard_uints();
//             const docId = route.query.id as string;
//             const getToken = () => Promise.resolve(localStorage.getItem("token") || "");
//             if (!await context.communication.docOp.start(getToken, docId, document, context.coopRepo, versionId)) {
//                 router.push("/files");
//                 return;
//             }
//             await context.communication.docResourceUpload.start(getToken, docId);
//             await context.communication.docSelectionOp.start(getToken, docId, context);
//             const route_p_id = route.query.page_id ? route.query.page_id as string : context!.data.pagesList[0]?.id;
//             const page: PageListItem | undefined = context!.data.pagesList.filter((item) => item.id.slice(0, 8) === route_p_id.slice(0, 8))[0];
//             const frameId = route.query.frame_id as string;
//             context.preview.setDocInfoId(docInfoData.document.id);
//             switchPage(page?.id || context!.data.pagesList[0]?.id, frameId);
//             loading.value = false;
//         }
//     } catch (err) {
//         loading.value = false;
//         console.log(err);
//         throw err;
//     }
// }

function switchPage(id?: string, shapeId?: string) {
    if (!id) return
    if (context) {
        const ctx: Context = context;
        const pagesMgr = ctx.data.pagesMgr;
        const cur_page = context.preview.selectedPage;
        if (cur_page && cur_page.id === id) return;
        pagesMgr.get(id).then((page: Page | undefined) => {
            if (page) {
                curPage.value = undefined;
                const pagedom = ctx.getPageDom(page).dom;
                ctx.preview.selectPage(pagedom);
                selectedShape(ctx, pagedom, shapeId);
                curPage.value = pagedom;
                setWindowTitle(ctx, pagedom);
            }
        })
    }
}

const setWindowTitle = (context: Context, page: PageView) => {
    // const _name = context?.data.name || '';
    // const file_name = docInfo.value.document?.name || _name;
    // const pages = context.data.pagesList
    // const page_name = pages.find(item => item.id === page.id)?.name || '';
    // window.document.title = file_name.length > 8 ? `▶ ${file_name.slice(0, 8)}... - ${page_name.slice(0, 8)}` : `▶ ${file_name} - ${page_name.slice(0, 8)}`;
    // kcdesk?.fileSetName(file_name);
}

const selectedShape = (ctx: Context, page: PageView, id?: string) => {
    // const list = getFrameList(page);
    // if (!list.length) {
    //     ElMessage.error({ duration: 3000, message: `${t('home.not_preview_frame')}` })
    //     ctx.preview.selectShape(undefined);
    //     ctx.preview.updateUrl();
    //     return;
    // }
    // if (id) {
    //     const shape = list.find(item => item.id.slice(0, 8) === id);
    //     ctx.preview.selectShape(shape || list[0]);
    // } else {
    //     ctx.preview.selectShape(list[0]);
    // }
    // ctx.preview.updateUrl();
}
function previewWatcher(t: number) {
    if (t === Preview.CHANGE_PAGE) {

            const ctx: Context = context;
            curPage.value = ctx.preview.selectedPage;
        
    } else if (t === Preview.UI_CHANGE) {

        if (!context.preview.uiState) {
            if (showLeft.value && showTop.value) {
                showHiddenLeft();
                showTop.value = false;
            } else if (!showLeft.value) {
                showTop.value = false;
            }
        } else {
            if (!showLeft.value) {
                showHiddenLeft();
            }
            showTop.value = true;
        }
    } else if (t === Preview.NAVI_CHANGE) {
        showHiddenLeft();
    }
}
function workspaceWatcher(t: number, o?: any) {
    if (t === WorkSpace.FREEZE) {
        sub_loading.value = true;
    } else if (t === WorkSpace.THAW) {
        sub_loading.value = false;
    }
}

function switchFullScreen() {
    // const element = document.documentElement;
    // const isFullScreen = document.fullscreenElement;
    // if (isFullScreen === null) {
    //     element.requestFullscreen && element.requestFullscreen();
    //     localStorage.setItem(SCREEN_SIZE.KEY, SCREEN_SIZE.FULL);
    // } else {
    //     document.exitFullscreen && document.exitFullscreen();
    //     localStorage.setItem(SCREEN_SIZE.KEY, SCREEN_SIZE.NORMAL);
    // }
}
let timerForLeft: any;
const showHiddenLeft = () => {

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
    context.preview.showNavi(showLeft.value);
}

function mouseenter() {
    if (timerForLeft) {
        clearTimeout(timerForLeft);
        timerForLeft = undefined;
    }
    leftTriggleVisible.value = true;
}
function mouseleave() {
    const delay = 80;
    timerForLeft = setTimeout(() => {
        if (!timerForLeft) return;
        leftTriggleVisible.value = false;
        clearTimeout(timerForLeft);
        timerForLeft = undefined;
    }, delay);

}


function init_watcher() {

    context.preview.watch(previewWatcher);
    context.workspace.watch(workspaceWatcher);
}

function init_keyboard_uints() {

    uninstall_keyboard_units = keyboard(context);
}

function init_screen_size() {
    // localStorage.setItem(SCREEN_SIZE.KEY, SCREEN_SIZE.NORMAL);
}

const changeLeftWidth = (width: number) => {
    Left.value.leftWidth = width;
}

onMounted(() => {
    // getDocumentInfo();
    init_screen_size();
    initpal().then(() => {
        inited.value = true;
    }).catch((e) => {
        console.log(e)
    })
    // todo
    switchPage(props.context.data.pagesList[0]?.id);
})

onUnmounted(() => {
    context.preview.unwatch(previewWatcher);
    context.workspace.unwatch(workspaceWatcher);
    uninstall_keyboard_units();
})

</script>

<template>
    <div class="main" style="height: 100vh;">
        <Loading v-if="loading" :size="20"></Loading>
        <div id="top" @dblclick="switchFullScreen" v-if="showTop">
            <Toolbar :context="context" v-if="!loading"></Toolbar>
        </div>
        <ColSplitView id="center" :style="{ height: showTop ? 'calc(100% - 46px)' : '100%' }"
        v-if="inited"  :left="{ width: Left.leftWidth, minWidth: Left.leftMinWidth, maxWidth: 0.4 }"
            :right="0" :context="context" @changeLeftWidth="changeLeftWidth">
            <template #slot1>
                <Navigation v-if="curPage !== undefined" id="navigation" :context="context"
                    @mouseenter="mouseenter" :page="(curPage as PageView)" :showLeft="showLeft"
                    :leftTriggleVisible="leftTriggleVisible" @showNavigation="showHiddenLeft" @switchpage="switchPage">
                </Navigation>
            </template>

            <template #slot2>
                <PreviewContent v-if="curPage !== undefined" id="content" :context="context"
                    @mouseenter="mouseleave" :showTop="showTop" :page="(curPage as PageView)"></PreviewContent>
            </template>
        </ColSplitView>
        <SubLoading v-if="sub_loading"></SubLoading>
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
    }
}
</style>