<script  setup lang="ts">
import { Context } from '@/context';
import { Menu } from '@/context/menu';
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from "vue-i18n";
const props = defineProps<{
    width: string
    top: number
    menuItems: string[]
    menuIndex?: number
    context: Context
}>()
const { t } = useI18n();
const emit = defineEmits<{
    (e: 'selectIndex', index: number): void
    (e: 'close'): void
}>()
const clickItem = (index: number) => {
    emit('selectIndex', index)
}
const close = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.target instanceof Element && !e.target.closest('.select_menu')) {
        emit('close');
    }
}
const isActive = ref(props.menuIndex);
const hoverColor = (index: number) => {
    isActive.value = index;
}
const menu_watcher = (t: number) => {
    if (t === Menu.CLOSE_COMP_MENU) {
        emit('close');
    }
}
onMounted(() => {
    document.addEventListener('click', close);
    props.context.menu.watch(menu_watcher);
})
onUnmounted(() => {
    document.removeEventListener('click', close);
    props.context.menu.unwatch(menu_watcher);

})
</script>

<template>
    <div class="select_menu" :style="{ width: width, top: top + 'px' }">
        <div class="untie" @click="clickItem(index)" v-for="(item, index) in menuItems" :key="index"
            @mouseenter="hoverColor(index)" :class="{ active: isActive === index }">
            <span v-if="item !== 'add_new_value' || index !== menuItems.length - 1">{{ item }}</span>
            <span v-if="item === 'add_new_value' && index === menuItems.length - 1">{{ t('compos.add_new') }}</span>
            <div class="choose" :style="{ borderColor: isActive === index ? '#fff' : '' }"></div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.select_menu {
    position: absolute;
    right: 0;
    padding: 4px 0;
    background-color: #fff;
    border: 1px solid #EBEBEB;
    border-radius: 6px;
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
    z-index: 100;

    .untie {
        height: 30px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        box-sizing: border-box;

        span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        // &:hover {
        //     background-color: var(--active-color);
        //     color: #fff;
        // }

        .choose {
            box-sizing: border-box;
            width: 10px;
            height: 6px;
            margin-right: 4px;
            margin-left: 2px;
            border-width: 0 0 0.1em 0.1em;
            border-style: solid;
            border-color: rgb(0, 0, 0, .75);
            transform: rotate(-45deg) translateY(-30%);
        }
    }
}

.active {
    background-color: var(--active-color);
    color: #fff;
}
</style>