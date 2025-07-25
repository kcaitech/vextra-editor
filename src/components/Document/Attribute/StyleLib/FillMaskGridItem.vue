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
import { Fill, FillMask } from "@kcaitech/vextra-core";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import ColorBlock from "@/components/common/ColorBlock/Index.vue"
import ModifyFillStyle from "@/components/Document/Attribute/Fill2/Lib/ModifyFillMaskPanel.vue";
import { Context } from "@/context";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { FillsContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import Tooltip from '@/components/common/Tooltip.vue';
import RemoveEntrance from "@/components/Document/Attribute/StyleLib/RemoveEntrance.vue";

/**
 * 用于展示样式表中单个样式的组件
 * data: 样式信息
 * 该组件除了展示样式基本信息之外，可以点击把该样式绑定到图层上、修改该样式
 */
const { data, context, manager } = defineProps<{ context: Context; manager: FillsContextMgr; data: FillMask; }>();
const emits = defineEmits<{
    (e: 'update'): void;
}>();
const name = ref<string>(data.name);
const fills = ref<Fill[]>(data.fills.map(i => i));
const selected = ref<boolean>(manager.fillCtx.mask === data.id);
const trigger = ref<HTMLDivElement>();

const modifyPanelStatus = reactive<ElementStatus>({ id: '#modify-fill-style-panel', visible: false });
const modifyPanelStatusMgr = new ElementManager(
    context,
    modifyPanelStatus,
    { whiteList: ['.modify-fill-style-panel', '.modify'] }
);

const modifyMenuStatus = reactive<ElementStatus>({ id: '#remove-entrance', visible: false });
const modifyMenuStatusMgr = new ElementManager(
    context,
    modifyMenuStatus,
    { whiteList: ['#remove-entrance'] }
);

function update(...args: any[]) {
    if (args?.includes('disabled')) emits('update');
    name.value = data.name;
    fills.value = data.fills.map(i => i);
    selected.value = manager.fillCtx.mask === data.id;
}

function showModifyPanel(trigger: Element | null) {
    while (trigger) {
        if (trigger.classList.contains('grid')) {
            modifyPanelStatusMgr.showBy(trigger, { once: { offsetLeft: -256 } });
            break;
        }
        trigger = trigger.parentElement;
    }
}

function mouseup(event: MouseEvent) {
    if (event.button !== 2) return;
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('round-grid')) {
            const box = e.getBoundingClientRect();

            modifyMenuStatusMgr.showBy(e, {
                once: {
                    offsetLeft: event.clientX - box.x,
                    offsetTop: event.clientY - box.y
                }
            });
            break;
        }
        e = e.parentElement;
    }
}

function remove() {
    manager.disableMask(data);
    modifyMenuStatusMgr.close();
}

function modify() {
    showModifyPanel(trigger.value!);
    modifyMenuStatusMgr.close();
}

function modifyFillMask() {
    if (selected.value) return;
    manager.modifyFillMask(data.id);
}

onMounted(() => {
    data.watch(update);
})
onUnmounted(() => {
    data.unwatch(update);
    modifyPanelStatusMgr.unmounted();
    modifyMenuStatusMgr.unmounted();
})
</script>
<template>
    <div ref="trigger" class="round-grid" :class="{ selected: selected }" @mouseup="mouseup">
        <Tooltip :content="name" :offset="5">
            <div class="content" @click.stop="modifyFillMask">
                <ColorBlock :colors="fills as Fill[]" :size="22" round disabled-alpha/>
            </div>
        </Tooltip>
        <ModifyFillStyle v-if="modifyPanelStatus.visible" :context="context" :manager="manager" :data="data"
                         @close="() => modifyPanelStatusMgr.close()"/>
        <RemoveEntrance v-if="modifyMenuStatus.visible" @remove="remove" @modify="modify"/>
    </div>
</template>
<style scoped lang="scss">
.round-grid {
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    box-sizing: border-box;

    &:hover {
        border: 2px solid rgba(0, 0, 0, 0.06);
    }

    .content {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

.selected {
    border: 2px solid var(--active-color) !important;
}
</style>