/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { BorderMask } from "@kcaitech/vextra-core";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import ModifyStrokeStyle from "./ModifyStrokeMaskPanel.vue";
import { Context } from "@/context";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import PanelItem from "@/components/Document/Attribute/StyleLib/PanelItem.vue";
import { StrokeFillContextMgr } from "../ctx";
import thickness_icon from '@/assets/icons/svg/thickness.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

const { data, context, manager } = defineProps<{ context: Context; manager: StrokeFillContextMgr; data: BorderMask; }>();
const emits = defineEmits<{
    (e: 'update'): void;
}>();
const name = ref<string>(data.name);
const selected = ref<boolean>(manager.fillCtx.strokeMask === data.id);

const modifyPanelStatus = reactive<ElementStatus>({ id: '#modify-stroke-style-panel', visible: false });
const modifyPanelStatusMgr = new ElementManager(
    context,
    modifyPanelStatus,
    { whiteList: ['.modify-stroke-style-panel', '.modify'], level: 1 }
);

function update(...args: any[]) {
    if (args?.includes('disabled')) emits('update');
    name.value = data.name;
    selected.value = manager.fillCtx.strokeMask === data.id;
}

function showModifyPanel(trigger: MouseEvent | Element) {
    let e: Element | null = trigger instanceof Element ? trigger : trigger.target as Element;
    while (e) {
        if (e.classList.contains('mask-catch-wrapper')) {
            modifyPanelStatusMgr.showBy(e, { once: { offsetLeft: -262 } });
            break;
        }
        e = e.parentElement;
    }
}

function modifyStrokeMask() {
    if (selected.value) return;
    manager.modifyStrokeMask(data.id);
}

function disable() {
    manager.disableMask(data);
}

onMounted(() => {
    data.watch(update);
})
onUnmounted(() => {
    data.unwatch(update);
    modifyPanelStatusMgr.unmounted();
})
</script>
<template>
    <PanelItem :context="context" :extend="modifyPanelStatus.visible" :selected="selected"
               @modify="showModifyPanel" @disable="disable">
        <template #preview>
            <div class="content" @click="modifyStrokeMask">
                <SvgIcon :icon="thickness_icon" />
                <span>{{ name }}</span>
            </div>
        </template>
        <template #modal>
            <ModifyStrokeStyle v-if="modifyPanelStatus.visible" :context="context" :manager="manager" :data="data"
                @close="() => modifyPanelStatusMgr.close()" />
        </template>
    </PanelItem>
</template>
<style scoped lang="scss">
.content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 8px;
    box-sizing: border-box;

    > img {
        width: 14px;
        height: 16px;
    }

    > span {
        display: block;
        width: 132px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>