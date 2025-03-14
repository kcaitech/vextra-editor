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
import { Context } from '@/context';
import { Menu } from '@/context/menu';
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps<{
    context: Context
    menuItems: any[]
    selectValue: any
    i18n?: boolean
    width: number
}>();
const emits = defineEmits<{
    (e: 'close'): void;
    (e: 'select', index: number): void;
}>();
const selectHoverItem = ref(props.selectValue);
const handleCloseMenu = (e: MouseEvent) => {
    e.stopPropagation();
    e.target instanceof Element && !e.target.closest('.args_select_menu') && !e.target.closest('.export_down-icon') && close();
};

const selectItem = (index: number) => {
    emits('select', index);
    close();
}
const close = () => {
    emits('close');
}
const menu_watcher = (t: number) => {
    if (t === Menu.SHADOW_CUTOUT_ARGS_MENU) {
        close();
    }
}
const argsDialog = ref<HTMLDivElement>();
const genTop = ref(0);
onMounted(() => {
    if (argsDialog.value) {
        const index = props.menuItems.findIndex((item: any) => item === props.selectValue);
        if(index > -1) genTop.value = index * 32;
    }
    props.context.menu.watch(menu_watcher);
    document.addEventListener('mouseup', handleCloseMenu);
});
onUnmounted(() => {
    props.context.menu.unwatch(menu_watcher);
    document.removeEventListener('mouseup', handleCloseMenu);
});

import SvgIcon from '@/components/common/SvgIcon.vue';
import white_select_icon from '@/assets/icons/svg/white-select.svg';
import page_select_icon from '@/assets/icons/svg/page-select.svg';
</script>

<template>
    <div class="args_select_menu" ref="argsDialog" @mouseup.stop
        :style="{ top: -4 - genTop+ 'px', left: 0 + 'px', width: width + 'px' }">
        <div class="item" v-for="(item, index) in menuItems" :key="index"
            :class="{ 'active-item': selectHoverItem === item }" @mouseover="selectHoverItem = item"
            @click="selectItem(index)">
            <div class="text">{{ i18n ? t(`cutoutExport.${item}`) : item }}</div>
            <div class="icon">
                <SvgIcon v-if="selectValue === item" :icon="selectHoverItem === item ? white_select_icon: page_select_icon"/>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.args_select_menu {
    position: absolute;
    top: 0;
    left: 0px;
    border-radius: 6px;
    background-color: #fff;
    z-index: 100;
    padding: 4px 0;
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
    border: 1px solid #EBEBEB;
    color: #262626;
    .item {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 32px;
        padding-left: 10px;

        .icon {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            >svg {
                width: 12px;
                height: 12px;
            }
        }
    }
}

.active-item {
    background-color: #1878F5;

    .text {
        color: #fff;
    }
}
</style>