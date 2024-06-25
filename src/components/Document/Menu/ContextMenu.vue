<script setup lang="ts">
import { Context } from '@/context';
import { Menu } from '@/context/menu';
import { onMounted, onUnmounted, ref } from 'vue';
import Key from "@/components/common/Key.vue";
import { MenuItemType } from "@/components/Document/Menu/index";
import { useI18n } from "vue-i18n";

interface Props {
    context: Context;
    site: { x: number, y: number };
    items: Set<MenuItemType>;

    width?: number;
}

interface Emits {
    (e: 'close'): void
}

const menu = ref<HTMLDivElement>();
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const weak_focus = ref<boolean>(false);
const { t } = useI18n();

defineExpose({ menu });

function handleClickOutside(event: MouseEvent) {
    event.stopPropagation()

    if (event.target instanceof Element && !event.target.closest('.__context-menu')) {
        props.context.menu.menuMount();
    }
}

function menu_watcher(type: number) {
    if (type === Menu.SHUTDOWN_MENU) {
        emits('close');
    } else if (type === Menu.SHOW_PLACEMENT) {
        weak_focus.value = true;
    } else if (type === Menu.HIDE_PLACEMENT) {
        weak_focus.value = false;
    }
}

onMounted(() => {
    props.context.menu.watch(menu_watcher)
    document.addEventListener('mousedown', handleClickOutside);
})
onUnmounted(() => {
    props.context.menu.unwatch(menu_watcher);
    document.removeEventListener('mousedown', handleClickOutside);
})
</script>
<template>
<div
    ref="menu"
    class="__context-menu"
    :style="{ width: `${width || 196}px` }"
    @mousedown.stop
    @mousemove.stop
    @click.stop
>
    <div class="header"/>
    <div v-if="items.has(MenuItemType.All)"
         class="menu-item">
        <span>{{ t('system.select_all') }}</span>
        <Key code="Ctrl A"/>
    </div>
    <div v-if="items.has(MenuItemType.PasteHere)"
         class="menu-item">
        <span>粘贴在这里</span>
    </div>
    <div style="width: 100%; height: 1px; border-bottom: 1px solid #efefef; margin: 3px 0"/>
    <div v-if="items.has(MenuItemType.Half)"
         class="menu-item">
        <span>50%</span>
    </div>
    <div v-if="items.has(MenuItemType.Hundred)"
         class="menu-item">
        <span>100%</span>
        <Key code="Ctrl 0"/>
    </div>
    <div v-if="items.has(MenuItemType.Double)"
         class="menu-item">
        <span>200%</span>
    </div>
    <div v-if="items.has(MenuItemType.Canvas)"
         class="menu-item">
        <span>适应画布</span>
    </div>
    <div class="bottom"/>
</div>
</template>
<style scoped lang="scss">
.__context-menu {
    position: absolute;
    z-index: 99;

    width: 240px;
    border-radius: 2px;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.08);
    background-color: #FFFFFF;
    border: 1px solid #EBEBEB;
    box-sizing: border-box;

    cursor: auto !important;

    > .header {
        width: 100%;
        height: 6px;
    }

    > .menu-item {
        width: 100%;
        height: 32px;
        background-color: #FFF;
        color: #000;

        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 0 16px 0 28px;
        font-size: var(--font-default-fontsize);

        box-sizing: border-box;

        transition: 50ms;
    }

    > .menu-item:hover {
        background-color: var(--active-color);
        color: #FFF;
    }

    > .bottom {
        width: 100%;
        height: 6px;
    }
}
</style>
