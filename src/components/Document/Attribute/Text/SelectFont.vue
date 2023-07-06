<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import {ref} from 'vue'
const { t } = useI18n();
const emit = defineEmits<{
    (e: 'setFont', font: string): void
}>()
const prop = defineProps<{
    fontName: string
}>()

const fontList = ref< {
    used: string[],
    ch: string[],
    en: string[]
}>({
    used: [],
    ch: ['宋体','黑体','仿宋','微软雅黑','新宋体','楷体','等线', 'OPPOSans'],
    en: ['Arial','Adobe Arabic', 'Adobe Gothic Std', 'Candara', 'Courier New',
     'Comic Sans MS', 'D-DIN', 'Ink Free', 'Impact', 'Mv Boli']
})

const selectFont = (font: string) => {
    emit('setFont', font)
}

</script>

<template>
    <div class="font-container">
        <div class="search">
            <svg-icon icon-class="search"></svg-icon>
            <input type="text" :placeholder="t('attr.search_for_fonts')" >
        </div>
        <div class="font-scroll">
            <el-scrollbar>
                <span class="font-title">中文字体</span>
                <div class="item" v-for="item in fontList.ch" :key="item" :style="{ fontFamily: item }" @click="selectFont(item)">
                    <div class="choose" :style="{visibility: item == fontName ? 'visible' : 'hidden'}"></div>
                   <span> {{ item }}</span>
                </div>
                <span class="font-title">英文字体</span>
                <div class="item" v-for="item in fontList.en" :key="item" :style="{ fontFamily: item }" @click="selectFont(item)">
                    <div class="choose" :style="{visibility: item == fontName ? 'visible' : 'hidden'}"></div>
                    <span> {{ item }}</span>
                </div>
            </el-scrollbar>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .font-container {
        position: absolute;
        top: 30px;
        right: 22px;
        width: 208;
        height: 300px;
        border-radius: 4px;
        background-color: #fff;
        border: 1px solid #ccc;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 9;
        .search {
            width: auto;
            height: 26px;
            margin: 7px 10px;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            background-color: var(--grey-light);
            padding: 4px var(--default-padding-half);
            border-radius: 4px;

            >svg {
                width: 12px;
                height: 12px;
            }

            >input {
                flex: 1 1 auto;
                border: none;
                outline: none;
                margin-left: 4px;
                background-color: transparent;
                font-size: var(--font-default-fontsize);
            }
        }
        .font-scroll {
            height: 260px;
            .font-title {
                padding: 0 10px;
                margin: 5px 0;
                height: 25px;
            }
            .item {
                display: flex;
                align-items: center;
                height: 25px;
                padding: 0 10px;
                margin: 0;
                &:hover {
                    background-color: var(--input-background);
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
            }
        }
    }
</style>