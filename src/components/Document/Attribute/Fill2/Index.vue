<script lang="ts" setup>
import SvgIcon from "@/components/common/SvgIcon.vue";
import style_icon from "@/assets/icons/svg/styles.svg";
import add_icon from "@/assets/icons/svg/add.svg";
import { Context } from "@/context";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { FillCatch, FillContext, FillContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import TypeHeader from "@/components/Document/Attribute/TypeHeader.vue";
import FillMaskView from "@/components/Document/Attribute/Fill2/FillMaskView.vue";
import FillItem from "./FillItem.vue";
import { useI18n } from "vue-i18n";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import FillStylePanel from "@/components/Document/Attribute/Fill2/Lib/FillStylePanel.vue";

type Props = {
    context: Context;
    selectionChange: number;
    trigger: any[];
}
const {t} = useI18n();

const props = defineProps<Props>();
const fillCtx = ref<FillContext>({
    mixed: false,
    fills: [],
    mask: undefined,
    maskInfo: undefined
});
const fillCtxMgr = new FillContextMgr(props.context, fillCtx.value as FillContext);
const cloverVisible = computed<boolean>(() => !(fillCtx.value.mask || fillCtx.value.mixed));
const fillLibStatus = reactive<ElementStatus>({id: '#fill-style-lib-panel', visible: false});
const fillPanelStatusMgr = new ElementManager(
    props.context,
    fillLibStatus,
    {whiteList: ['.fill-style-lib-panel', '.clover', '.desc']}
);
fillCtxMgr.catchPanel(fillPanelStatusMgr);
function showFillLib(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('clover')) {
            e && fillPanelStatusMgr.showBy(e, {once: {offsetLeft: -164, offsetTop: 36}});
            break;
        }
        if (e.classList.contains('desc')) {
            e && fillPanelStatusMgr.showBy(e, {once: {offsetLeft: -4, offsetTop: 36}});
            break;
        }
        e = e.parentElement;
    }
}

const watchList: any[] = [
    watch(() => props.selectionChange, () => fillCtxMgr.update()),
    watch(() => props.trigger, v => v?.includes('style') && fillCtxMgr.update())
];

onMounted(fillCtxMgr.update.bind(fillCtxMgr));
onUnmounted(() => {
    watchList.forEach(stop => stop());
    fillPanelStatusMgr.unmounted();
});
</script>
<template>
    <div class="fills-wrapper">
        <TypeHeader :title="t('attr.fill')" :active="!!fillCtx.fills.length"
                    @click.stop="() => fillCtxMgr.init()">
            <template #tool>
                <div v-if="cloverVisible" class="clover" @click="showFillLib">
                    <SvgIcon :icon="style_icon"/>
                </div>
                <div v-if="!fillCtx.mask" class="create" @click="() => fillCtxMgr.create()">
                    <SvgIcon :icon="add_icon"/>
                </div>
            </template>
        </TypeHeader>
        <div v-if="fillCtx.mixed" class="tips-wrapper">{{ t('attr.mixed_lang') }}</div>
        <FillMaskView v-else-if="fillCtx.mask" :context="context" :manager="fillCtxMgr"
                      :fills="fillCtx.fills as FillCatch[]" :info="fillCtx.maskInfo!"
                      @show-style-lib="showFillLib"/>
        <div v-else class="fills-container">
            <FillItem v-for="(fill, index) in fillCtx.fills" :key="index"
                      :context="context" :manager="fillCtxMgr" :data="fill as FillCatch"/>
        </div>
        <FillStylePanel v-if="fillLibStatus.visible" :context="context" :manager="fillCtxMgr"
                        @close="()=> fillPanelStatusMgr.close()"/>
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

    .clover, .create {
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

    .clover > img {
        width: 12px;
        height: 12px;
    }

    .create > img {
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