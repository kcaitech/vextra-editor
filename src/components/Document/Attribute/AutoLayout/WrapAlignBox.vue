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
    <div class="container" @click="onClick">
        <Tooltip :content="t(`autolayout.${name}`)">
            <div class="box" :style="{ 'justify-content': align }" :class="{ active: show }">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </Tooltip>
    </div>
</template>

<style scoped lang="scss">
.container {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 9;
}
.box {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px;
    padding: 4px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    div {
        width: 4px;
        height: 7px;
        border-radius: 1px;
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