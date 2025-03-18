/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import select_icon from "@/assets/icons/svg/select.svg";
import SvgIcon from "@/components/common/SvgIcon.vue";

defineProps<{ check: boolean }>();
const emits = defineEmits<{
    (e: 'change'): void;
}>();
</script>
<template>
    <div :class="`display ${check ? 'visibility' : 'hidden'}`" @click="emits('change')">
        <SvgIcon v-if="check" :icon="select_icon"/>
    </div>
</template>
<style lang="scss" scoped>
div {
    flex: 0 0 14px;
    width: 14px;
    height: 14px;
    border-radius: 4px;
}

.visibility {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--active-color);
    color: #ffffff;

    > img {
        width: 60%;
        height: 60%;
    }
}

.hidden {
    background: #FFFFFF;
    border: 1px solid #EBEBEB;
    box-sizing: border-box;
}

</style>