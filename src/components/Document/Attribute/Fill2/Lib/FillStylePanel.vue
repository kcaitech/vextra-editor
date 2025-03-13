/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import ColorStyle from "@/components/Document/Attribute/Fill2/Lib/ColorStyle.vue";
import { Context } from "@/context";
import PopoverHeader from "@/components/common/PopoverHeader.vue";
import CreateFillMaskPanel from "@/components/Document/Attribute/Fill2/Lib/ModifyFillMaskPanel.vue";
import { onUnmounted, reactive } from "vue";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { FillsContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import { useI18n } from "vue-i18n";

/**
 * 填充样式库面板。用于展示样式列表、创建样式
 */
const { context, manager } = defineProps<{ context: Context, manager: FillsContextMgr }>();
const emits = defineEmits<{ (e: "close"): void; }>();
const { t } = useI18n()
const panelStatus = reactive<ElementStatus>({ id: '#modify-fill-style-panel', visible: false });
const panelStatusMgr = new ElementManager(
    context,
    panelStatus,
    { whiteList: ['.modify-fill-style-panel', '.add'] }
);
manager.catchPanel(panelStatusMgr);

function showCreatePanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('add')) {
            e && panelStatusMgr.showBy(e, { once: { offsetLeft: -422 } });
            break;
        }
        e = e.parentElement;
    }
}

onUnmounted(() => {
    panelStatusMgr.unmounted();
});
</script>
<template>
    <div id="fill-style-lib-panel" class="fill-style-lib-panel">
        <PopoverHeader :title="t('stylelib.colors')" toggle :grid="manager.fillCtx.listStatus"
            @toggle="manager.toggleList()" @create="showCreatePanel" @close="emits('close')" />
        <ColorStyle :context="context" :manager="manager" />
        <CreateFillMaskPanel v-if="panelStatus.visible" :context="context" :manager="manager"
            @close="() => panelStatusMgr.close()" />
    </div>
</template>
<style scoped lang="scss">
.fill-style-lib-panel {
    width: 230px;
    height: fit-content;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    background-color: #FFFFFF;
    border-radius: 8px;
    box-sizing: border-box;
}
</style>