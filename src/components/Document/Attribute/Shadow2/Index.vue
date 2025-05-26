/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

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

type Props = {
    context: Context;
    selectionChange: number;
    trigger: any[];
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
    { whiteList: ['.shadow-style-lib-panel', '.shadows-container', '.mask-port-wrapper'] }
);
shadowCtxMgr.catchPanel(shadowPanelStatusMgr);

function showShadowLib(event: MouseEvent) { /*打开填充样式库面板*/
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('header-container')) {
            shadowPanelStatusMgr.showBy(e, { once: { offsetLeft: -4, offsetTop: 36 } });
            break;
        }
        if (e.classList.contains('mask-port-wrapper')) {
            shadowPanelStatusMgr.showBy(e, { once: { offsetLeft: -4, offsetTop: 36 } });
            break;
        }
        e = e.parentElement;
    }
}

const watchList: any[] = [
    watch(() => props.selectionChange, () => shadowCtxMgr.update()),
    watch(() => props.trigger, (v) => {
        if (v?.includes('shadows') || v?.includes('shadowsMask') || v?.includes('variables')) {
            shadowCtxMgr.update()
        }
    })
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
                <div v-if="cloverVisible" :class="{ 'active': shadowLibStatus.visible }" class="shadow_clover"
                    @click="showShadowLib($event)">
                    <SvgIcon :icon="style_icon" />
                </div>
                <div v-if="!shadowCtx.mask || shadowCtx.mixed" class="create" @click="() => shadowCtxMgr.create()">
                    <SvgIcon :icon="add_icon" />
                </div>
            </template>
        </TypeHeader>

        <div v-if="shadowCtx.mixed" class="tips-wrapper">{{ t('attr.mixed_lang') }}</div>
        <ShadowMaskView v-else-if="shadowCtx.mask" :active="shadowLibStatus.visible" :context="context"
            :manager="shadowCtxMgr" :shadows="(shadowCtx.shadows as ShadowCatch[])" :info="shadowCtx.maskInfo!"
            @show-style-lib="e => showShadowLib(e)" />

        <div v-else-if="shadowCtx.shadows.length" class="shadows-container">
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

    .shadow_clover,
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

    .shadow_clover>img {
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

    .shadows-container {
        display: flex;
        flex-direction: column;
        gap: 6px;

        width: 100%;
        height: fit-content;
    }
}

.active {
    background-color: #ebebeb !important;
}
</style>