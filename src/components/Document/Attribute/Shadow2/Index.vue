<script lang="ts" setup>
import SvgIcon from "@/components/common/SvgIcon.vue";
import style_icon from "@/assets/icons/svg/styles.svg";
import add_icon from "@/assets/icons/svg/add.svg";

import { Context } from "@/context";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import TypeHeader from "@/components/Document/Attribute/TypeHeader.vue";
import ShadowMaskView from "./ShadowMaskView.vue";
import ShadowItem from "./ShadowItem.vue";
import { useI18n } from "vue-i18n";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import ShadowStylePanel from "@/components/Document/Attribute/Shadow2/Lib/ShadowStylePanel.vue";
import { ShadowCatch, ShadowsContext, ShadowsContextMgr } from "./ctx";

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
const shadowCtx = ref<ShadowsContext>({
    mixed: false,
    shadows: [],
    mask: undefined,
    maskInfo: undefined
});
const shadowCtxMgr = new ShadowsContextMgr(props.context, shadowCtx.value as ShadowsContext);
const cloverVisible = computed<boolean>(() => !(shadowCtx.value.mask || shadowCtx.value.mixed));
const shadowLibStatus = reactive<ElementStatus>({ id: '#shadow-style-lib-panel', visible: false });
const shadowPanelStatusMgr = new ElementManager(
    props.context,
    shadowLibStatus,
    { whiteList: ['.shadow-style-lib-panel', '.clover', '.desc'] }
);
shadowCtxMgr.catchPanel(shadowPanelStatusMgr);

function showShadowLib(event: MouseEvent) { /*打开填充样式库面板*/
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('clover')) {
            shadowPanelStatusMgr.showBy(e, { once: { offsetLeft: -164, offsetTop: 36 } });
            break;
        }
        if (e.classList.contains('desc')) {
            shadowPanelStatusMgr.showBy(e, { once: { offsetLeft: -4, offsetTop: 36 } });
            break;
        }
        e = e.parentElement;
    }
}

const watchList: any[] = [
    watch(() => props.selectionChange, () => shadowCtxMgr.update()),                  // 监听选区变化
    watch(() => props.trigger, v => v?.includes('style') && shadowCtxMgr.update())    // 监听选区内图层的变化，与选区一样，监听到变化都应该修改核心状态
];

onMounted(shadowCtxMgr.update.bind(shadowCtxMgr));
onUnmounted(() => {
    watchList.forEach(stop => stop());
    shadowPanelStatusMgr.unmounted();
});

</script>
<template>
    <div class="shadows-wrapper">
        <TypeHeader :title="t('attr.shadow')" :active="!!shadowCtx.shadows.length"
            @click.stop="() => shadowCtxMgr.init()">
            <template #tool>
                <div v-if="cloverVisible" class="clover" @click="showShadowLib">
                    <SvgIcon :icon="style_icon" />
                </div>
                <div v-if="!shadowCtx.mask" class="create" @click="() => shadowCtxMgr.create()">
                    <SvgIcon :icon="add_icon" />
                </div>
            </template>
        </TypeHeader>

        <div v-if="shadowCtx.mixed" class="tips-wrapper">{{ t('attr.mixed_lang') }}</div>
        <ShadowMaskView v-else-if="shadowCtx.mask" :context="context" :manager="shadowCtxMgr"
            :shadows="(shadowCtx.shadows as ShadowCatch[])" :info="shadowCtx.maskInfo!"
            @show-style-lib="showShadowLib" />

        <div v-else-if="shadowCtx.shadows.length" class="fills-container">
            <ShadowItem v-for="(shadow, index) in shadowCtx.shadows" :key="index" :context="context"
                :manager="shadowCtxMgr" :data="(shadow as ShadowCatch)" />
        </div>

        <ShadowStylePanel v-if="shadowLibStatus.visible" :context="context" :manager="shadowCtxMgr"
            @close="() => shadowPanelStatusMgr.close()" />

    </div>
</template>
<style scoped lang="scss">
.shadows-wrapper {
    width: 100%;
    height: fit-content;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .clover,
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

    .clover>img {
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