<script  setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
const props = defineProps<{
    width: string
    top: number
    menuItems: string[]
}>()
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
onMounted(() => {
    document.addEventListener('click', close);
})
onUnmounted(() => {
    document.removeEventListener('click', close);
})
</script>

<template>
    <div class="select_menu" :style="{width: width, top: top + 'px'}">
        <div class="untie" @click="clickItem(index)" v-for="(item, index) in menuItems" :key="index">
            <span>{{ item }}</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.select_menu {
    position: absolute;
    right: 0;
    padding: 10px 0;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
    z-index: 100;

    .untie {
        height: 30px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        box-sizing: border-box;

        &:hover {
            background-color: var(--active-color);
            color: #fff;
        }
    }
}
</style>