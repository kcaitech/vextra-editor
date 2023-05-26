<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, computed, ref, watchEffect } from 'vue';
import ContentView from "./ContentView.vue";
import { Context } from '@/context';
import Navigation from './Navigation/index.vue';
import { Page } from '@kcdesign/data';
import { Selection } from '@/context/selection';
import Attribute from './Attribute/RightTabs.vue';
import Toolbar from './Toolbar/index.vue'
import ColSplitView from '@/components/common/ColSplitView.vue';
import { SCREEN_SIZE } from '@/utils/setting';
import { WorkSpace } from '@/context/workspace';
import ApplyFor from './Toolbar/Share/ApplyFor.vue';
import { Document } from '@kcdesign/data';
import { Repository } from '@kcdesign/data';
import * as share_api from '@/apis/share'
import { useRoute } from 'vue-router';
import { router } from '@/router';
import { useI18n } from 'vue-i18n';
import { importDocument } from "@kcdesign/data";
import { ElMessage } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'

const { t } = useI18n();

const curPage = shallowRef<Page | undefined>(undefined);
const context = shallowRef<Context>(new Context(((window as any).sketchDocument as Document), ((window as any).skrepo as Repository)));
(window as any).__context = context.value;
const workspace = computed<WorkSpace>(() => context.value.workspace);
const middleWidth = ref<number>(0.8)
const middleMinWidth = ref<number>(0.3)
const route = useRoute()
const Right = ref({
    rightMin: 250,
    rightMinWidth: 0.1,
    rightWidth: 0.1
})

const Left = ref({
    leftMin: 250,
    leftWidth: 0.1,
    leftMinWidth: 0.1
})

const showRight = ref<boolean>(true);
const showLeft = ref<boolean>(true);
const showTop = ref<boolean>(true);
const showBottom = ref<boolean>(true);
const permType = ref<number>()
const docInfo: any = ref({})
let docID = ''
const showHint = ref(false)
const countdown = ref(10)
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
const leftTriggleVisible = ref<boolean>(false);
const rightTriggleVisible = ref<boolean>(false);
let timerForLeft: any;
let timeForRight: any;
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
    const ctx: Context = context.value;
    const pagesMgr = ctx.data.pagesMgr;
    pagesMgr.get(id).then((page: Page | undefined) => {
        if (page) {
            ctx.selection.selectPage(page);
            curPage.value = page;
        }
    })
}
function selectionWatcher(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        const ctx: Context = context.value as Context;
        curPage.value = ctx.selection.selectedPage;
    }
}
function keyboardEventHandler(evevt: KeyboardEvent) {
    const { target, code, ctrlKey, metaKey, shiftKey } = evevt;
    if (target instanceof HTMLInputElement) return; // 在输入框中输入时避免触发编辑器的键盘事件

    workspace.value.keyboardHandle(evevt); // 编辑器相关的键盘事件

    if (code === 'Backslash') {
        if (ctrlKey || metaKey) {
            shiftKey ? keyToggleTB() : keyToggleLR()
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

//获取文档信息
const getDocumentInfo = async () => {
    try {
        const dataInfo = await share_api.getDocumentInfoAPI({ doc_id: route.query.id })
        docInfo.value = dataInfo.data
        permType.value = dataInfo.data.document_permission.perm_type
        const { data } = await share_api.getDocumentKeyAPI({ doc_id: route.query.id })
        // documentKey.value = data
        //获取文档类型是否为私有文档且有无权限
        if (!docInfo.value) {
            //无效链接
            ElMessage({
                message: `${t('apply.link_not')}`
            })
            router.push('/')
        }
        if (docInfo.value.document_permission.perm_type === 0) {
            router.push({
                name: 'apply',
                query: {
                    id: route.query.id
                }
            })
        }
        await importDocument({
            endPoint: "http://storage.protodesign.cn",
            // endPoint: "http://192.168.0.18:9000",
            region: "zhuhai-1",
            accessKey: data.access_key,
            secretKey: data.secret_access_key,
            sessionToken: data.session_token,
            bucketName: "document"
        }, docInfo.value.document.path, "", "").then((document) => {
            if (document) {
                const repo = new Repository();
                window.document.title = document.name;
                context.value = new Context((document as Document), (repo as Repository));
                context.value.watch(selectionWatcher);
                switchPage(context.value.data.pagesList[0]?.id);
            }
        })

        if (localStorage.getItem(SCREEN_SIZE.KEY) === SCREEN_SIZE.FULL) {
            document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
        }
    } catch (err) {
        console.log(err);
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
        if(data.data.perm_type !== permType.value) {
            if(data.data.perm_type === 1) {
                permissionChange.value = PermissionChange.update
                showNotification(data.data.perm_type)
            }else if(data.data.perm_type === 3) {
                permissionChange.value = PermissionChange.update
                showNotification(data.data.perm_type)
            }else if(data.data.perm_type === 0) {
                permissionChange.value = PermissionChange.close
                showNotification(data.data.perm_type)
            }
        }
        if(data.code === 400 && (data as any).message === '文档不存在') {
            permissionChange.value = PermissionChange.delete
            showNotification(0)
        }
        permType.value = data.data.perm_type
       
    } catch (err) {
        console.log(err);
    }
}

const permissionChange = ref(-1)
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
    if(type === 0) {
        router.push('/')
    }else {
        router.go(0)
    }
}
const showNotification = (type?:number) => {
    showHint.value = true;
    startCountdown(type);
}



watchEffect(() => {
if(route.query.id) {
    const id = (route.query.id as string)
    context.value.upload(id)
}else {
    context.value.upload()
}
})

let uploadTimer: any = null
uploadTimer = setInterval(() => {
    docID = localStorage.getItem('docId') || ''
    if (docID && permType.value !== 1) {
        context.value.upload(docID)
    }
}, 60000)

let timer: any = null
onMounted(() => {
    if (context.value) {
        context.value.selection.watch(selectionWatcher);
    }
    if ((window as any).sketchDocument) {
        switchPage(((window as any).sketchDocument as Document).pagesList[0]?.id);
        if (localStorage.getItem(SCREEN_SIZE.KEY) === SCREEN_SIZE.FULL) {
            document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
        }
        document.addEventListener('keydown', keyboardEventHandler);
        return
    }

    if (!(window as any).sketchDocument && !route.query.id) {
        router.push('/');
        return;
    }

    if (route.query.id) {
        getDocumentInfo()        
        document.addEventListener('keydown', keyboardEventHandler);
        timer = setInterval(() => {
            getDocumentAuthority()
        }, 30000)
        return
    }
})
onUnmounted(() => {
    window.document.title = t('product.name');
    (window as any).sketchDocument = undefined;
    (window as any).skrepo = undefined;
    context.value.selection.unwatch(selectionWatcher);
    context.value.unwatch(selectionWatcher);
    document.removeEventListener('keydown', keyboardEventHandler);
    clearInterval(timer);
    clearInterval(uploadTimer);
    localStorage.removeItem('docId')
    showHint.value = false;
    countdown.value = 10;
})

</script>

<template>
    <div id="top" @dblclick="screenSetting" v-if="showTop">
        <Toolbar :context="context" />
    </div>
    <div id="visit">
        <ApplyFor></ApplyFor>
    </div>
    <ColSplitView ref="colSplitView" id="center"
        :left="{ width: Left.leftWidth, minWidth: Left.leftMinWidth, maxWidth: 0.5 }"
        :middle="{ width: middleWidth, minWidth: middleMinWidth, maxWidth: middleWidth }"
        :right="{ width: Right.rightWidth, minWidth: Right.rightMinWidth, maxWidth: 0.5 }"
        :right-min-width-in-px="Right.rightMin" :left-min-width-in-px="Left.leftMin">
        <template #slot1>
            <Navigation v-if="curPage !== undefined" id="navigation" :context="context" @switchpage="switchPage"
                @mouseenter="() => { mouseenter('left') }" @mouseleave="() => { mouseleave('left') }"
                :page="(curPage as Page)">
            </Navigation>
            <div class="showHiddenL" @click="showHiddenLeft" v-if="!showLeft || leftTriggleVisible"
                :style="{ opacity: showLeft ? 1 : 0.6 }">
                <svg-icon v-if="showLeft" class="svg" icon-class="left"></svg-icon>
                <svg-icon v-else class="svg" icon-class="right"></svg-icon>
            </div>
        </template>
        <template #slot2>
            <ContentView v-if="curPage !== undefined" id="content" :context="context" :page="(curPage as Page)">
            </ContentView>
        </template>
        <template #slot3>
            <Attribute id="attributes" :context="context" @mouseenter="(e: Event) => { mouseenter('right') }"
                @mouseleave="() => { mouseleave('right') }"></Attribute>
            <div class="showHiddenR" @click="showHiddenRight" v-if="!showRight || rightTriggleVisible"
                :style="{ opacity: showRight ? 1 : 0.6 }">
                <svg-icon v-if="showRight" class="svg" icon-class="right"></svg-icon>
                <svg-icon v-else class="svg" icon-class="left"></svg-icon>
            </div>
        </template>
    </ColSplitView>
    <div v-if="showHint" class="notification">
        <el-icon :size="13"><Warning /></el-icon>
        <span class="text" v-if="permissionChange === PermissionChange.update">{{ t('home.prompt') }}</span>
        <span class="text" v-if="permissionChange === PermissionChange.close">{{ t('home.visit') }}</span>
        <span class="text" v-if="permissionChange === PermissionChange.delete">{{ t('home.delete_file') }}</span>
        <span style="color: #0d99ff;" v-if="countdown > 0">{{ countdown }}</span>
    </div>
    <!-- <div id="bottom" v-if="showBottom"></div> -->
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
    z-index: 99;
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
        z-index: 2;
    }

    #content {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    #attributes {
        height: 100%;
        background-color: var(--right-attr-bg-color);
        z-index: 2;
    }

    .showHiddenR {
        position: absolute;
        left: -12px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
        cursor: pointer;
        height: 60px;
        background-color: var(--theme-color-anti);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px 0px 0px 4px;
        box-shadow: -4px 0px 8px rgba($color: #000000, $alpha: 0.05);

        >.svg {
            width: 12px;
            height: 12px;
        }
    }

    .showHiddenL {
        position: absolute;
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
        cursor: pointer;
        height: 60px;
        background-color: var(--theme-color-anti);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0 4px 4px 0;
        box-shadow: 4px 0px 4px rgba($color: #000000, $alpha: 0.05);

        >.svg {
            width: 12px;
            height: 12px;
        }
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

// #bottom {
//     transition: 0.18s;
//     flex-flow: row nowrap;
//     width: 100%;
//     height: 30px;
//     min-height: 30px;
//     align-self: flex-end;
//     background-color: var(--theme-color);
//     z-index: 99;
// }
</style>
