<script setup lang="ts">
import { Context } from "@/context";
import { RadiusMask } from "@kcdesign/data";
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import PanelHeader from "@/components/Document/Attribute/StyleLib/PanelHeader.vue";
import MaskBaseInfo from "@/components/Document/Attribute/StyleLib/MaskBaseInfo.vue";
import { RadiusContextMgr } from "../ctx";

/**
 * 修改样式弹框
 */
const { context, manager, data } = defineProps<{
    context: Context;
    manager: RadiusContextMgr;
    data?: RadiusMask;
}>();
const emits = defineEmits<{
    (e: 'close'): void;
}>();

const { t } = useI18n();
const name = ref<string>(data?.name ?? '边框样式');
const desc = ref<string>(data?.description ?? '');
const radius = ref<string>('');

function update() {
    name.value = data?.name ?? '';
    desc.value = data?.description ?? '';
    if (data) {
        radius.value = [...data.radius].join(', ');
    } else {
        radius.value = '0, 0, 0, 0';
    }
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

function changeInput(value: string) {
    name.value = value;
}

function createStyle() {
    if (!radius.value) return;
    manager.createStyleLib(name.value, desc.value);
}

const setRadius = (event: Event) => {
    const target = event.target as HTMLInputElement;
    let arrs = radius.value.replaceAll(/，/g, ',').replaceAll(/\s+/g, '').split(',').slice(0, 4).filter(Boolean);
    const b = arrs.every(i => isNaN(Number(i)) === false);
    target.blur();
    if (!b) {
        if (data) {
            return radius.value = [...data.radius].join(', ');
        } else {
            return radius.value = '0, 0, 0, 0';
        }
    }
    if (arrs.length === 1) {
        arrs = arrs.concat(...arrs, ...arrs, ...arrs);
    }
    if (arrs.length === 2) {
        arrs = arrs.concat(arrs[0], arrs[1]);
    }
    if (arrs.length === 3) {
        arrs = arrs.concat(arrs[1]);
    }

    const num = arrs.map(i => Math.max(Number(i), 0));
    radius.value = num.join(', ');
    if (!data) return;
    manager.modifyRadiusMask(data, num);
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
    <div class="modify-radius-style-panel" id="modify-radius-style-panel">
        <PanelHeader :title="data ? t('stylelib.editor_color') : t('stylelib.create_color')" @close="emits('close')" />
        <MaskBaseInfo :name="name" :desc="desc" :focus-at-once="!data" @modify-name="modifyName"
            @modify-desc="modifyDesc" @changeInput="changeInput"/>

        <div class="radius" v-if="data">
            <div class="title">{{ t('stylelib.round') }}</div>
            <input type="text" v-model="radius" @change="setRadius">
        </div>
        <div v-if="!data" :class="{ 'create-style': true, disabled: !name }" @click="createStyle">创建样式</div>
    </div>
</template>
<style scoped lang="scss">
.modify-radius-style-panel {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 250px;
    gap: 8px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    padding-bottom: 8px;
    box-sizing: border-box;

    .type {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 0 12px;
        box-sizing: border-box;

        .select {
            flex: 1;
        }
    }


    .radius {

        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        box-sizing: border-box;

        input {
            flex: 1;
            width: 100%;
            outline: none;
            border: none;
            padding: 10px 8px;
            background-color: #F5F5F5;
            height: 32px;
            border-radius: 6px;
            box-sizing: border-box;
        }
    }

    .create-style {
        width: 100px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        margin-top: 8px;
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