<script setup lang="ts">
// import { router } from '@/router';
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import { initpal } from "@/components/Document/initpal";
import { Context } from "@/context";
import {
    CoopRepository,
    Document,
    importRemote,
    IStorage, Matrix,
    Page,
    PageListItem,
    PageView,
    Repository
} from "@kcdesign/data";
// import * as share_api from "@/request/share";
import { ElMessage } from "element-plus";
// import { OssStorage, S3Storage, StorageOptions } from "@/utils/storage";
// import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { insertNetworkInfo, message } from "@/utils/message";
// import * as user_api from "@/request/users";
// import { DocSelectionOpData, DocSelectionOpType } from "@/communication/modules/doc_selection_op";
// import { ResponseStatus } from "@/communication/modules/doc_upload";
import { WorkSpace } from "@/context/workspace";
import { Selection, XY } from "@/context/selection";
// import { NetworkStatus } from "@/communication/modules/network_status";
import PageViewVue from "@/components/Document/Content/PageView.vue";
import { adapt_page2 } from "@/utils/content";
import Select, { SelectItem, SelectSource } from "@/components/common/Select.vue";

const props = defineProps<{ context: Context }>()

// const route = useRoute();
const initialized = ref<boolean>(false);
const { t } = useI18n();
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
const showpagelist = ref<boolean>(false)
const HEAD_HEIGHT = 0;
const HEAD_HEIGHT_CSS = `${HEAD_HEIGHT}px`;

const product_name = t('product.name');
const fileName = ref<string>(product_name);

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


// const showNotification = (type?: number) => {
//     insertNetworkInfo('networkError', false, network_error);
//     showHint.value = true;
//     startCountdown(type);
// }
// const hideNotification = (type?: number) => {
//     showHint.value = false;
//     countdown.value = 10;
//     if (type === 0) {
//         router.push('/m')
//     } else {
//         window.location.reload();
//     }
// }
// const startCountdown = (type?: number) => {
//     const timer = setInterval(() => {
//         if (countdown.value > 1) {
//             countdown.value--;
//         } else {
//             hideNotification(type);
//             clearInterval(timer);
//         }
//     }, 1000);
// }
// const getDocumentAuthority = async () => {
//     try {
//         const data = await share_api.getDocumentAuthorityAPI({ doc_id: route.query.id })
//         if (data.code === 400) {
//             permissionChange.value = PermissionChange.delete
//             showNotification(0)
//         }
//         if (permType.value && data.data.perm_type !== permType.value) {
//             if (data.data.perm_type === 1) {
//                 permissionChange.value = PermissionChange.update
//                 showNotification(data.data.perm_type)
//             } else if (data.data.perm_type === 2) {
//                 permissionChange.value = PermissionChange.update
//                 showNotification(data.data.perm_type)
//             } else if (data.data.perm_type === 3) {
//                 permissionChange.value = PermissionChange.update
//                 showNotification(data.data.perm_type)
//             } else if (data.data.perm_type === 0) {
//                 permissionChange.value = PermissionChange.close
//                 showNotification(data.data.perm_type)
//             }
//         }
//         if (data.data.perm_type === 1) {
//             isRead.value = true;
//             canComment.value = false;
//             isEdit.value = false;
//         } else if (data.data.perm_type === 2) {
//             isRead.value = false
//             canComment.value = true;
//             isEdit.value = false;
//         } else if (data.data.perm_type === 3) {
//             isRead.value = false
//             canComment.value = false
//             isEdit.value = true
//         }
//         permType.value = data.data.perm_type
//         context && context.workspace.setDocumentPerm(data.data.perm_type)
//     } catch (err) {
//         console.log(err);
//     }
// }
// const getUserInfo = async () => {
//     const { data } = await user_api.GetInfo()
//     if (data && context) {
//         context.comment.setUserInfo(data)
//         localStorage.setItem('avatar', data.avatar)
//         localStorage.setItem('nickname', data.nickname)
//         localStorage.setItem('userId', data.id)
//     }
// }

let arr = ref<Array<SelectSource>>([])
type UnwrappedPromise<T> = T extends Promise<infer U> ? U : T
let documentLoader: UnwrappedPromise<ReturnType<typeof importRemote>>['loader'] | undefined = undefined; // eslint-disable-line

// const getDocumentInfo = async () => {
//     try {
//         loading.value = true;
//         noNetwork.value = false;
//         const docInfoPromise = share_api.getDocumentInfoAPI({ doc_id: route.query.id });
//         const docKeyPromise = share_api.getDocumentKeyAPI({ doc_id: route.query.id });
//         const [docInfoRes, docKeyRes] = await Promise.all([docInfoPromise, docKeyPromise]);
//         if (docInfoRes.code !== 0 || docKeyRes.code !== 0) { // 打开文档失败
//             if (docKeyRes.code === 403) {
//                 if (docKeyRes.message === "审核不通过") {
//                     router.push("/m");
//                     ElMessage.error({ duration: 3000, message: t('system.sensitive_reminder3') })
//                     return;
//                 }
//                 if (docKeyRes.message === "无访问权限") {
//                     const query = route.query.page_id ? {
//                         id: route.query.id,
//                         page_id: route.query.page_id.slice(0, 8)
//                     } : { id: route.query.id };
//                     router.replace({
//                         name: "mapply",
//                         query: query,
//                     });
//                     return;
//                 }
//                 router.push("/m");
//                 ElMessage.error({ duration: 3000, message: docKeyRes.message })
//                 return;
//             } else {
//                 let miniprogram: any;

//                 miniprogram = navigator.userAgent.includes('miniProgram')
//                 if (miniprogram) {
//                     (window as any).wx.miniProgram.postMessage({
//                         data: {
//                             file: false,
//                         }
//                     });
//                     (window as any).wx.miniProgram.navigateBack({
//                         delta: 1,
//                     });

//                 } else {
//                     router.push("/m");
//                 }

//                 ElMessage.error({ duration: 3000, message: docInfoRes.message })
//                 return;
//             }
//         }
//         const docInfoData = docInfoRes.data;
//         const docKeyData = docKeyRes.data;
//         const perm = docInfoData.document_permission.perm_type;
//         if (perm === 0) { // 无权限
//             const query = route.query.page_id ? {
//                 id: route.query.id,
//                 page_id: route.query.page_id.slice(0, 8)
//             } : { id: route.query.id };
//             router.push({
//                 name: "mapply",
//                 query: query,
//             });
//             return;
//         }

//         docInfo.value = docInfoData;
//         permType.value = perm;
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
//         const path = docInfo.value.document.path;
//         const versionId = docInfo.value.document.version_id ?? "";
//         const d = await importRemote(storage, path, "", versionId, repo)
//         const document = d.document;
//         documentLoader = d.loader;
//         if (document) {
//             const coopRepo = new CoopRepository(document, repo);
//             const file_name = docInfo.value.document?.name || document.name;
//             fileName.value = file_name;
//             window.document.title = fileName.value;
//             context = new Context(document, coopRepo);
//             matrix.value = context.workspace.matrix;
//             context.workspace.setDocumentPerm(perm);
//             getDocumentAuthority();
//             getUserInfo();
//             context.comment.setDocumentInfo(docInfoData);
//             null_context.value = false;
//             init_watcher();
//             const docId = route.query.id as string;
//             const getToken = () => Promise.resolve(localStorage.getItem("token") || "");
//             if (!await context.communication.docOp.start(getToken, docId, document, context.coopRepo, versionId)) {
//                 router.push("/m");
//                 return;
//             }
//             loading.value = false;
//             if (perm >= 3) await context.communication.docResourceUpload.start(getToken, docId);
//             await context.communication.docCommentOp.start(getToken, docId);
//             await context.communication.docSelectionOp.start(getToken, docId, context);
//             context.communication.docSelectionOp.addOnMessage(teamSelectionModifi);
//             const route_p_id = route.query.page_id ? route.query.page_id as string : context!.data.pagesList[0]?.id;
//             const page: PageListItem | undefined = context!.data.pagesList.filter((item) => item.id.slice(0, 8) === route_p_id.slice(0, 8))[0];
//             switchPage(page?.id || context!.data.pagesList[0]?.id);

//             if (context?.data) {
//                 for (let index = 0; index < context!.data.pagesList.length; index++) {
//                     let a: SelectSource = {
//                         id: index,
//                         data: { value: context!.data.pagesList[index].id, content: context!.data.pagesList[index].name }
//                     }
//                     arr.value.push(a)
//                 }
//             }

//             updateDocumentKeyTimer = setInterval(updateDocumentKey, 1000 * 60 * 30); // 30分钟更新一次文档密钥
//         }
//     } catch (err) {
//         loading.value = false;
//         noNetwork.value = true;
//         console.log(err);
//         throw err;
//     }
// }

// async function updateDocumentKey() {
//     if (!documentLoader) return;
//     const docKeyRes = await share_api.getDocumentKeyAPI({ doc_id: route.query.id });
//     if (docKeyRes.code !== 0) return;
//     const docKeyData = docKeyRes.data;
//     const storageOptions: StorageOptions = {
//         endPoint: docKeyData.endpoint,
//         region: docKeyData.region,
//         accessKey: docKeyData.access_key,
//         secretKey: docKeyData.secret_access_key,
//         sessionToken: docKeyData.session_token,
//         bucketName: docKeyData.bucket_name,
//     }
//     let storage: IStorage;
//     if (docKeyData.provider === "oss") {
//         storage = new OssStorage(storageOptions);
//     } else {
//         storage = new S3Storage(storageOptions);
//     }
//     documentLoader.setStorage(storage);
// }

let updateDocumentKeyTimer: ReturnType<typeof setInterval> | Parameters<typeof clearInterval>[0] = undefined;

// const teamSelectionModifi = (docCommentOpData: DocSelectionOpData) => {
//     const data = docCommentOpData.data
//     if (context && (docCommentOpData.user_id !== context.comment.isUserInfo?.id) && context.comment.isUserInfo?.id) {
//         const addUset = context!.teamwork.getUserSelection
//         if (docCommentOpData.type === DocSelectionOpType.Exit) {
//             const index = addUset.findIndex(obj => obj.user_id === docCommentOpData.user_id);
//             context?.teamwork.userSelectionExit(index)
//         } else if (docCommentOpData.type === DocSelectionOpType.Update) {
//             const index = addUset.findIndex(obj => obj.user_id === docCommentOpData.user_id);
//             context?.teamwork.userSelectionUpdate(data, index)
//         }
//     }
// }

// async function upload(projectId: string) {
//     const getToken = () => Promise.resolve(localStorage.getItem("token") || "");
//     if (!await getToken() || !context || !context.data) return;
//     if (!await context.communication.docUpload.start(getToken, projectId)) {
//         // todo 上传通道开启失败处理
//         console.log("文档上传通道开启失败")
//         return;
//     }
//     let result;
//     try {
//         console.log("开始上传文档")
//         result = await context.communication.docUpload.upload(context.data);
//     } catch (e) {
//         // todo 上传失败处理√
//         message('danger', '文档上传失败');
//         console.log("文档上传失败", e)
//         return;
//     }
//     if (!result || result.status !== ResponseStatus.Success || !result.data?.doc_id || typeof result.data?.doc_id !== "string") {
//         // todo 上传失败处理√
//         message('danger', '文档上传失败');
//         console.log("文档上传失败", result)
//         return;
//     }
//     const doc_id = result!.data.doc_id;
//     console.log("文档上传成功", doc_id)
//     router.replace({
//         path: '/pageviews',
//         query: { id: doc_id },
//     });
//     if (!await context.communication.docOp.start(getToken, doc_id, context!.data, context.coopRepo, result!.data.version_id ?? "")) {
//         console.log("文档操作通道开启失败")
//         // todo 文档操作通道开启失败处理
//     }
//     getDocumentAuthority().then(async () => {
//         if (!context) return;
//         if (permType.value === 3) context.communication.docResourceUpload.start(getToken, doc_id);
//         context.communication.docCommentOp.start(getToken, doc_id);
//         await context.communication.docSelectionOp.start(getToken, doc_id, context);
//         context.communication.docSelectionOp.addOnMessage(teamSelectionModifi);
//         context.workspace.notify(WorkSpace.INIT_DOC_NAME);
//     })
// }


function switchPage(id?: string) {
    if (!id) return
    if (showpagelist.value) showpagelist.value = !showpagelist.value
    if (context) {
        const ctx: Context = context;
        const pagesMgr = ctx.data.pagesMgr;
        const cur_page = context.selection.selectedPage;
        if (cur_page && cur_page.id === id) return;
        pagesMgr.get(id).then((page: Page | undefined) => {
            if (page) {
                // ctx.comment.toggleCommentPage()
                curPage.value = undefined;
                // ctx.comment.commentMount(false)
                const pagedom = ctx.getPageDom(page).dom;
                ctx.selection.selectPage(pagedom);
                curPage.value = pagedom;
            }
        })
    }
}


let timer: any = null;

// function init_doc() {
//     if (route.query.id) { // 从远端读取文件
//         getDocumentInfo();
//         timer = setInterval(() => {
//             getDocumentAuthority();
//         }, 30000);
//     } else if ((window as any).sketchDocument) {
//         loading.value = true;
//         context = new Context((window as any).sketchDocument as Document, ((window as any).skrepo as CoopRepository));
//         matrix.value = context.workspace.matrix;
//         null_context.value = false;
//         getUserInfo();
//         init_watcher();
//         const project_id = localStorage.getItem('project_id') || '';
//         upload(project_id);
//         localStorage.setItem('project_id', '');
//         switchPage(((window as any).sketchDocument as Document).pagesList[0]?.id);
//     } else {
//         router.push('/m');
//     }
// }

function selectionWatcher(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        if (context) {
            curPage.value = context!.selection.selectedPage;
        }
    }
}

function workspace_watcher(type?: number) {
    if (type === WorkSpace.MATRIX_TRANSFORMATION && context) {
        matrix.value.reset(context.workspace.matrix);
    }
}

function init_watcher() {
    if (!context) {
        return;
    }
    context.selection.watch(selectionWatcher);
    context.workspace.watch(workspace_watcher);
}

// function onBeforeUnload(event: any) {
//     if (!context?.communication.docOp.hasPendingSyncCmd()) return; // 不需要弹框
//     event.preventDefault();
//     return event.returnValue = t('message.leave');
// }

// function onUnload(event: any) {
//     onUnloadForCommunication();
// }

// function onUnloadForCommunication() {
//     try {
//         context?.communication.docOp.close();
//         context?.communication.docResourceUpload.close();
//         context?.communication.docCommentOp.close();
//         context?.communication.docSelectionOp.close();
//     } catch (err) {
//     }
// }

const token = localStorage.getItem("token") || "";
// const networkStatus = NetworkStatus.Make(token);
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

const matrix = ref<Matrix>(new Matrix() as any);
const matrixMap = new Map<string, { m: Matrix, x: number, y: number }>();

function initMatrix(cur: PageView) {
    if (!context) {
        return;
    }
    let info = matrixMap.get(cur.id);
    if (!info) {
        const __m = adapt_page2(
            context,
            document.documentElement.clientWidth,
            document.documentElement.clientHeight - HEAD_HEIGHT
        );

        info = { m: new Matrix(__m), x: cur.frame.x, y: cur.frame.y };

        matrixMap.set(cur.id, info);
    }

    matrix.value.reset(info.m.toArray());
    context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}

const stop2 = watch(() => curPage.value, (page, old) => {
    if (page) {
        if (old) {
            let info = matrixMap.get(old.id);
            info!.m.reset(matrix.value.toArray());
        }

        initMatrix(page);
    }
})

watch(fileName, (NewNanme) => {
    let miniprogram: any;
    if (NewNanme) {
        miniprogram = navigator.userAgent.includes('miniProgram')
        if (miniprogram) {
            (window as any).wx.miniProgram.postMessage({
                data: {
                    name: NewNanme,
                    id: docInfo.value.document.id
                }
            });
        }
    }
})


onMounted(() => {

    // window.addEventListener('beforeunload', onBeforeUnload);
    // window.addEventListener('unload', onUnload);
    // init_doc();
    // initpal().then(() => {
    //     initialized.value = true;
    // }).catch((e) => {
    //     console.log(e)
    // })
})
onUnmounted(() => {
    closeNetMsg();
    // onUnloadForCommunication();
    context?.selection.unwatch(selectionWatcher);
    context?.workspace.unwatch(workspace_watcher);
    clearInterval(timer);
    localStorage.removeItem('docId');
    // window.removeEventListener('beforeunload', onBeforeUnload);
    // window.removeEventListener('unload', onUnload);
    clearInterval(loopNet);
    clearInterval(netErr);
    // networkStatus.close();
    stop();
    stop2();
    clearInterval(updateDocumentKeyTimer); // 清除更新文档密钥定时器
})

const ORIGIN = { x: 0, y: HEAD_HEIGHT };
let downTouchesLength = 1;

let preGap = 0;
let preAnchor = { x: 0, y: 0 };
let preScale = 1;

const __box = (event: TouchEvent) => {
    const touches = event.touches;
    const len = touches.length;

    const xys: XY[] = [];

    for (let i = 0; i < len; i++) {
        const t = touches.item(i);

        if (!t) {
            continue;
        }

        xys.push({ x: t.clientX - ORIGIN.x, y: t.clientY - ORIGIN.y });
    }

    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;

    xys.forEach(i => {
        if (i.x < left) {
            left = i.x;
        }
        if (i.x > right) {
            right = i.x;
        }

        if (i.y < top) {
            top = i.y;
        }
        if (i.y > bottom) {
            bottom = i.y;
        }
    });

    return { left, top, right, bottom };
}
const __gap = (event: TouchEvent) => {
    const { left, top, right, bottom } = __box(event);

    return Math.hypot(right - left, bottom - top);
}

const __anchor = (event: TouchEvent) => {
    let a = event.touches[0]!;

    return { x: a.clientX - ORIGIN.x, y: a.clientY - ORIGIN.y };
}

function start(e: TouchEvent) {
    e.stopPropagation();
    // e.preventDefault();
    downTouchesLength = e.touches.length;

    if (downTouchesLength > 1) { // 只有多根手指才可能触发缩放
        preGap = __gap(e);
        preScale = matrix.value.m00;
    }

    preAnchor = __anchor(e);
}

const MAX = 25600;
const MIN = 2;

function move(e: TouchEvent) {
    e.stopPropagation();
    // e.preventDefault();

    if (e.touches[0].clientX < 20) {
        return
    }

    const anchor = __anchor(e);

    const dx = anchor.x - preAnchor.x;
    const dy = anchor.y - preAnchor.y;

    matrix.value.trans(dx, dy);

    preAnchor = { ...anchor };

    if (downTouchesLength < 2) {
        return;
    }

    const currentGap = __gap(e);

    if (!(currentGap > 0)) {
        return;
    }

    let scale = currentGap / preGap;

    const _scale = Number((matrix.value.toArray()[0] * 100).toFixed(0)) * scale;
    if (_scale <= MIN) {
        scale = 1;
    } else if (_scale >= MAX) {
        scale = MAX / scale;
    }

    const offsetX = preAnchor.x - ORIGIN.x;
    const offsetY = preAnchor.y - ORIGIN.y;

    matrix.value.trans(-offsetX, -offsetY);
    matrix.value.scale(scale);
    matrix.value.trans(offsetX, offsetY);

    preGap = currentGap;
}

function end(e: TouchEvent) {
    // showpagelist.value = false
    if (e.touches.length) {
        preAnchor = __anchor(e);
    }
}

const backlink = computed(() => {
    return window.history.state.back ? true : false
})

const iconPosition = ref({
    left: window.innerWidth - 68,
    top: window.innerHeight - 68
})

function moveIcon(e: TouchEvent) {
    e.stopPropagation()
    e.preventDefault()
    iconPosition.value.left = (e.touches[0].clientX - 24) < 20 ? 20 : (e.touches[0].clientX - 24) > (e.view?.window.innerWidth! - 68) ? (e.view?.window.innerWidth! - 68) : (e.touches[0].clientX - 24)
    iconPosition.value.top = (e.touches[0].clientY - 24) < 20 ? 20 : (e.touches[0].clientY - 24) > (e.view?.window.innerHeight! - 68) ? (e.view?.window.innerHeight! - 68) : (e.touches[0].clientY - 24)
}

onMounted(() => {
    if (localStorage.getItem('s-bar-pst')) {
        const { L, T } = JSON.parse(localStorage.getItem('s-bar-pst') ?? '');
        iconPosition.value.left = L
        iconPosition.value.top = T
    }
})

onUnmounted(() => {
    let pst = { L: iconPosition.value.left, T: iconPosition.value.top }
    localStorage.setItem('s-bar-pst', JSON.stringify(pst))
})

function scrollIntoView() {
    const item = document.querySelectorAll('.list-item');
    const el = document.querySelector('.pagelist');
    const idx = arr.value.findIndex(item => item.data.value === curPage.value?.id)
    if (item) {
        el?.scrollTo({ top: idx * 44 })
    }
}

const showEl = () => {
    showpagelist.value = !showpagelist.value
    if (showpagelist.value) {
        nextTick(() => {
            scrollIntoView()
        })
    }
}

</script>

<template>
    <div class="container">
        <div class="status-bar" @touchmove.stop="moveIcon"
             :style="{ left: iconPosition.left + 'px', top: iconPosition.top + 'px' }">
            <div class="list" @click="showEl">
                <svg-icon icon-class="menu-black"></svg-icon>
            </div>
        </div>
        <transition name="fade">
            <div v-if="showpagelist" class="pagelist" @touchstart.stop @touchmove.stop @touchend.stop>
                <div class="list-item" v-for="page in arr" :key="page.id"
                     @click.stop="switchPage(page.data.value as string)">
                    <div class="choose" :style="{ visibility: curPage?.id === page.data.value ? 'visible' : 'hidden' }">
                    </div>
                    <div class="pagename">{{ page.data.content }}</div>
                </div>
            </div>
        </transition>
        <div class="pageview" @touchstart="start" @touchmove="move" @touchend="end" @click="showpagelist =false">
            <PageViewVue v-if="!null_context && curPage" :context="context!" :data="(curPage as PageView)"
                         :matrix="(matrix as Matrix)" @closeLoading="closeLoading" no-cutout/>
        </div>
    </div>
</template>


<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
    transition: all 0.25s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    transform: translateY(100%);
}

.container {
    width: 100%;
    height: 100%;
}

.status-bar {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #fff;
    box-sizing: border-box;
    box-shadow: 0 0 5px silver;
    z-index: 999;

    .back {
        width: 24px;
        height: 24px;
        position: absolute;
        right: 8px;

        svg {
            width: 100%;
            height: 100%;

        }
    }

    .list {
        width: 24px;
        height: 24px;

        svg {
            width: 100%;
            height: 100%;

        }
    }

}

.pagelist {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 50%;
    background-color: #fff;
    border-radius: 12px;
    overflow-y: scroll;
    box-sizing: border-box;
    z-index: 1;

    .list-item {
        display: flex;
        align-items: center;
        height: 44px;
        font-size: 14px;
        justify-content: center;

        .choose {
            box-sizing: border-box;
            width: 10px;
            height: 6px;
            margin-right: 10px;
            margin-left: 2px;
            border-width: 0 0 2px 2px;
            border-style: solid;
            border-color: rgb(0, 0, 0, .75);
            transform: rotate(-45deg) translateY(-30%);
        }

        .pagename {
            flex: 0.8;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}

.pageview {
    width: 100%;
    height: calc(100% - v-bind('HEAD_HEIGHT_CSS'));
    background-color: #EFEFEF;

    overflow: hidden;

    position: relative;
}

.tips {
    position: absolute;
    width: 72px;
    height: 30px;
    top: 50px;
    margin: 0 auto;
}
</style>
