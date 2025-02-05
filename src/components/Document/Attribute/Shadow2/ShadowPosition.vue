<script setup lang="ts">
import { Context } from '@/context';
import { Menu } from '@/context/menu';
import { hidden_selection } from '@/utils/content';
import { ShadowPosition } from '@kcdesign/data';
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps<{
    context: Context;
    manager: ShadowsContextMgr;
    data: ShadowCatch;
}>();
const isMenu = ref(false);
const activeItem = ref(props.data.shadow.position);
const showMenu = () => {
    if (isMenu.value) return isMenu.value = false;
    activeItem.value = props.data.shadow.position;
    props.context.menu.shadowPositionMenu();
    isMenu.value = true;
    document.addEventListener('click', handleClick);
}

const togglePositinon = (position: ShadowPosition) => {
    props.manager.modifyShadowPosition(props.data.shadow, position);
    close();
    hidden_selection(props.context);
}

const close = () => {
    isMenu.value = false;
    document.removeEventListener('click', handleClick);
}

const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.target instanceof Element && !e.target.closest('.shadow-position') && close();
}

const menu_watcher = (t: number) => {
    if (t === Menu.SHADOW_POSITION_MENU) {
        close();
    }
}

onMounted(() => {
    props.context.menu.watch(menu_watcher);
})
onUnmounted(() => {
    props.context.menu.unwatch(menu_watcher);
})

import down_icon from '@/assets/icons/svg/down.svg';
import white_select_icon from '@/assets/icons/svg/white-select.svg';
import page_select_icon from '@/assets/icons/svg/page-select.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { ShadowCatch, ShadowsContextMgr } from './ctx';

</script>

<template>
    <div class="shadow-position">
        <div class="context" @click.stop="showMenu">{{ t(`shadow.${data.shadow.position}`) }}</div>
        <div class="down" @click.stop="showMenu" :class="{ 'active-down': isMenu }">
            <SvgIcon :icon="down_icon" />
        </div>
        <div class="select_menu" v-if="isMenu"
            :style="{ top: data.shadow.position === ShadowPosition.Outer ? -4 + 'px' : -32 + 'px' }">
            <div class="item" @click="togglePositinon(ShadowPosition.Outer)"
                @mouseenter="activeItem = ShadowPosition.Outer"
                :class="{ 'active-item': activeItem === ShadowPosition.Outer }">
                <div class="text">{{ t(`shadow.outer`) }}</div>
                <div class="icon">
                    <SvgIcon v-if="data.shadow.position === ShadowPosition.Outer"
                        :icon="activeItem === ShadowPosition.Outer ? white_select_icon : page_select_icon" />
                </div>
            </div>
            <div class="item" @click="togglePositinon(ShadowPosition.Inner)"
                @mouseenter="activeItem = ShadowPosition.Inner"
                :class="{ 'active-item': activeItem === ShadowPosition.Inner }">
                <div class="text">{{ t(`shadow.inner`) }}</div>
                <div class="icon">
                    <SvgIcon v-if="data.shadow.position === ShadowPosition.Inner"
                        :icon="activeItem === ShadowPosition.Inner ? white_select_icon : page_select_icon" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.shadow-position {
    font-size: 12px;
    position: relative;
    background-color: #F4F5F5;
    height: 32px;
    border-radius: var(--default-radius);
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding: 9px 8px;
    color: #000000;

    &:hover {
        .down {
            background-color: rgba(0, 0, 0, 0.09);
        }
    }

    .context {
        flex: 1;
        height: 100%;
        display: flex;
        align-items: center;
    }

    .down {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        // margin-right: 3px;
        display: flex;
        align-items: center;
        justify-content: center;

        >svg {
            width: 12px;
            height: 12px;
        }
    }

    .select_menu {
        position: absolute;
        left: 0px;
        width: 100%;
        border-radius: 4px;
        background-color: #fff;
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
        z-index: 100;
        padding: 4px 0;

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
}

.active-down {
    background-color: rgba(0, 0, 0, 0.09);
}

.active-item {
    background-color: var(--active-color);

    >.icon {
        >.choose {
            border-color: #fff;
        }
    }

    .text {
        color: #fff;
    }
}
</style>