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
import unbind_icon from "@/assets/icons/svg/unbind.svg";
import delete_icon from "@/assets/icons/svg/delete.svg";

interface Props {
    active?: boolean;
    disabled?: boolean;
    delete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    active: false,
    delete: true,
    disabled: false,
})

const emits = defineEmits<{
    (e: "delete"): void;
    (e: "unbind"): void;
}>();
</script>

<template>
    <div class="mask-port-wrapper">
        <div class="info-container">
            <div v-bind="$attrs" :class="{ 'info': true, 'disabled': disabled, active }">
                <slot />
            </div>
            <div class="unbind" @click="emits('unbind')">
                <SvgIcon :icon="unbind_icon" />
            </div>
        </div>
        <div v-if="props.delete" class="delete" @click="emits('delete')">
            <SvgIcon :icon="delete_icon" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.mask-port-wrapper {
    width: 100%;
    height: 32px;
    transition: 50ms;
    display: flex;
    align-items: center;
    gap: 8px;

    .info-container {
        flex: 1;
        width: 50px;
        height: 100%;
        display: flex;
        background-color: var(--input-background);
        border-radius: var(--default-radius);
        overflow: hidden;

        .active {
            background-color: #e5e5e5 !important;
        }

        .info {
            flex: 1;
            width: 50px;
            height: 100%;
            transition: 50ms;

            &:hover {
                background-color: #e5e5e5;
            }
        }

        .disabled {
            pointer-events: none;
            opacity: 0.3;
        }

        .unbind {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 28px;
            width: 28px;
            height: 100%;
            transition: 50ms;
            background-color: var(--input-background);

            >img {
                width: 16px;
                height: 16px;
            }

            &:hover {
                background-color: #e5e5e5;
            }
        }
    }

    .delete {
        flex: 0 0 28px;
        width: 28px;
        height: 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: var(--default-radius);
        overflow: hidden;
        transition: 50ms;

        >svg {
            width: 16px;
            height: 16px;
        }

        &:hover {
            background-color: var(--input-background);
        }
    }
}
</style>