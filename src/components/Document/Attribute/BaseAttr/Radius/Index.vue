/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from "@/context";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { RadiusContext, RadiusContextMgr } from "./ctx";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import SvgIcon from "@/components/common/SvgIcon.vue";
import RadiusMaskView from "./RadiusMaskView.vue";
import RadiusView from "./RadiusView.vue";
import RadiusStylePanel from "./Lib/RadiusStylePanel.vue";

import style_icon from "@/assets/icons/svg/styles.svg";
const { t } = useI18n();

const props = defineProps<{
    context: Context;
    selectionChange: number;
    trigger: any[];
    disabled: boolean;
}>();

const radiusCtx = ref<RadiusContext>({
    mixed: false,
    radius: [],
    rect: false,
    mask: undefined,
    maskInfo: undefined
});
const radiusCtxMgr = new RadiusContextMgr(props.context, radiusCtx.value as RadiusContext);
const cloverVisible = computed<boolean>(() => !(radiusCtx.value.mask));

const radiusLibStatus = reactive<ElementStatus>({ id: '#radius-style-lib-panel', visible: false });
const radiusPanelStatusMgr = new ElementManager(
    props.context,
    radiusLibStatus,
    { whiteList: ['.radius-style-lib-panel', '.radius_clover', '.radius-left'] }
);
radiusCtxMgr.catchPanel(radiusPanelStatusMgr);

function showRadiusPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('header')) {
            radiusPanelStatusMgr.showBy(e, { once: { offsetLeft: -4, offsetTop: 36 } });
            break;
        }
        if (e.classList.contains('radius-left')) {
            radiusPanelStatusMgr.showBy(e, { once: { offsetLeft: -4, offsetTop: 36 } });
            break;
        }
        e = e.parentElement;
    }
}

const closePanel = () => {
    radiusPanelStatusMgr.close();
}

const watchList: any[] = [
    watch(() => props.selectionChange, () => radiusCtxMgr.update()),
    watch(() => props.trigger, v => {
        if (v?.includes('radius')|| v?.includes('radiusMask') || v?.includes('variables') || v?.includes('cornerRadius')) {
            radiusCtxMgr.update();
        }
    })
]

onMounted(() => {
    radiusCtxMgr.update();
});
onUnmounted(() => {
    watchList.forEach(stop => stop());
    radiusPanelStatusMgr.unmounted();
});
</script>

<template>
    <div class="header">
        <div class="title">{{ t('stylelib.round') }}</div>
        <div v-if="cloverVisible" :class="{ 'active': radiusLibStatus.visible }" class="radius_clover"
            @click="showRadiusPanel($event)">
            <SvgIcon :icon="style_icon"></SvgIcon>
        </div>
    </div>
    <RadiusView v-if="!radiusCtx.mask && radiusCtx.radius.length" :context="context" :manager="radiusCtxMgr"
        :data="radiusCtx.radius" :disabled="disabled" />
    <RadiusMaskView v-else-if="radiusCtx.mask" :active="radiusLibStatus.visible" :context="context"
        :manager="radiusCtxMgr" @showRadiusPanel="showRadiusPanel" />
    <RadiusStylePanel v-if="radiusLibStatus.visible" :context="context" :manager="radiusCtxMgr" @close="closePanel"
        :title="t('stylelib.radius')" />
</template>

<style scoped lang="scss">
.header {
    position: relative;
    width: 100%;
    height: 30px;
    align-items: center;
    justify-content: space-between;
    display: flex;
    flex-direction: row;
    gap: 8px;

    .radius_clover {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        box-sizing: border-box;

        &:hover {
            background-color: #F5F5F5;
        }

        img {
            width: 12px;
            height: 12px;
        }
    }
}

.active {
    background-color: rgba(191, 191, 191, 0.7) !important;
}
</style>