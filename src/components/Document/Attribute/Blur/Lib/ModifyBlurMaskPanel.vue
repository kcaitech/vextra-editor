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
import { BlurMask } from "@kcdesign/data";
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import PanelHeader from "@/components/Document/Attribute/StyleLib/PanelHeader.vue";
import MaskBaseInfo from "@/components/Document/Attribute/StyleLib/MaskBaseInfo.vue";
import ListHeader from "@/components/Document/Attribute/StyleLib/ListHeader.vue";
import { BlurCatch, BlurContextMgr } from "../ctx";
import BlurPanel from "@/components/Document/Attribute/Blur/BlurPanel.vue"

/**
 * 修改样式弹框
 */
const { context, manager, data } = defineProps<{
    context: Context;
    manager: BlurContextMgr;
    data?: BlurMask;
}>();
const emits = defineEmits<{
    (e: 'close'): void;
}>();

const { t } = useI18n();
const name = ref<string>('');
const desc = ref<string>('');
const blur = ref<BlurCatch | undefined>();

function getBlur(): BlurCatch | undefined {
    if (data) {
        return {
            enable: data.blur.isEnabled,
            type: data.blur.type,
            saturation: data.blur.saturation,
            blur: data.blur
        }
    }
}

function update() {
    name.value = data?.name ?? t('stylelib.blurs');
    desc.value = data?.description ?? '';
    blur.value = getBlur();
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
})

onUnmounted(() => {
    data?.unwatch(update);
})
</script>
<template>
    <div class="modify-blur-panel" id="modify-blur-panel">
        <PanelHeader :title="data ? t('stylelib.editor_blur') : t('stylelib.create_blur')" @close="emits('close')" />
        <MaskBaseInfo :name="name" :desc="desc" @modify-name="modifyName" @modify-desc="modifyDesc"
                      @change-name-input="changeNameInput" @change-desc-input="changeDescInput" @create="createStyle"/>
        <div v-if="data" class="data-panel">
            <ListHeader :title="t('stylelib.blur')" create />
            <div class="fills-container">
                <BlurPanel v-if="blur" :manager="manager" :context="context" :blur="(blur as BlurCatch)" del />
            </div>
        </div>
        <div v-else :class="{ 'create-style': true, disabled: !name }" @click="createStyle">{{ t('stylelib.add_style') }}</div>
    </div>
</template>
<style scoped lang="scss">
.modify-blur-panel {
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