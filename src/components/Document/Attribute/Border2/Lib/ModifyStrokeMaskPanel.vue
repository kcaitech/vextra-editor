<script setup lang="ts">
import { Context } from "@/context";
import { BorderMask, BorderMaskType, BorderPosition, BorderSideSetting, SideType } from "@kcdesign/data";
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import PanelHeader from "@/components/Document/Attribute/StyleLib/PanelHeader.vue";
import MaskBaseInfo from "@/components/Document/Attribute/StyleLib/MaskBaseInfo.vue";
import { StrokeFillContextMgr } from "../ctx";
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { genOptions } from "@/utils/common";

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
const oldvalue = ref<string>('');
const border = ref<BorderMaskType | undefined>(data?.border);
const positonValue = ref<BorderPosition>(data?.border.position ?? BorderPosition.Inner);

const positonOptionsSource: SelectSource[] = genOptions([
    [BorderPosition.Outer, t(`attr.${BorderPosition.Outer}`)],
    [BorderPosition.Center, t(`attr.${BorderPosition.Center}`)],
    [BorderPosition.Inner, t(`attr.${BorderPosition.Inner}`)],
]);

function update() {
    name.value = data?.name ?? '边框样式';
    desc.value = data?.description ?? '';
    border.value = data?.border;

    if (data) {
        const { thicknessTop, thicknessRight, thicknessBottom, thicknessLeft } = data.border.sideSetting;
        thickness.value = [thicknessTop, thicknessRight, thicknessBottom, thicknessLeft].join(', ');        
    } else {
        const sideSetting = manager.fillCtx.strokeInfo?.sideSetting;
        const position = manager.fillCtx.strokeInfo?.position;
        if (typeof sideSetting === 'undefined') return;
        if (typeof sideSetting === 'string') return;
        const { thicknessTop, thicknessRight, thicknessBottom, thicknessLeft } = sideSetting;
        thickness.value = [thicknessTop, thicknessRight, thicknessBottom, thicknessLeft].join(', ');
        if (position === undefined) return;
        positonValue.value = position as BorderPosition;
    }
    oldvalue.value = thickness.value;
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
    if (!thickness.value || !positonValue.value) return;
    const value = thickness.value.split(', ').map(i => Number(i));
    const side = new BorderSideSetting(SideType.Custom, value[0], value[3], value[2], value[1]);
    const border = new BorderMaskType(positonValue.value, side);
    manager.createStrokeStyleLib(name.value, desc.value, border);
}

const setThickness = (event: Event) => {
    let arrs = thickness.value.replaceAll(/，/g, ',').replaceAll(/-/g, '').replaceAll(/\s+/g, '').split(',').slice(0, 4).filter(Boolean);
    const b = arrs.every(i => isNaN(Number(i)) === false);
    if (!b || !arrs.length) return thickness.value = oldvalue.value;
    if (arrs.length === 1) {
        arrs = arrs.concat(...arrs, ...arrs, ...arrs);
    }
    if (arrs.length === 2) {
        arrs = arrs.concat(arrs[0], arrs[1]);
    }
    if (arrs.length === 3) {
        arrs = arrs.concat(arrs[1]);
    }
    thickness.value = arrs.join(', ')
    if (thickness.value === oldvalue.value) return;
    oldvalue.value = thickness.value;
    const num = thickness.value.split(', ').map(i => Number(i))
    if (!data) return;
    const sideType = num.every(i => i == num[0]) ? SideType.Normal : SideType.Custom;
    const side = new BorderSideSetting(sideType, num[0], num[3], num[2], num[1]);
    manager.modifyBorderThicknessMask(data.border, side);
}

function positionSelect(selected: SelectItem) {
    positonValue.value = selected.value as BorderPosition;
    if (!data) return;
    if (data?.border.position === selected.value) return;
    manager.modifyBorderPositionMask(data.border, selected.value as BorderPosition);
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
        <PanelHeader :title="data ? t('stylelib.editor_border') : t('stylelib.create_border')" @close="emits('close')" />
        <MaskBaseInfo :name="name" :desc="desc" :focus-at-once="!data" @modify-name="modifyName"
            @modify-desc="modifyDesc" />
        <div v-if="data" class="data-panel">
            <div class="type">
                <div class="title">{{ t('stylelib.position') }}</div>
                <Select class="select" :context="context" :shapes="manager.selected" :source="positonOptionsSource"
                    :selected="positonOptionsSource.find(i => i.data.value === (border?.position || positonValue))?.data"
                    @select="positionSelect" :entry="'style'"></Select>
            </div>
            <div class="thickness">
                <div class="title">{{ t('stylelib.thickness') }}</div>
                <input type="text" v-focus v-model="thickness" @change="setThickness">
            </div>
        </div>

        <div v-else :class="{ 'create-style': true, disabled: !name }" @click="createStyle">创建样式</div>
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

    .data-panel {
        display: flex;
        flex-direction: column;
        gap: 8px;

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