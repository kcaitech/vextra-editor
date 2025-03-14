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
import { Fill, FillMask } from "@kcdesign/data";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import ColorBlock from "@/components/common/ColorBlock/Index.vue"
import ModifyFillStyle from "@/components/Document/Attribute/Fill2/Lib/ModifyFillMaskPanel.vue";
import { Context } from "@/context";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { FillsContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import PanelItem from "@/components/Document/Attribute/StyleLib/PanelItem.vue";

/**
 * 用于展示样式表中单个样式的组件
 * data: 样式信息
 * 该组件除了展示样式基本信息之外，可以点击把该样式绑定到图层上、修改该样式
 */
const {data, context, manager} = defineProps<{ context: Context; manager: FillsContextMgr; data: FillMask; }>();
const emits = defineEmits<{
    (e: 'update'): void;
}>();
const name = ref<string>(data.name);
const fills = ref<Fill[]>(data.fills.map(i => i));
const selected = ref<boolean>(manager.fillCtx.mask === data.id);

const modifyPanelStatus = reactive<ElementStatus>({id: '#modify-fill-style-panel', visible: false});
const modifyPanelStatusMgr = new ElementManager(
    context,
    modifyPanelStatus,
    { whiteList: ['.modify-fill-style-panel', '.modify'], level: 1 }
);

function update(...args: any[]) {
    if (args?.includes('disabled')) emits('update');
    name.value = data.name;
    fills.value = data.fills.map(i => i);
    selected.value = manager.fillCtx.mask === data.id;
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

function modifyFillMask() {
    if (selected.value) return;
    manager.modifyFillMask(data.id);
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
            <div class="content" @click="modifyFillMask">
                <ColorBlock :colors="fills as Fill[]" round disabled-alpha/>
                <span>{{ name }}</span>
            </div>
        </template>
        <template #modal>
            <ModifyFillStyle v-if="modifyPanelStatus.visible" :context="context" :manager="manager" :data="data"
                         @close="() => modifyPanelStatusMgr.close()"/>
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

        > span {
            display: block;
            width: 132px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
</style>