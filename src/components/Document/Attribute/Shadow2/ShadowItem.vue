<script setup lang="ts">
import SvgIcon from "@/components/common/SvgIcon.vue";
import delete_icon from "@/assets/icons/svg/delete.svg";

import { Context } from "@/context";
import { useI18n } from "vue-i18n";
import CheckBox from "@/components/common/CheckBox.vue";
import ShadowDetail from "./ShadowDetail.vue";
import { ShadowCatch, ShadowsContextMgr } from "./ctx";
import { ShadowPosition } from "@kcdesign/data";
import SelectBanana from "@/components/common/Select/SelectBanana.vue";

defineProps<{
    context: Context;
    manager: ShadowsContextMgr;
    data: ShadowCatch;
}>();
const { t } = useI18n();
const shadowPositionOptions = [
    { label: t(`shadow.${ShadowPosition.Outer}`), value: ShadowPosition.Outer },
    { label: t(`shadow.${ShadowPosition.Inner}`), value: ShadowPosition.Inner }
];

</script>
<template>
    <div class="fill-item-container">
        <CheckBox :check="data.shadow.isEnabled" @change="() => manager.modifyVisible(data.shadow)" />
        <SelectBanana :context="context" :options="shadowPositionOptions" :value="data.shadow.position"
            @change="(val) => manager.modifyShadowPosition(data.shadow, val)" />
        <div class="detail">
            <ShadowDetail :context="context" :data="data" :manager="manager" />
        </div>
        <div class="delete" @click="() => manager.remove(data.shadow)">
            <SvgIcon :icon="delete_icon" />
        </div>
    </div>
</template>
<style scoped lang="scss">
.fill-item-container {
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;

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

        .shadow-position {
            flex: 1;
            height: 100%;
            margin-right: -2px;
            box-sizing: border-box;
        }


        .alpha {
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

    .disabled {
        >* {
            opacity: 0.3;
            pointer-events: none;
        }
    }

    .detail {
        flex: 0 0 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 28px;
    }

    .delete {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 0 0 28px;
        width: 28px;
        height: 28px;
        border-radius: var(--default-radius);
        transition: .2s;

        >img {
            width: 16px;
            height: 16px;
        }

        &:hover {
            background-color: #F5F5F5;
        }
    }
}
</style>