<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import { initpal } from '@/components/common/initpal';
import { Context } from "@/context";
import {
    Matrix,
    PageView,
} from "@kcdesign/data";
import { useI18n } from "vue-i18n";
import { insertNetworkInfo } from "@/utils/message";
import { WorkSpace } from "@/context/workspace";
import { Selection, XY } from "@/context/selection";
import PageViewVue from "@/components/Document/Content/PageView.vue";
import { adapt_page2 } from "@/utils/content";
import { SelectSource } from "@/components/common/Select.vue";
import { IContext } from "@/openapi";

const props = defineProps<{ context: IContext }>()

const initialized = ref<boolean>(false);
const { t } = useI18n();
const docInfo: any = ref({});
const curPage = shallowRef<PageView | undefined>(undefined);
const showpagelist = ref<boolean>(false)
const HEAD_HEIGHT = 0;
const HEAD_HEIGHT_CSS = `${HEAD_HEIGHT}px`;

const product_name = t('product.name');
const fileName = ref<string>(product_name);

const emit = defineEmits<{
    (e: 'closeLoading'): void;
}>();

const autosave = t('message.autosave');
const link_success = t('message.link_success');
const network_anomaly = t('message.network_anomaly');
const network_error = t('message.network_error');

const pagelists = ref<Array<SelectSource>>([])

let updateDocumentKeyTimer: ReturnType<typeof setInterval> | Parameters<typeof clearInterval>[0] = undefined;

function switchPage(id?: string) {
    if (!id) return
    if (showpagelist.value) showpagelist.value = !showpagelist.value

    const ctx: Context = props.context as Context;
    ctx.selection.selectPage(id);
}

let timer: any = null;
function selectionWatcher(t: number | string) {
    const ctx: Context = props.context as Context;
    if (t === Selection.CHANGE_PAGE) {
        curPage.value = ctx.selection.selectedPage;
    }
}

function workspace_watcher(type?: number | string) {
    const ctx: Context = props.context as Context;
    if (type === WorkSpace.MATRIX_TRANSFORMATION) {
        matrix.value.reset(ctx.workspace.matrix);
    }
}

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
    const ctx: Context = props.context as Context;
    let info = matrixMap.get(cur.id);
    if (!info) {
        const __m = adapt_page2(
            ctx,
            document.documentElement.clientWidth,
            document.documentElement.clientHeight - HEAD_HEIGHT
        );

        info = { m: new Matrix(__m), x: cur.frame.x, y: cur.frame.y };

        matrixMap.set(cur.id, info);
    }

    matrix.value.reset(info.m.toArray());
    ctx.workspace.matrix.reset(matrix.value.toArray())
    ctx.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
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

    initpal().then(() => {
        initialized.value = true;
    }).catch((e) => {
        console.log(e)
    })

    const ctx: Context = props.context as Context;
    for (let index = 0; index < ctx.data.pagesList.length; index++) {
        let a: SelectSource = {
            id: index,
            data: { value: ctx.data.pagesList[index].id, content: ctx.data.pagesList[index].name }
        }
        pagelists.value.push(a)
    }

    ctx.selection.watch(selectionWatcher);
    ctx.workspace.watch(workspace_watcher);
})
onUnmounted(() => {
    const ctx: Context = props.context as Context;
    closeNetMsg();
    ctx.selection.unwatch(selectionWatcher);
    ctx.workspace.unwatch(workspace_watcher);
    clearInterval(timer);
    localStorage.removeItem('docId');
    clearInterval(loopNet);
    clearInterval(netErr);
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

// const backlink = computed(() => {
//     return window.history.state.back ? true : false
// })

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
    const idx = pagelists.value.findIndex(item => item.data.value === curPage.value?.id)
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

const pageParams = {
    get data() { return curPage.value! },
    get matrix() { return matrix.value as Matrix },
    closeLoading,
    noCutout: true,
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
                <div class="list-item" v-for="page in pagelists" :key="page.id"
                    @click.stop="switchPage(page.data.value as string)">
                    <div class="choose" :style="{ visibility: curPage?.id === page.data.value ? 'visible' : 'hidden' }">
                    </div>
                    <div class="pagename">{{ page.data.content }}</div>
                </div>
            </div>
        </transition>
        <div class="pageview" @touchstart="start" @touchmove="move" @touchend="end" @click="showpagelist = false">
            <PageViewVue v-if="initialized && curPage" :context="context as Context" :params="pageParams" />
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
