<script setup lang="ts">
import { Context } from "@/context";
import { FillMask } from "@kcdesign/data";
import { FillCatch, FillsContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import { onMounted, onUnmounted, ref } from "vue";
import FillItem from "@/components/Document/Attribute/Fill2/FillItem.vue";
import { useI18n } from "vue-i18n";
import PanelHeader from "@/components/Document/Attribute/StyleLib/PanelHeader.vue";
import MaskBaseInfo from "@/components/Document/Attribute/StyleLib/MaskBaseInfo.vue";
import ListHeader from "@/components/Document/Attribute/StyleLib/ListHeader.vue";

/**
 * 修改样式弹框
 */
const { context, manager, data } = defineProps<{
    context: Context;
    manager: FillsContextMgr;
    data?: FillMask;
}>();
const emits = defineEmits<{
    (e: 'close'): void;
}>();

const { t } = useI18n();
const name = ref<string>(data?.name ?? t('stylelib.colors'));
const desc = ref<string>(data?.description ?? '');
const fills = ref<FillCatch[]>();
const last = ref<boolean>(false);

function getFills() {
    const container: FillCatch[] = [];
    if (data) {
        for (let i = data.fills.length - 1; i > -1; i--) container.push({ fill: data.fills[i] });
    }
    return container;
}

function update() {
    name.value = data?.name ?? t('stylelib.colors');
    desc.value = data?.description ?? '';
    fills.value = getFills();
    last.value= fills.value.length === 1;
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
    manager.createStyleLib(name.value, desc.value);
}

function checkEnter(e: KeyboardEvent) {
    if (e.key === 'Enter' && name.value && !data) {
        createStyle();
    }
}

onMounted(() => {
    update();
    data?.watch(update);
    document.addEventListener('keydown', checkEnter);
});

onUnmounted(() => {
    data?.unwatch(update);
    document.removeEventListener('keydown', checkEnter);
})
</script>
<template>
    <div class="modify-fill-style-panel" id="modify-fill-style-panel">
        <PanelHeader :title="data ? t('stylelib.editor_color') : t('stylelib.create_color')" @close="emits('close')" />
        <MaskBaseInfo :name="name" :desc="desc" @modify-name="modifyName" @modify-desc="modifyDesc"
            @change-name-input="changeNameInput" @change-desc-input="changeDescInput" />
        <div v-if="data" class="data-panel">
            <ListHeader :title="t('stylelib.color')" @create="manager.create(data)" />
            <div class="fills-container">
                <FillItem v-for="(fill, index) in fills" :key="index" :context="context" :manager="manager"
                    :data="(fill as FillCatch)" :last="last" />
            </div>
        </div>
        <div v-else :class="{ 'create-style': true, disabled: !name }" @click="createStyle">{{ t('stylelib.add_style') }}</div>
    </div>
</template>
<style scoped lang="scss">
.modify-fill-style-panel {
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
            padding: 0 12px;
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