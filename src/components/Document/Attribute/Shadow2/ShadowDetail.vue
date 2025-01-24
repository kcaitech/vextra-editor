<script setup lang="ts">
import { Context } from '@/context';
import { ShadowCatch, ShadowsContextMgr } from './ctx';
import Popover from '@/components/common/Popover.vue';
import { useI18n } from 'vue-i18n';
import SvgIcon from '@/components/common/SvgIcon.vue';
import gear_icon from '@/assets/icons/svg/gear.svg';
import ShadowInput from './ShadowInput.vue';
import { format_value } from '@/utils/common';
import ColorBlock from "@/components/common/ColorBlock/Index.vue";
import { Color } from '@kcdesign/data';
import { selectAllOnFocus } from '../basic';
import { toHex } from '@/utils/color';
import { ref, watch, onUnmounted, reactive } from 'vue';
import { FillsPicker } from "@/components/common/ColorPicker/Editor/stylectxs/fillspicker";
import ColorPicker from "@/components/common/ColorPicker/Index2.vue";
import { ElementManager, ElementStatus } from '@/components/common/elementmanager';

const { t } = useI18n();


const props = defineProps<{
    context: Context
    data: ShadowCatch
    manager: ShadowsContextMgr
}>();

const colorHex = ref<string>(toHex(props.data.shadow.color).slice(1));
const alpha = ref<string>(Math.round(props.data.shadow.color.alpha * 100) + '%');
const colors = ref<Color[]>([props.data.shadow.color] as Color[]);

const colorPanelStatus = reactive<ElementStatus>({id: '#color-piker-gen-2-panel', visible: false});
const colorPanelStatusMgr = new ElementManager(
    props.context,
    colorPanelStatus,
    {whiteList: ['#color-piker-gen-2-panel', '.color-wrapper']}
);

function extend(base: number) {
    return Number(format_value(base));
}


onUnmounted(watch(() => props.data, () => {
    colorHex.value = toHex(props.data.shadow.color).slice(1);
    alpha.value = Math.round(props.data.shadow.color.alpha * 100) + '%';
    colors.value = [props.data.shadow.color] as Color[];
}))
</script>

<template>
    <div class="border-detail-container">
        <Popover :context="context" class="popover" ref="popover" :width="254" :auto_to_right_line="true"
            :title="`${t('shadow.shadow_setting')}`">
            <template #trigger>
                <div class="trigger">
                    <SvgIcon :icon="gear_icon" />
                </div>
            </template>

            <template #body>
                <div class="options-container">
                    <div class="setting">
                        <div class="name-title">{{ t('shadow.position') }}</div>
                        <ShadowInput ticon="X" :shadow-v="extend(data.shadow.offsetX)" @on-change="setOffsetX"
                            @key-down="keydownOffsetX" @dragstart="dragStart" @dragging="draggingX" @dragend="dragEnd">
                        </ShadowInput>
                        <ShadowInput ticon="Y" :shadow-v="extend(data.shadow.offsetY)" @on-change="setOffsetY"
                            @key-down="keydownOffsetY" @dragstart="dragStart" @dragging="draggingY" @dragend="dragEnd">
                        </ShadowInput>
                    </div>
                    <div class="setting">
                        <div class="name-title">{{ t('shadow.effect') }}</div>
                        <ShadowInput ticon="B" :shadow-v="extend(data.shadow.blurRadius)" @on-change="setBlurRadius"
                            :tootip="`${t('shadow.blur')}`" @key-down="keydownBlurRadius" @dragstart="dragStart"
                            @dragging="draggingB" @dragend="dragEnd">
                        </ShadowInput>
                        <ShadowInput ticon="S" :shadow-v="extend(data.shadow.spread)" @on-change="setSpread"
                            :disabled="disabled" :tootip="spare_tip" @dragstart="dragStart" @dragging="draggingS"
                            @dragend="dragEnd" @key-down="keydownSpread">
                        </ShadowInput>
                    </div>
                    <div class="setting">
                        <div class="name-title">{{ t('shadow.color') }}</div>
                        <div :class="{ 'value-panel-wrapper': true }">
                            <ColorBlock :colors="([data.shadow.color] as Color[])" @click="showColorPanel" />
                            <input class="colorShadow" type="text" :value="alpha" @focus="selectAllOnFocus"
                                @change="(e) => manager.modifyShadpwHex(e, data.shadow)" />
                            <input class="alphaShadow" type="text" :value="alpha" @focus="selectAllOnFocus"
                                @change="(e) => manager.modifyFillAlpha(e, data.shadow)" />
                        </div>
                        <ColorPicker v-if="colorPanelStatus.visible" :editor="fillsPicker" :type="data.fill.fillType"
                            :color="rgba" @close="() => colorPanelStatusMgr.close()" />
                    </div>
            </template>
        </Popover>
        <teleport to="body">
            <div v-if="tel" class="point" :style="{ top: `${telY - 10}px`, left: `${telX - 10.5}px` }">
            </div>
        </teleport>
    </div>
</template>

<style scoped lang="scss">
.border-detail-container {
    >.popover {
        width: 28px;
        height: 28px;

        .trigger {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: var(--default-radius);

            >img {
                width: 16px;
                height: 16px;
            }
        }

        .trigger:hover {
            background-color: #F5F5F5;
        }

        .options-container {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 12px 12px 0 12px;
            box-sizing: border-box;
            height: 100%;

            >div {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
            }
        }
    }
}

.setting {
    width: 100%;
    height: 32px;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    //justify-content: space-between;

    .name-title {
        width: 24px;
        height: 14px;
        font-family: HarmonyOS Sans;
        font-size: 12px;
        color: #737373;
        margin-right: 14px;
    }
}

.value-panel-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;

    flex: 1;
    height: 32px;
    padding: 0 8px;
    box-sizing: border-box;
    background-color: var(--input-background);
    border-radius: var(--default-radius);

    .colorShadow {
        flex: 1;
        width: 46px;
        outline: none;
        border: none;
        height: 14px;
        background-color: transparent;
        font-size: 12px;
        box-sizing: border-box;
    }

    .alphaShadow {
        width: 46px;
        outline: none;
        border: none;
        background-color: transparent;
        height: 14px;
        font-size: 12px;
        box-sizing: border-box;
        flex: 0 0 46px;
        text-align: right;
    }
}

.point {
    position: absolute;
    width: 24px;
    height: 24px;
    background-image: url("@/assets/cursor/scale.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 32px;
    z-index: 10000;
}
</style>