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
import SvgIcon from "@/components/common/SvgIcon.vue";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { Context } from "@/context";
import FillMaskPanelItem from '@/components/Document/Attribute/Fill2/Lib/FillMaskPanelItem.vue';
import { FillsContext, FillsContextMgr } from "../Fill2/ctx";
import { FillMask } from "@kcdesign/data";
import down_icon from '@/assets/icons/svg/down.svg';

const { t } = useI18n();
const props = defineProps<{
    context: Context;
    data: FillMask[];
}>();

const extend = ref<boolean>(props.context.attr.fillMaskFold);

const fillCtxMgr = new FillsContextMgr(props.context, {} as FillsContext);

const changeFold = () => {
    extend.value = !extend.value;
    props.context.attr.setFillMaskFold();
}
</script>

<template>
    <div class="container">
        <div class="header" @click="changeFold">
            <span>{{ t('stylelib.colors') }}</span>
            <div class="down">
                <SvgIcon :icon="down_icon" :style="{ transform: extend ? 'rotate(0deg)' : 'rotate(-90deg)' }"/>
            </div>
        </div>
        <template v-if="extend" v-for="c in data" :key="c.id">
            <FillMaskPanelItem v-if="!c.disabled" :context="context" :data="c" :manager="fillCtxMgr"></FillMaskPanelItem>
        </template>
    </div>
</template>

<style scoped lang="scss">
.container {
    width: 100%;
    padding: 12px 8px;
    box-sizing: border-box;
    height: auto;
    border-bottom: 1px solid #F0F0F0;

    .header {
        display: flex;
        height: 30px;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;

        span {
            font-size: 12px;
            font-weight: 500;
        }

        .down {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            border-radius: var(--default-radius);
            transition: .2s;

            >img {
                width: 14px;
                height: 14px;
            }

            &:hover {
                background-color: #F5F5F5;
            }
        }
    }
}
</style>