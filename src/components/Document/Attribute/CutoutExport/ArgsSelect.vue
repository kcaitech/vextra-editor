<script setup lang="ts">
import { Context } from '@/context';
import { Menu } from '@/context/menu';
import { onMounted, onUnmounted, ref } from 'vue';
const props = defineProps<{
    context: Context
    menuItems: string[]
    selectValue: string
}>();
const emits = defineEmits<{
    (e: 'close'): void;
    (e:'select', index: number): void;
}>();
const selectHoverItem = ref(props.selectValue);
const handleCloseMenu = (e: MouseEvent) => {
    e.stopPropagation();
    e.target instanceof Element && !e.target.closest('.args_select_menu') && close();
};

const selectItem = (index: number) => {
    emits('select', index);
    close();
}
const close = () => {
    emits('close');
}
const menu_watcher = (t: number) => {
    if(t === Menu.SHADOW_CUTOUT_ARGS_MENU) {
        close();
    }
}

onMounted(() => {
    props.context.menu.watch(menu_watcher);
    document.addEventListener('click', handleCloseMenu);
});
onUnmounted(() => {
    props.context.menu.unwatch(menu_watcher);
    document.removeEventListener('click', handleCloseMenu);
});
</script>

<template>
    <div class="args_select_menu" @click.stop>
        <div class="item" v-for="(item, index) in menuItems" :key="index" :class="{ 'active-item': selectHoverItem === item }" @mouseover="selectHoverItem = item" @click="selectItem(index)">
            <div class="icon">
                <div class="choose" v-if="selectValue === item"></div>
            </div>
            <div class="text">{{ item }}</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.args_select_menu {
    position: absolute;
    top: 32px;
    right: 0px;
    width: 100px;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
    z-index: 100;
    padding: 10px 0;

    .item {
        display: flex;
        align-items: center;
        width: 100%;
        height: 30px;

        .icon {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 3px;
        }
    }

    .choose {
        box-sizing: border-box;
        width: 10px;
        height: 6px;
        margin-left: 2px;
        border-width: 0 0 1px 1px;
        border-style: solid;
        border-color: rgb(0, 0, 0, .75);
        transform: rotate(-45deg) translateY(-30%);
    }
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