<script setup lang="ts">
import { Context } from '@/context';
import { Menu } from '@/context/menu';
import { onMounted, onUnmounted, ref } from 'vue';

interface Props {
    context: Context
    width?: number
    site?: { x: number, y: number }
}

interface Emits {
    (e: 'close'): void
}

const surplusX = ref<number>(0);
const menu = ref<HTMLDivElement>();
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const weak_focus = ref<boolean>(false);

defineExpose({ menu });

function handleClickOutside(event: MouseEvent) {
    event.stopPropagation()
    if (event.target instanceof Element && !event.target.closest('.__context-menu')) {
        props.context.menu.menuMount();

    }
}

function menu_watcher(type: number) {
    if (type === Menu.SHUTDOWN_MENU) {
        emit('close');
    } else if (type === Menu.SHOW_PLACEMENT) {
        weak_focus.value = true;
    } else if (type === Menu.HIDE_PLACEMENT) {
        weak_focus.value = false;
    }
}

//二级菜单距离右侧的距离
if (props.site) {
    surplusX.value = document.documentElement.clientWidth - props.site.x
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
<div ref="menu" class="__context-menu" @mousemove.stop :style="{ width: `${props.width || 196}px` }">
    <div class="header"></div>
    <slot></slot>
    <div class="bottom"></div>
</div>
</template>
<style scoped lang="scss">
.__context-menu {
    position: absolute;
    z-index: 99;
    color: #262626;
    width: 240px;
    min-height: 360px;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.08);
    background-color: #FFFFFF;
    border: 1px solid #EBEBEB;

    cursor: auto !important;

    > .header {
        width: 100%;
        height: 6px;
    }

    > .bottom {
        width: 100%;
        height: 6px;
        align-self: flex-end;
    }
}
</style>
