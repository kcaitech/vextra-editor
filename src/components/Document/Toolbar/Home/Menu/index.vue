<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue';
import { Context } from '@/context';
import SvgIcon from "@/components/common/SvgIcon.vue";
import ExportVue from "./Export.vue"
import ExportDocView from "./ExportDoc.vue"

interface Props {
    context: Context,
    params: any,
    site?: { x: number, y: number }
}

const props = defineProps<Props>();
const popoverVisible = ref<boolean>(false);
const trigger = ref<HTMLDivElement>(); // 按钮 Dom
const popover = ref<HTMLDivElement>(); // 菜单 Dom
/**
 * @description 打开菜单，根据按钮位置确定菜单位置
 */
function showMenu(e: MouseEvent) {
    if (popoverVisible.value) return popoverVisible.value = false;
    if (!trigger.value) return;
    const el = trigger.value;
    popoverVisible.value = true;
    nextTick(() => {
        if (!popover.value) return;
        popover.value.style.left = el.offsetLeft + 'px';
        popover.value.style.top = el.offsetHeight + 6 + 'px';
    })
}

/**
 * @description 检测菜单是否失去焦点，若失去则关闭菜单
 */
function onMenuBlur(e: MouseEvent) {
    if (e.target instanceof Element && !e.target.closest('.popover-f, .icon-for-trigger')) popoverVisible.value = false;
}

const plugins = props.context.pluginsMgr.search2('toolbar.home.menu');
const comps: { component: any, params?: any }[] = []
comps.push(...plugins.begin.slice(0, 2))
comps.push({ component: ExportDocView }, { component: ExportVue })
comps.push(...plugins.begin.slice(2, 3))
comps.push(...plugins.end)

function close() {
    popoverVisible.value = false;
}

const stop = watch(() => popoverVisible.value, (v) => {
    if (v) {
        document.addEventListener('click', onMenuBlur);
        props.context.escstack.save('menu-items', () => {
            const achieve = popoverVisible.value;
            popoverVisible.value = false;
            return achieve;
        })
    } else {
        document.removeEventListener('click', onMenuBlur);
    }
})
onUnmounted(() => {
    stop();
    document.removeEventListener('click', onMenuBlur);
})
import menu_icon from '@/assets/icons/svg/menu.svg';
</script>
<template>
<div class="icon-for-trigger" :class="{ active: popoverVisible }" @click="showMenu" ref="trigger">
    <SvgIcon :icon="menu_icon"/>
</div>
<div v-if="popoverVisible" ref="popover" class="popover-f">
    <component v-for="c in comps" :is=c.component :context="props.context" :params="c.params" @close="close"/>
</div>
</template>
<style scoped lang="scss">
.active {
    background-color: rgba(255, 255, 255, 0.1);
}

.icon-for-trigger {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 32px;
    cursor: pointer;

    >svg {
        width: 18px;
        height: 18px;
        color: #FFFFFF;
    }
}

.icon-for-trigger:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.popover-f {
    position: absolute;
    color: #ffffff;
    z-index: 999;
    width: 136px;
    height: auto;
    font-size: var(--font-default-fontsize);
    background-color: #262626;
    border-radius: 4px;
    outline: none;
    padding: 4px 0;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.08);

    >div,
    >span {
        position: relative;
        width: 100%;
        height: 32px;
        padding: 9px 0 9px 28px;
        display: flex;
        flex-direction: row;
        align-items: center;
        box-sizing: border-box;

        &:hover {
            background-color: var(--active-color);
        }
    }

    >.disabled {
        opacity: 0.4;
        pointer-events: none;
    }
}
</style>