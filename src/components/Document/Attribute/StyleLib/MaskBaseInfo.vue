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
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { name, desc } = defineProps<{
    name: string;
    desc: string;
}>();
const emits = defineEmits(["modifyName", "modifyDesc", "changeNameInput", "changeDescInput"]);

function blur(event: KeyboardEvent) {
    (event.target as HTMLInputElement).blur();
}

function modifyName(event: Event) {
    const target = event.target as HTMLInputElement;
    emits("modifyName", (event.target as HTMLInputElement).value);
    target.blur();
}

function modifyDesc(event: Event) {
    const target = event.target as HTMLInputElement;
    emits("modifyDesc", (event.target as HTMLInputElement).value);
    target.blur();
}

function changeNameInput(event: Event) {
    emits("changeNameInput", (event.target as HTMLInputElement).value);
}

function changeDescInput(event: Event) {
    emits("changeDescInput", (event.target as HTMLInputElement).value);
}

</script>
<template>
    <div class="detail">
        <div class="name">
            <label for="name">{{ t('stylelib.name') }}</label>
            <input v-focus type="text" id="name" :value="name" @change="modifyName" @input="changeNameInput"
                @keydown.esc="blur" autocomplete="off">
        </div>
        <div class="des">
            <label for="des">{{ t('stylelib.description') }}</label>
            <input type="text" id="des" :value="desc" @change="modifyDesc" @input="changeDescInput" @keydown.esc="blur"
                autocomplete="off">
        </div>
    </div>
</template>
<style scoped lang="scss">
.detail {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 8px;
    box-sizing: border-box;

    .name,
    .des {
        display: flex;
        align-items: center;
        height: 32px;
        gap: 8px;

        input {
            flex: 1;
            outline: none;
            font-size: 12px;
            padding: 10px 8px;
            height: 32px;
            border-radius: 6px;
            border: 1px solid transparent;
            background-color: #F5F5F5;
            box-sizing: border-box;

            &:focus {
                border: 1px solid #1878f5;
            }
        }
    }
}
</style>