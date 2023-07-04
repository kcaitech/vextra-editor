<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
    <div class="font-container">
        <div class="search">
            <svg-icon icon-class="search"></svg-icon>
            <input type="text" :placeholder="'搜索字体…'" >
        </div>
        <div class="font-scroll">
            <el-scrollbar>
                <p class="item" v-for="item in 20" :key="item">{{ item }}</p>
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
            .item {
                padding: 0 10px;
            }
        }
    }
</style>