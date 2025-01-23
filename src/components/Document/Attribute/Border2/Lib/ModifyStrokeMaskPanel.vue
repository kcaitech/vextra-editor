<script setup lang="ts">
import { Context } from "@/context";
import { BasicArray, BorderMask, BorderMaskType, BorderPosition, BorderSideSetting, SideType } from "@kcdesign/data";
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import PanelHeader from "@/components/Document/Attribute/StyleLib/PanelHeader.vue";
import MaskBaseInfo from "@/components/Document/Attribute/StyleLib/MaskBaseInfo.vue";
import { StrokeFillContextMgr } from "../ctx";
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { genOptions } from "@/utils/common";
import { v4 } from "uuid";

/**
 * 修改样式弹框
 */
const { context, manager, data } = defineProps<{
    context: Context;
    manager: StrokeFillContextMgr;
    data?: BorderMask;
}>();
const emits = defineEmits<{
    (e: 'close'): void;
}>();

const { t } = useI18n();
const name = ref<string>(data?.name ?? '边框样式');
const desc = ref<string>(data?.description ?? '');
const thickness = ref<string>('');
const border = ref<BorderMaskType | undefined>(data?.border);
const positonValue = ref<BorderPosition>(data?.border.position ?? BorderPosition.Inner);

const positonOptionsSource: SelectSource[] = genOptions([
    [BorderPosition.Outer, t(`attr.${BorderPosition.Outer}`)],
    [BorderPosition.Center, t(`attr.${BorderPosition.Center}`)],
    [BorderPosition.Inner, t(`attr.${BorderPosition.Inner}`)],
]);

function update() {
    name.value = data?.name ?? '';
    desc.value = data?.description ?? '';
    border.value = data?.border;
    if (data) {
        const { thicknessTop, thicknessRight, thicknessBottom, thicknessLeft } = data.border.sideSetting;
        thickness.value = [thicknessTop, thicknessRight, thicknessBottom, thicknessLeft].join(', ');
    } else {
        thickness.value = '1, 1, 1, 1';
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

function createStyle() {
    if (!thickness.value || !positonValue.value) return;
    const value = thickness.value.split(', ').map(i => Number(i));
    const side = new BorderSideSetting(SideType.Custom, value[0], value[3], value[2], value[1]);
    const border = new BorderMaskType(positonValue.value, side);
    manager.createStrokeStyleLib(name.value, desc.value, border);
}

const setThickness = (event: Event) => {
    const target = event.target as HTMLInputElement;
    let arrs = thickness.value.replaceAll(/，/g, ',').replaceAll(/\s+/g, '').split(',').slice(0, 4).filter(Boolean);
    const b = arrs.every(i => isNaN(Number(i)) === false);
    target.blur();
    if (!b) {
        if (data) {
            const { thicknessTop, thicknessRight, thicknessBottom, thicknessLeft } = data.border.sideSetting;
            return thickness.value = [thicknessTop, thicknessRight, thicknessBottom, thicknessLeft].join(', ');
        } else {
            return thickness.value = '1, 1, 1, 1';
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

    const num = thickness.value.split(', ').map(i => Math.min(Number(i), 300));
    thickness.value = num.join(', ');
    if (!data) return;
    const sideType = data.border.sideSetting.sideType;
    const side = new BorderSideSetting(sideType, num[0], num[3], num[2], num[1]);
    manager.modifyBorderThicknessMask(data.sheet, data.id, side);
}

function positionSelect(selected: SelectItem) {
    positonValue.value = selected.value as BorderPosition;
    if (!data) return;
    if (data?.border.position === selected.value) return;
    manager.modifyBorderPositionMask(data.sheet, data.id, selected.value as BorderPosition);
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
    <div class="modify-stroke-style-panel" id="modify-stroke-style-panel">
        <PanelHeader :title="data ? t('stylelib.editor_color') : t('stylelib.create_color')" @close="emits('close')" />
        <MaskBaseInfo :name="name" :desc="desc" :focus-at-once="!data" @modify-name="modifyName"
            @modify-desc="modifyDesc" />
        <div class="type">
            <div class="title">{{ t('stylelib.position') }}</div>
            <Select class="select" :context="context" :shapes="manager.selected" :source="positonOptionsSource"
                :selected="positonOptionsSource.find(i => i.data.value === (border?.position || BorderPosition.Inner))?.data"
                @select="positionSelect" :entry="'style'"></Select>
        </div>
        <div class="thickness">
            <div class="title">{{ t('stylelib.thickness') }}</div>
            <input type="text" v-model="thickness" @change="setThickness">
        </div>
        <div v-if="!data" :class="{ 'create-style': true, disabled: !name }" @click="createStyle">创建样式</div>
    </div>
</template>
<style scoped lang="scss">
.modify-stroke-style-panel {
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


    .thickness {

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