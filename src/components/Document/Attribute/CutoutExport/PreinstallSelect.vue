/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const emits = defineEmits<{
    (e: 'close'): void;
    (e: 'preinstall', v: string): void;
}>();

const defaultItem = () => {
    emits('preinstall', 'default');
    emits('close')
}
const iosPreinstall = () => {
    emits('preinstall', 'ios');
    emits('close')
}
const androidPreinstall = () => {
    emits('preinstall', 'android');
    emits('close')
}
const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.target instanceof Element && !e.target.closest('.per_select_menu') && !e.target.closest('.cutout-preinstall') &&  emits('close');
}
onMounted(() => {
    document.addEventListener('mouseup', handleClick);
})
onUnmounted(() => {
    document.removeEventListener('mouseup', handleClick);
})
</script>

<template>
    <div class="per_select_menu" @mouseup.stop>
        <div class="item" @click="defaultItem">
            <div class="text">{{t('cutoutExport.default')}}</div>
        </div>
        <div class="item" @click="iosPreinstall">
            <div class="text">{{t('cutoutExport.ios_presets')}}</div>
        </div>
        <div class="item" @click="androidPreinstall">
            <div class="text">{{t('cutoutExport.android_presets')}}</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.per_select_menu {
    font-size: var(--font-default-fontsize);
    position: absolute;
    top: 30px;
    left: -96px;
    width: 123px;
    border-radius: 6px;
    background-color: #fff;
    z-index: 100;
    padding: 4px 0;
    border: 1px solid #EBEBEB;
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
    color: #262626;

    .item {
        display: flex;
        align-items: center;
        width: 100%;
        height: 32px;

        .text {
            padding: 0 16px;
        }

        &:hover {
            background-color: #1878F5;
            .text {
                color: #fff;
            }
        }
    }

}

</style>