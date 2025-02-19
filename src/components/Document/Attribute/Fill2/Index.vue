<script lang="ts" setup>
import SvgIcon from "@/components/common/SvgIcon.vue";
import style_icon from "@/assets/icons/svg/styles.svg";
import add_icon from "@/assets/icons/svg/add.svg";

import { Context } from "@/context";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { FillCatch, FillsContext, FillsContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import TypeHeader from "@/components/Document/Attribute/TypeHeader.vue";
import FillMaskView from "@/components/Document/Attribute/Fill2/FillMaskView.vue";
import FillItem from "./FillItem.vue";
import { useI18n } from "vue-i18n";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import FillStylePanel from "@/components/Document/Attribute/Fill2/Lib/FillStylePanel.vue";

/**
 * 每个模块的Index.vue应该包含
 *      Header
 *      Mask 或 自定义样式List
 *      样式库
 */
type Props = {
    context: Context;
    selectionChange: number;    // 选区变化
    trigger: any[];             // 选区内图层数据修改
}
const { t } = useI18n();

const props = defineProps<Props>();
const fillCtx = ref<FillsContext>({  // 本组件的核心状态，改状态由vue进行劫持(注：选区和图层属于非vue劫持的状态，每个模块的状态由这两类状态共同组成)
    mixed: false,                        // 选区内是否存在不一样的填充样式

    fills: [],                           // 填充样式，有可能是样式库里拿出来的，也有可能是图层自带的。注：特别注意，这个数据本身属于由vue劫持的状态，
    // 所以它并不是直接从图层上或样式库里取出来的数据，而是由该数据经过vue二次包装后数据

    mask: undefined,                     // 当选区内使用的样式库内的填充样式时，mask为该样式库的id，否则为undefined
    maskInfo: undefined                  // 当选区内使用的样式库内的填充样式时，maskInfo为改样式库的基本信息，包含名称和描述
});
const fillCtxMgr = new FillsContextMgr(props.context, fillCtx.value as FillsContext);                  // 核心状态管理器
const cloverVisible = computed<boolean>(() => !(fillCtx.value.mask || fillCtx.value.mixed));   // 样式库入口四叶草🍀是否可用
const fillLibStatus = reactive<ElementStatus>({ id: '#fill-style-lib-panel', visible: false });  // 样式库面板弹框状态
const fillPanelStatusMgr = new ElementManager(                                                       // 样式库面板弹框状态管理器，组件销毁时要调用其的unmounted事件
    props.context,
    fillLibStatus,
    { whiteList: ['.fill-style-lib-panel', '.fill_clover', '.fill_desc'] }                                   // 弹框可点击区域，区域之外的点击将会关闭弹框
);
fillCtxMgr.catchPanel(fillPanelStatusMgr);                                                           // 将弹框状态管理器加入到核心状态管理器，使得核心状态管理器可以控制弹框

function showFillLib(event: MouseEvent) { /*打开填充样式库面板*/
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('fill_clover')) {
            fillPanelStatusMgr.showBy(e, { once: { offsetLeft: -164, offsetTop: 36 } });
            break;
        }
        if (e.classList.contains('fill_desc')) {
            fillPanelStatusMgr.showBy(e, { once: { offsetLeft: -4, offsetTop: 36 } });
            break;
        }
        e = e.parentElement;
    }
}

const watchList: any[] = [
    watch(() => props.selectionChange, () => fillCtxMgr.update()),                  // 监听选区变化
    watch(() => props.trigger, (v) => {
        if (v?.includes('fillsMask') || v?.includes('fills')) {
            fillCtxMgr.update();
        }
    })    // 监听选区内图层的变化，与选区一样，监听到变化都应该修改核心状态
];

onMounted(fillCtxMgr.update.bind(fillCtxMgr));
onUnmounted(() => {
    watchList.forEach(stop => stop());
    fillPanelStatusMgr.unmounted();
});
</script>
<template>
    <div class="fills-wrapper">
        <TypeHeader :title="t('attr.fill')" :active="!!fillCtx.fills.length" @click.stop="() => fillCtxMgr.init()">
            <template #tool>
                <div v-if="cloverVisible" class="fill_clover" @click="showFillLib">
                    <SvgIcon :icon="style_icon" />
                </div>
                <div v-if="!fillCtx.mask || fillCtx.mixed" class="create" @click="() => fillCtxMgr.create()">
                    <SvgIcon :icon="add_icon" />
                </div>
            </template>
        </TypeHeader>
        <div v-if="fillCtx.mixed" class="tips-wrapper">{{ t('attr.mixed_lang') }}</div>
        <FillMaskView v-else-if="fillCtx.mask" :context="context" :manager="fillCtxMgr"
            :fills="(fillCtx.fills as FillCatch[])" :info="fillCtx.maskInfo!" @show-style-lib="showFillLib" />
        <div v-else-if="fillCtx.fills.length" class="fills-container">
            <FillItem v-for="(fill, index) in fillCtx.fills" :key="index" :context="context" :manager="fillCtxMgr"
                :data="(fill as FillCatch)" />
        </div>
        <FillStylePanel v-if="fillLibStatus.visible" :context="context" :manager="fillCtxMgr"
            @close="() => fillPanelStatusMgr.close()" />
    </div>
</template>
<style scoped lang="scss">
.fills-wrapper {
    width: 100%;
    height: fit-content;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .fill_clover,
    .create {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--default-radius);
        transition: .2s;

        &:hover {
            background-color: #F5F5F5;
        }
    }

    .fill_clover>img {
        width: 12px;
        height: 12px;
    }

    .create>img {
        width: 16px;
        height: 16px;
    }

    .tips-wrapper {
        padding: 12px 0;
        color: #737373;
        text-align: center;
        font-size: var(--font-default-fontsize);
    }

    .fills-container {
        display: flex;
        flex-direction: column;
        gap: 6px;

        width: 100%;
        height: fit-content;
        padding: 6px 0;
    }
}
</style>