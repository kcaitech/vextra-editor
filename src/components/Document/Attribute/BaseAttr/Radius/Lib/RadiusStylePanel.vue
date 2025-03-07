/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import RadiusStyle from "./RadiusStyle.vue";
import { Context } from "@/context";
import PopoverHeader from "@/components/common/PopoverHeader.vue";
import CreateRadiusMaskPanel from "./ModifyRadiusMaskPanel.vue";
import { onUnmounted, reactive } from "vue";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { useI18n } from "vue-i18n";
import { RadiusContextMgr } from "../ctx";

const { context, manager, title } = defineProps<{ context: Context, manager: RadiusContextMgr, title: string }>();
const emits = defineEmits<{ (e: "close"): void; }>();
const { t } = useI18n()
const panelStatus = reactive<ElementStatus>({ id: '#modify-radius-style-panel', visible: false });
const panelStatusMgr = new ElementManager(
    context,
    panelStatus,
    { whiteList: ['.modify-radius-style-panel', '.add'] }
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
    <div id="radius-style-lib-panel" class="radius-style-lib-panel">
        <PopoverHeader :title="title" @create="showCreatePanel" @close="emits('close')" />
        <RadiusStyle :context="context" :manager="manager" />
        <CreateRadiusMaskPanel v-if="panelStatus.visible" :context="context" :manager="manager"
            @close="() => panelStatusMgr.close()" />
    </div>
</template>
<style scoped lang="scss">
.radius-style-lib-panel {
    width: 230px;
    height: fit-content;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    background-color: #FFFFFF;
    border-radius: 8px;
    box-sizing: border-box;
    z-index: 9;
}
</style>