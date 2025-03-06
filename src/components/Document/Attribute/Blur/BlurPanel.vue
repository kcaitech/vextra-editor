/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from "@/context";
import { BlurCatch, BlurContextMgr } from "@/components/Document/Attribute/Blur/ctx";
import delete_icon from "@/assets/icons/svg/delete.svg";
import CheckBox from "@/components/common/CheckBox.vue";
import SvgIcon from "@/components/common/SvgIcon.vue";
import SelectBanana from "@/components/common/Select/SelectBanana.vue";
import BlurDetail from "@/components/Document/Attribute/Blur/BlurDetail.vue";
import { BlurType } from "@kcdesign/data";
import { useI18n } from "vue-i18n";

const { context, blur, manager } = defineProps<{
    context: Context;
    blur: BlurCatch;
    manager: BlurContextMgr;
    del?: boolean
}>();
const { t } = useI18n();
const blurTypeOptions = [
    { label: t(`blur.${BlurType.Gaussian}`), value: BlurType.Gaussian },
    { label: t(`blur.${BlurType.Background}`), value: BlurType.Background }
];
</script>

<template>
    <div class="blur-container">
        <CheckBox :check="blur.enable" @change="() => manager.modifyEnable(blur.blur)" />
        <SelectBanana :context="context" :options="blurTypeOptions" :value="blur.type"
            @change="(val) => manager.modifyBlurType(blur.blur, val)" />
        <BlurDetail :context="context" :blur="blur" :manager="manager" />
        <div :class="{ 'delete': true, disabled: del }" @click="() => manager.removeBlur()">
            <SvgIcon :icon="delete_icon" />
        </div>
    </div>
</template>
<style scoped lang="scss">
.blur-container {
    height: 32px;
    width: 100%;
    display: flex;
    gap: 8px;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;

    .delete {
        flex: 0 0 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 28px;
        border-radius: var(--default-radius);
        transition: .2s;

        >img {
            width: 16px;
            height: 16px;
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

    .delete:hover {
        background-color: #F5F5F5;
    }

    .disabled {
        opacity: 0.3;
        pointer-events: none;
    }
}
</style>