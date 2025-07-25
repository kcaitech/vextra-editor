/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from "@/context";
import { ShadowMask } from "@kcaitech/vextra-core";
import { onMounted, onUnmounted, ref } from "vue";
import ShadowItem from "@/components/Document/Attribute/Shadow2/ShadowItem.vue";
import { useI18n } from "vue-i18n";
import PanelHeader from "@/components/Document/Attribute/StyleLib/PanelHeader.vue";
import MaskBaseInfo from "@/components/Document/Attribute/StyleLib/MaskBaseInfo.vue";
import ListHeader from "@/components/Document/Attribute/StyleLib/ListHeader.vue";
import { ShadowsContextMgr, ShadowCatch } from "../ctx";

/**
 * 修改样式弹框
 */
const { context, manager, data } = defineProps<{
    context: Context;
    manager: ShadowsContextMgr;
    data?: ShadowMask;
}>();
const emits = defineEmits<{
    (e: 'close'): void;
}>();

const { t } = useI18n();
const name = ref<string>(data?.name ?? t('stylelib.shadows'));
const desc = ref<string>(data?.description ?? '');
const shadows = ref<ShadowCatch[]>();
const last = ref<boolean>(false);

function getShadows() {
    const container: ShadowCatch[] = [];
    if (data) {
        for (let i = data.shadows.length - 1; i > -1; i--) container.push({ shadow: data.shadows[i] });
    }
    return container;
}

function update() {
    name.value = data?.name ?? t('stylelib.shadows');
    desc.value = data?.description ?? '';
    shadows.value = getShadows();
    last.value = shadows.value.length === 1;
}

function modifyName(value: string) {
    name.value = value;
    if (!data) return;
    manager.modifyMaskName(data.sheet, data.id, value);
}

function modifyDesc(value: string) {
    desc.value = value;
    if (!data) return;
    manager.modifyMaskDesc(data.sheet, data.id, value);
}

function changeNameInput(value: string) {
    name.value = value;
}

function changeDescInput(value: string) {
    desc.value = value;
}

function createStyle() {
    if (!name.value || data) return;
    manager.createStyleLib(name.value, desc.value);
}

onMounted(() => {
    update();
    data?.watch(update);
});

onUnmounted(() => {
    data?.unwatch(update);
})
</script>
<template>
    <div class="modify-shadow-style-panel" id="modify-shadow-style-panel">
        <PanelHeader :title="data ? t('stylelib.editor_shadow') : t('stylelib.create_shadow')"
            @close="emits('close')" />
        <MaskBaseInfo :name="name" :desc="desc" @modify-name="modifyName" @modify-desc="modifyDesc"
                      @change-name-input="changeNameInput" @change-desc-input="changeDescInput" @create="createStyle"/>
        <div v-if="data" class="data-panel">
            <ListHeader :title="t('stylelib.shadow')" @create="manager.create(data)" />
            <div class="fills-container">
                <ShadowItem v-for="(shadow, index) in shadows" :key="index" :context="context" :manager="manager"
                    :data="(shadow as ShadowCatch)" :lastone="last" />
            </div>
        </div>
        <div v-else :class="{ 'create-style': true, disabled: !name }" @click="createStyle">{{ t('stylelib.add_style') }}</div>
    </div>
</template>
<style scoped lang="scss">
.modify-shadow-style-panel {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 250px;
    gap: 8px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    box-sizing: border-box;

    .data-panel {
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 8px;

        .fills-container {
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: 100%;
            height: fit-content;
            padding: 0 8px;
            box-sizing: border-box;
        }
    }

    .create-style {
        width: 100px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 8px auto;
        font-size: 12px;
        color: #fff;
        border-radius: 6px;
        background-color: #1878f5;
    }

    .disabled {
        opacity: 0.3;
        pointer-events: none;
    }
}
</style>