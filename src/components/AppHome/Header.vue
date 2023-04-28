<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { reactive, toRefs } from 'vue'
const input = ref('')


</script>

<template>
    <div class="header">
        <div class="search">
            <el-icon size="20" class="icon">
                <Search />
            </el-icon><input class="input" type="search" placeholder="搜索文件" />
        </div>
        <div class="right">
            <div class="about">
                <span>关于</span>
                <div class="about-items">
                    <a href="#">帮助手册</a>
                    <el-divider class="fgx" />
                    <a href="#">关于软件</a>
                </div>
            </div>
            <div>
                <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.header {
    width: calc(100vw - 381px - 50px);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;

    .search {
        display: flex;
        flex-direction: row;
        align-items: center;
        background: rgba(217, 217, 217, 0.67);
        width: 550px;
        height: 45px;
        border-radius: 20px;

        .input {
            width: 550px;
            height: 45px;
            margin: 0;
            outline: none;
            border: none;
            background: none;
        }

        .icon {
            margin: auto 10px;
        }
    }

    .right {
        display: flex;
        flex-direction: row;
        align-items: center;

        .about {
            margin-right: 10px;
            position: relative;
            display: inline-block;

            .about-items {
                display: none;
                position: absolute;
                right: -40px;
                background-color: #f9f9f9;
                min-width: 80px;
                box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
                padding: 12px 16px;
                z-index: 99;

                .fgx {
                    margin: 10px 0 10px 0;

                }

                a {
                    margin-left: 10px;

                }
            }

            &:hover .about-items {
                display: block;
            } &:hover span {
                background: rgba(217, 217, 217, 0.67);
            }
        }
        span{
            display: inline-block;
            width: 40px;
            text-align: center;
            &:hover{
                background: rgba(217, 217, 217, 0.67);
            }
        }

    }
}</style>