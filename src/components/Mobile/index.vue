<template>
    <div class="container">
        <div class="header">
            <img src="@/assets/h-logo2.svg" alt="logo">
        </div>
        <div class="main">
            <div v-if="activebnt !== 'about'" class="search">
                <div class="search-input">
                    <div class="s-header">
                        <svg-icon icon-class="search-icon2"></svg-icon>
                    </div>
                    <input type="text" :placeholder="t('system.placeholder')" @focus="router.push({ path: '/search' })">
                </div>
                <div class="notice" @click="router.push({ path: '/message' })">
                    <svg-icon icon-class="m-notice"></svg-icon>
                    <div class="num after" v-if="total > 0" :class="{ after: total > 99 }">{{ total > 99 ? 99 : total }}
                    </div>
                </div>
            </div>
            <div class="content" :style="{ height: activebnt !== 'about' ? 'calc(100% - 54px)' : '100%' }">
                <RouterView></RouterView>
            </div>
        </div>
        <div class="footer">
            <div class="bnt" :class="{ 'bnt-selct': activebnt === item.value }" v-for="(item, index) in bntdata"
                :key=index @click="changetab(item.value)">
                <div class="icon">
                    <svg-icon :icon-class="activebnt === item.value ? item.icon.select : item.icon.normal"></svg-icon>
                </div>
                <div class="label">{{ item.label }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { router } from '@/router';
import { RouterView, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia';
import { useMessage } from './message'

const Data = useMessage()
const { applynum, teamnum } = storeToRefs(Data)
const { getApplyFile, getApplyTeam, getApplyProject, getNoticeTeam, getNoticeProject } = Data
const { t } = useI18n()
const route = useRoute()
const activebnt = ref(route.name?.toString() || 'home')

const bntdata = [
    { label: t('miniprogram.home'), value: 'home', icon: { normal: 'mhome-normal', select: 'mhome-select' } },
    { label: t('miniprogram.my_file'), value: 'file', icon: { normal: 'mfiles-normal', select: 'mfiles-select' } },
    { label: t('miniprogram.team'), value: 'team', icon: { normal: 'mteam-normal', select: 'mteam-select' } },
    { label: t('miniprogram.about'), value: 'about', icon: { normal: 'mabout-normal', select: 'mabout-select' } },
]

const total = computed(() => {
    return applynum.value + teamnum.value ?? 99;
})

const changetab = (tab: string) => {
    activebnt.value = tab;
    router.push({ name: tab })
    sessionStorage.setItem('selectTab', tab);
}

getApplyFile();
getApplyTeam();
getApplyProject();
getNoticeTeam();
getNoticeProject();

let timer: any = null
onMounted(() => {
    timer = setInterval(() => {
        getApplyFile();
        getApplyTeam();
        getApplyProject();
        getNoticeTeam();
        getNoticeProject();
    }, 60000)
})

onUnmounted(() => {
    clearInterval(timer)
})

</script>

<style lang="scss" scoped>
.num {
    position: relative;
    font-size: 10px;
    top: -8px;
    left: 8px;
    min-width: 14px;
    min-height: 14px;
    background-color: red;
    color: #fff;
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.after::after {
    content: '+';
    position: absolute;
    display: block;
    top: -4px;
    left: 16px;
    color: #fff;
}

.search-list {
    position: absolute;
    top: 98px;
    left: 0;
    width: 100%;
    height: calc(100% - 98px);
    padding: 0 14px;
    box-sizing: border-box;
    background-color: #FAFAFA;
    z-index: 1;
}

.bnt-selct {
    color: #262626 !important;
}

.container {
    position: relative;
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
        width: 100%;
        min-height: 44px;
        position: sticky;
        top: 0;
        background-color: #FAFAFA;
        box-sizing: border-box;
        z-index: 1;

        img {
            margin-left: 14px;
            height: 34px;
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
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;

                svg {
                    position: absolute;
                    width: 24px;
                    height: 24px;
                }
            }

        }


        .content {
            position: relative;
            height: calc(100% - 54px)
        }
    }



    .footer {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        position: sticky;
        bottom: 0;
        min-height: 72px;
        font-size: 12px;
        font-weight: 500;
        background-color: #FFFFFF;
        color: #BFBFBF;
        border-width: 1px 0px 0px 0px;
        border-style: solid;
        border-color: #F1F2F2;
        padding: 6px 0 0 0;
        box-sizing: border-box;

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
