<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
    selected: string;
}>();

const fontWeight = ["Thin", "ExtraLight", "Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold", "Heavy"];
const hovered = ref(-1);
const isSelectList = ref(false);
const transTop = computed(() => {
    const index = fontWeight.indexOf(props.selected);
    return index;
})
const showWeightList = () => {
    isSelectList.value = true;
    document.addEventListener("mousedown", onShowWeightBlur)
}
const onShowWeightBlur = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.font_weight_select')) {
        var timer = setTimeout(() => {
            isSelectList.value = false;
            clearTimeout(timer)
            document.removeEventListener('mousedown', onShowWeightBlur);
        }, 10)
    }
}
const selectItem = (item: string) => {
    isSelectList.value = false;
}
</script>

<template>
    <div class="font_weight jointly-text">
        <div class="font_weight_preview" style="padding-right: 0;" @click="showWeightList">
            <span>{{ selected }}</span>
            <div class="down">
                <svg-icon icon-class="down" style="width: 12px;height: 12px"></svg-icon>
            </div>
        </div>
        <div class="font_weight_select" v-if="isSelectList" :style="{ top: -transTop * 32 - 8 + 'px'}">
            <div class="font_weight_item" v-for="(item, index) in fontWeight" :key="index"
                @mouseenter="() => hovered = index" :class="{ active: hovered === index }" @click="selectItem(item)">
                <div class="icon" v-if="selected === item">
                    <svg-icon :icon-class="hovered === index ? 'white-select' : 'page-select'"></svg-icon>
                </div>
                <div class="icon" v-else></div>
                <span> {{ item }} </span>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.font_weight {
    position: relative;
    box-sizing: border-box;
    width: calc(100% - 88px);
    border-radius: 6px;

    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .font_weight_preview {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        height: 32px;
        box-sizing: border-box;
        border-radius: 6px;

        &:hover {
            background: #EBEBEB;
        }
    }

    .font_weight_select {
        position: absolute;
        width: 100%;
        padding: 8px 0px;
        box-sizing: border-box;
        left: 0px;
        border-radius: 6px;
        background-color: #fff;
        box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
        border: 1px solid #EBEBEB;
        color: #262626;
        z-index: 99;

        .font_weight_item {
            display: flex;
            height: 32px;
            border-radius: 4px;
            align-items: center;

            .icon {
                width: 32px;
                height: 32px;
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

.jointly-text {
    height: 32px;
    border-radius: var(--default-radius);
    background-color: var(--input-background);
    display: flex;
    justify-content: space-between;
    align-items: center;

    >svg {
        width: 16px;
        height: 16px;
        overflow: visible !important;
    }
}

.down {
    height: 12px;
    width: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    margin-right: 8px;
    box-sizing: border-box;

    >svg {
        width: 12px;
        height: 12px;
    }
}

.active {
    background-color: #1878F5;
    color: #fff;
}
</style>