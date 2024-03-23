<template>
    <div class="container">
        <div class="header">
            <img src="../../assets/mlogo.svg" alt="logo">
        </div>
        <div class="main">
            <div class="search">
                <div class="search-input">
                    <div class="s-header">
                        <svg-icon icon-class="search-icon2"></svg-icon>
                    </div>
                    <input type="text" placeholder="搜索文件" v-model="inputvalue">
                    <div v-if="inputvalue.trim()" class="s-footer" @click="inputvalue = ''">
                        <svg-icon icon-class="close"></svg-icon>
                    </div>
                </div>
                <div class="notice">
                    <svg-icon icon-class="m-notice"></svg-icon>
                </div>
            </div>
            <div class="content">
                <component :is="tabs.get(activebnt)||Home"></component>
            </div>
        </div>
        <div class="footer">
            <div class="bnt" :class="{ 'bnt-selct': activebnt === item.value }" v-for="(item, index) in bntdata"
                :key=index @click="activebnt = item.value">
                <div class="icon">
                    <svg-icon :icon-class="activebnt === item.value ? item.icon.select : item.icon.normal"></svg-icon>
                </div>
                <div class="label">{{ item.label }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Home from './HomePage.vue';
import MyFile from './MyFile.vue';
import Team from './Team.vue';
import About from './About.vue';
import { ref } from 'vue';

const bntdata = [
    { label: '首页', value: 'Home', icon: { normal: 'mhome-normal', select: 'mhome-select' } },
    { label: '我的文件', value: 'MyFiles', icon: { normal: 'mfiles-normal', select: 'mfiles-select' } },
    { label: '团队', value: 'Team', icon: { normal: 'mteam-normal', select: 'mteam-select' } },
    { label: '我的', value: 'About', icon: { normal: 'mabout-normal', select: 'mabout-select' } },
]

const activebnt = ref('Home')
const inputvalue = ref<string>('')

const tabs = new Map([
    ['Home', Home],
    ['MyFiles', MyFile],
    ['Team', Team],
    ['About', About],
]);

</script>

<style lang="scss" scoped>
.bnt-selct {
    color: #262626 !important;
}

.container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background-color: #FAFAFA;
    overflow: hidden;

    .header {
        display: flex;
        align-items: center;
        padding: 0 14px;
        width: 100%;
        min-height: 44px;
        position: sticky;
        top: 0;
        background-color: #FAFAFA;
        box-sizing: border-box;
        z-index: 1;

        img {
            width: 165px;
            height: 24px;
        }
    }

    .main {
        flex: 1;
        overflow: hidden;
        position: relative;

        .search {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding: 0 14px;
            position: sticky;
            width: 100%;
            height: 54px;
            background-color: #FAFAFA;
            box-sizing: border-box;
            z-index: 1;

            .search-input {
                flex: 80%;
                display: flex;
                align-items: center;
                height: 34px;
                border-radius: 8px;
                background: #FFFFFF;
                box-sizing: border-box;
                border: 1px solid #F5F5F5;

                &:focus-within {
                    border-color: rgba(24, 120, 245, 1);
                }

                .s-header,
                .s-footer {
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 8px;

                    svg {
                        width: 100%;
                        height: 100%;
                    }

                }

                input {
                    flex: 1;
                    height: 100%;
                    outline: none;
                    border: none;
                    background-color: initial;
                    padding: 0;
                    box-sizing: border-box;
                }
            }

            .notice {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;

                svg {
                    width: 100%;
                    height: 100%;
                }
            }

        }


        .content {
            height: calc(100% - 54px)
        }
    }



    .footer {
        display: flex;
        justify-content: space-between;
        position: sticky;
        bottom: 0;
        min-height: 58px;
        font-size: 10px;
        font-weight: 500;
        background-color: #FFFFFF;
        color: #BFBFBF;
        border-width: 1px 0px 0px 0px;
        border-style: solid;
        border-color: #F1F2F2;

        .bnt {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            .icon {
                width: 24px;
                height: 24px;

                svg {
                    width: 100%;
                    height: 100%;
                }
            }

        }
    }
}
</style>
