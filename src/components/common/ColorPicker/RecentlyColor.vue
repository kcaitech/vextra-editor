/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Color, Gradient } from "@kcdesign/data";
import { useI18n } from "vue-i18n";
import { color_recent_storage, parseColorFormStorage } from "@/components/common/ColorPicker/utils";
import ColorBlock from "@/components/common/ColorBlock/Index.vue"
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";

const emits = defineEmits(["change"])

const {t} = useI18n();
const recent = ref<(Color | Gradient)[]>([]);

function init_recent() {
    let r = localStorage.getItem(color_recent_storage);
    r = JSON.parse(r || '[]');
    if (!r?.length) return;
    recent.value = [];
    for (let i = 0; i < r.length; i++) recent.value.push(parseColorFormStorage(r[i]));
}

function setColor(color: Color) {
    const cc: RGBACatch = { R: color.red, G: color.green, B: color.blue, A: color.alpha, position: 1 };
    emits("change", cc);
}

onMounted(init_recent)
</script>

<template>
    <div v-if="recent.length" class="recently-container">
        <div class="header">{{ t('color.recently') }}</div>
        <div class="typical-container">
            <ColorBlock v-for="(c, idx) in recent" :key="idx" :colors="[c as Color]" @click="() => setColor(c as Color)"/>
        </div>
    </div>
</template>

<style scoped lang="scss">
.recently-container {
    width: 100%;
    padding: 12px;
    box-sizing: border-box;
    border-top: 1px solid #EBEBEB;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .header {
        width: 48px;
        height: 14px;
        font-size: 12px;
        font-weight: 500;
        line-height: 14px;
        color: #000000;
    }

    .typical-container {
        display: flex;
        align-items: center;
        gap: 8px;
    }
}
</style>