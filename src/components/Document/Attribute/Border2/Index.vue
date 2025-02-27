<script lang="ts" setup>
import SvgIcon from "@/components/common/SvgIcon.vue";
import style_icon from "@/assets/icons/svg/styles.svg";
import add_icon from "@/assets/icons/svg/add.svg";
import delete_icon from '@/assets/icons/svg/delete.svg';

import { Context } from "@/context";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { FillCatch } from "@/components/Document/Attribute/Fill2/ctx";
import TypeHeader from "@/components/Document/Attribute/TypeHeader.vue";
import PaintMaskView from "./PaintMaskView.vue";
import PaintItem from "./PaintItem.vue";
import { useI18n } from "vue-i18n";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import FillStylePanel from "./Lib/FillStylePanel.vue";
import { BorderFillsContext, StrokeFillContextMgr } from "./ctx";
import StrokeView from "./Stroke/StrokeView.vue";
import StrokeMaskView from "./Stroke/StrokeMaskView.vue";
import StrokeStylePanel from "./Lib/StrokeStylePanel.vue";

const { t } = useI18n();

const props = defineProps<{
    context: Context;
    selectionChange: number;
    trigger: any[];
}>();
const fillCtx = ref<BorderFillsContext>({
    mixed: false,
    listStatus: false,
    fills: [],
    strokeInfo: undefined,
    strokeMask: undefined,
    strokeMaskInfo: undefined,
    mask: undefined,
    maskInfo: undefined
});
const fillCtxMgr = new StrokeFillContextMgr(props.context, fillCtx.value as BorderFillsContext);
const cloverVisible = computed<boolean>(() => !(fillCtx.value.mask || fillCtx.value.mixed));

const fillLibStatus = reactive<ElementStatus>({ id: '#border_fill-style-lib-panel', visible: false });
const fillPanelStatusMgr = new ElementManager(
    props.context,
    fillLibStatus,
    { whiteList: ['.border_fill-style-lib-panel', '.border_clover', '.border_desc'] }
);
fillCtxMgr.catchPanel(fillPanelStatusMgr);

const strokeLibStatus = reactive<ElementStatus>({ id: '#stroke-style-lib-panel', visible: false });
const strokePanelStatusMgr = new ElementManager(
    props.context,
    strokeLibStatus,
    { whiteList: ['.stroke-style-lib-panel', '.border-style', '.border-left'] }
);
fillCtxMgr.catchPanel(strokePanelStatusMgr);

function showFillLib(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('header-container')) {
            fillPanelStatusMgr.showBy(e, { once: { offsetLeft: -4, offsetTop: 36 } });
            break;
        }
        if (e.classList.contains('mask-port-wrapper')) {
            fillPanelStatusMgr.showBy(e, { once: { offsetLeft: -4, offsetTop: 36 } });
            break;
        }
        e = e.parentElement;
    }
}

const showBorderPanel = (event: MouseEvent) => {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('header-container')) {
            strokePanelStatusMgr.showBy(e, { once: { offsetLeft: -4, offsetTop: 36 } });
            break;
        }
        if (e.classList.contains('mask-port-wrapper')) {
            strokePanelStatusMgr.showBy(e, { once: { offsetLeft: -4, offsetTop: 36 } });
            break;
        }
        e = e.parentElement;
    }
}

const watchList: any[] = [
    watch(() => props.selectionChange, () => fillCtxMgr.update()),
    watch(() => props.trigger, (v) => {
        if (v?.includes('bordersMask') || v?.includes('fillsMask') || v?.includes('borderfill') || v?.includes('paints') || v?.includes('borders') || v?.includes('variables')) {
            fillCtxMgr.update();
        }
    })
];

onMounted(fillCtxMgr.update.bind(fillCtxMgr));
onUnmounted(() => {
    watchList.forEach(stop => stop());
    fillPanelStatusMgr.unmounted();
    strokePanelStatusMgr.unmounted();
});
</script>
<template>
    <div class="borders-wrapper">
        <TypeHeader :title="t('attr.stroke')" @click.stop="() => fillCtxMgr.init()" :active="!!fillCtx.fills.length">
            <template #tool>
                <div v-if="!fillCtx.strokeMask" :class="{ 'active': strokeLibStatus.visible }" class="border-style"
                    @click="showBorderPanel">
                    <SvgIcon :icon="style_icon" />
                </div>
                <div v-if="fillCtx.fills.length || fillCtx.mixed" class="add"
                    @click.stop="() => fillCtxMgr.removeAll()">
                    <SvgIcon :icon="delete_icon" />
                </div>
                <div v-else class="add" @click.stop="() => fillCtxMgr.create()">
                    <SvgIcon :icon="add_icon" />
                </div>
            </template>
        </TypeHeader>
        <StrokeView v-if="!fillCtx.strokeMask" :context="context" :manager="fillCtxMgr" :trigger="trigger" />
        <StrokeMaskView v-else :class="{ 'maskactive': strokeLibStatus.visible }" :context="context"
            :manager="fillCtxMgr" :trigger="trigger" @showBorderPanel="showBorderPanel">
        </StrokeMaskView>
        <StrokeStylePanel v-if="strokeLibStatus.visible" :context="context" :manager="fillCtxMgr"
            @close="() => strokePanelStatusMgr.close()" :title="t('stylelib.borders')" />
        <!---------------------------------------------------------------------------------->
        <TypeHeader v-if="fillCtx.fills.length || fillCtx.mixed" :title="t('attr.stroke_color')"
            :active="!!fillCtx.fills.length">
            <template #tool>
                <div v-if="cloverVisible" :class="{ 'active': fillLibStatus.visible }" class="border_clover"
                    @click="showFillLib">
                    <SvgIcon :icon="style_icon" />
                </div>
                <div v-if="!fillCtx.mask || fillCtx.mixed" class="create" @click="() => fillCtxMgr.create()">
                    <SvgIcon :icon="add_icon" />
                </div>
            </template>
        </TypeHeader>
        <div v-if="fillCtx.mixed" class="tips-wrapper">{{ t('attr.mixed_lang') }}</div>
        <PaintMaskView v-else-if="fillCtx.mask" :class="{ 'maskactive': fillLibStatus.visible }" :context="context"
            :manager="fillCtxMgr" :fills="(fillCtx.fills as FillCatch[])" :info="fillCtx.maskInfo!"
            @show-style-lib="showFillLib" />
        <div v-else-if="fillCtx.fills.length" class="fills-container">
            <PaintItem v-for="(fill, index) in fillCtx.fills" :key="index" :context="context" :manager="fillCtxMgr"
                :data="(fill as FillCatch)" />
        </div>
        <FillStylePanel v-if="fillLibStatus.visible" :context="context" :manager="fillCtxMgr"
            :title="t('stylelib.colors')" @close="() => fillPanelStatusMgr.close()" />
    </div>
</template>
<style scoped lang="scss">
.borders-wrapper {
    width: 100%;
    height: fit-content;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .add,
    .border-style {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-radius: var(--default-radius);
        transition: .2s;

        >img {
            width: 16px;
            height: 16px;
        }
    }

    .border-style img {
        padding: 2px;
        box-sizing: border-box;
    }

    .add:hover {
        background-color: #F5F5F5;
    }

    .border-style:hover {
        background-color: #F5F5F5;
    }

    .border_clover,
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

    .border_clover>img {
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

.active {
    background-color: rgba(191, 191, 191, 0.7) !important;
}
</style>