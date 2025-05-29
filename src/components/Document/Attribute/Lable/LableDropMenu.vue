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
import { Context } from '@/context';
import { Menu } from '@/context/menu';
import { locale } from '@/locale';
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
    Items: string[],
    pxItems?: string[],
    choose: number,
    choose2?: number,
    context: Context
}>()
const emit = defineEmits<{
    (e:'close'): void
    (e: 'listMenuStatus', index: number): void
    (e: 'pxMenuStatus', index: number): void
}>()
const i = ref('')
const unit = ['pt', 'px', 'dp', 'rpx']

const hoverShape = (e: MouseEvent, item: string) => {
    e.stopPropagation()
    i.value = item
}

const unHoverShape = (e: MouseEvent) => {
    e.stopPropagation()
    i.value = ''
}
const handleClick = (e: Event) => {
  e.stopPropagation()
  e.target instanceof Element && !e.target.closest('.lablemenu-container') && emit('close');
}

const onClick = (index: number) => {
    emit('listMenuStatus', index)
    emit('close');
}
const onPxClick = (index: number) => {
    emit('pxMenuStatus', index)
    emit('close');
}
function menu_watcher(type: number) {
  if (type === Menu.SHUTDOWN_LABLE_MENU) {
    emit('close');
  }
}
onMounted(() => {  
    props.context.menu.watch(menu_watcher)
  document.addEventListener('click', handleClick);
})

onUnmounted(() => {
  document.removeEventListener('click', handleClick);
  props.context.menu.unwatch(menu_watcher)
})
</script>

<template>
    <div class="lablemenu-container" :lang="locale">
        <template v-for="(item, index) in props.Items" :key="index">
            <div class="menu-item" :class="{active: i === item}" @mouseenter="(e: MouseEvent) => hoverShape(e, item)" @mouseleave="(e: MouseEvent) => unHoverShape(e)" @click.stop="onClick(index)">
                <div class="choose" :style="{visibility: choose === index ? 'visible' : 'hidden'}" :class="{choose_active: i === item}"></div>
                <div class="text">
                    <span>{{ item }}</span>
                    <span v-if="pxItems">{{ unit[index] }}</span>
                </div>
            </div>
        </template>
        <div class="line" v-if="props.pxItems"></div>
        <template v-for="(item, index) in props.pxItems" :key="index">
            <div class="menu-item" :class="{active: i === item}" @mouseenter="(e: MouseEvent) => hoverShape(e, item)" @mouseleave="(e: MouseEvent) => unHoverShape(e)" @click.stop="onPxClick(index)">
                <div class="choose" :style="{visibility: choose2 === index ? 'visible' : 'hidden'}" :class="{choose_active: i === item}"></div>
                <div style="font-weight: 500">{{ item }}</div>
            </div>
        </template>
    </div>
</template>

<style scoped lang="scss">
    .lablemenu-container {
        position: absolute;
        top: 32px;
        right: 0;
        width: 154px;
        min-width: 75px;
        font-size: var(--font-default-fontsize);
        padding: 4px 0;
        background-color: #fff;
        border: 1px solid #EBEBEB;
        border-radius: 8px;
        box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
        z-index: 99;
        text-wrap: nowrap;

        :lang(en) {
            font-size: 11px;
        }
    }
    .menu-item {
        display: flex;
        align-items: center;
        height: 32px;
        padding: 0 12px 0 8px;
        .text {
            flex: 1;
            display: flex;
            justify-content: space-between;
            font-weight: 500;
        }
        
    }
    .choose {
        box-sizing: border-box;
        width: 10px;
        height: 6px;
        margin-right: 10px;
        margin-left: 2px;
        border-width: 0 0 1px 1px;
        border-style: solid;
        border-color: rgb(0, 0, 0,.75);
        transform: rotate(-45deg) translateY(-30%);
    }
    .line {
        width: 100%;
        height: 4px;
        border-width: 3px 0 0 0;
        border-style: solid;
        border-color: #fff;
        box-sizing: border-box;
        background-color: #EBEBEB;
    }
    .active {
        background-color: var(--active-color);
        color: #fff;
    }
    .choose_active {
        border-color:rgb(255,255,255,.8)
    }
</style>