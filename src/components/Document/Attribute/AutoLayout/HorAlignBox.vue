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
import { useI18n } from "vue-i18n";
import Tooltip from '@/components/common/Tooltip.vue';
const { t } = useI18n();

const props = defineProps<{
    align: string,
    show: boolean,
    name: string
}>();

interface Emits {
    (e: "change"): void;
}

const emits = defineEmits<Emits>();

const onClick = () => {
    emits('change');
}
</script>

<template>
    <div class="conteaner" @click="onClick">
        <Tooltip :content="t(`autolayout.${name}`)">
            <div class="box" :style="{ 'align-items': align }" :class="{ active: show }">
                <div class="left"></div>
                <div class="center"></div>
                <div class="right"></div>
            </div>
        </Tooltip>
    </div>
</template>

<style scoped lang="scss">
.conteaner {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 9;
}
.box {
    display: flex;
    justify-content: center;
    gap: 2px;
    padding: 4px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    .left {
        width: 4px;
        border-radius: 1px;
        height: 10px;
    }

    .center {
        width: 4px;
        border-radius: 1px;
        height: 16px;
    }

    .right {
        width: 4px;
        border-radius: 1px;
        height: 7px;
    }

    &:hover {
        background-color: #fff;

        div {
            background-color: rgba(25, 137, 252, 0.4);
        }
    }
}

.active {
    background-color: #fff;

    div {
        background-color: #1989FC !important;
    }
}
</style>