<script lang="ts" setup>
import SvgIcon from "@/components/common/SvgIcon.vue";
import search_icon from "@/assets/icons/svg/search.svg";
import arrow_icon from "@/assets/icons/svg/arrow-right.svg";
import choose_icon from "@/assets/icons/svg/choose.svg";
import { ref } from "vue";

const listVisible = ref<boolean>(false);
defineProps<{
    list: { value: any, label: string }[];
    type: any;
    value: any;
}>();
const emits = defineEmits(['update:type', 'update:value']);

function change(value: any) {
    emits('update:type', value);
    listVisible.value = false;
}

function input(event: Event) {
    emits('update:value', (event.target as HTMLInputElement).value);
}

function esc(event: Event) {
    (event.target as HTMLInputElement).blur();
}
</script>
<template>
    <div class="search-input-wrapper">
        <div class="icon" @click.stop="listVisible = !listVisible">
            <SvgIcon :icon="search_icon"/>
        </div>
        <div class="filter" @click.stop="listVisible = !listVisible">
            <SvgIcon :icon="arrow_icon"/>
        </div>
        <input v-focus ref="search" type="text" placeholder="搜索样式" @input="input" @keydown.esc="esc">
        <div v-if="listVisible" class="filter-list">
            <div v-for="(item, idx) in list" class="list-item" :key="idx" @click="() => change(item.value)">
                <div class="choose" :style="{ visibility: type === item.value ? 'visible' : 'hidden' }">
                    <SvgIcon :icon="choose_icon"/>
                </div>
                <span> {{ item.label }}</span>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.search-input-wrapper {
    width: 100%;
    background-color: var(--input-background);
    display: flex;
    align-items: center;
    position: relative;
    height: 32px;
    border-radius: 6px;
    border: 1px solid transparent;
    gap: 4px;
    padding: 0 8px;
    box-sizing: border-box;

    .icon, .filter {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 32px;

        img {
            height: 100%;
            width: 14px;
        }
    }

    .filter img {
        rotate: -90deg;
        padding: 1px;
        box-sizing: border-box;
    }

    input {
        flex: 1;
        height: 100%;
        width: 100px;
        outline: none;
        border: none;
        padding: 0;
        background-color: transparent;
        box-sizing: border-box;
    }

    &:has(input:focus) {
        border: 1px solid #1878F5;
    }

    .filter-list {
        position: absolute;
        top: 36px;
        width: 60%;
        left: 0;
        background-color: #fff;
        border: 1px solid #e5e5e5e5;
        border-radius: 4px;
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
        box-sizing: border-box;
        z-index: 9;

        .list-item {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 32px;
            border-radius: 6px;
            box-sizing: border-box;

            .choose {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;

                img {
                    width: 12px;
                    height: 12px;
                }
            }

            &:hover {
                background-color: #F5F5F5;
            }
        }
    }
}
</style>