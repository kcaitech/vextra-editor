<template>
    <div class="about">
        <div class="user">
            <div class="avatar">
                <img v-if="circleUrl" :src="circleUrl!" alt="avatar">
                <span v-else>{{ uname?.slice(0, 1) }}</span>
            </div>
            <div class="info">
                <span class="name">{{ uname }}</span>
                <span class="id">ID:{{ id }}</span>
            </div>
        </div>
        <div class="other">
            <div class="item" v-for="item in data" :key="item.id" @click="goto(item.name)">
                <div class="left">
                    <svg-icon :icon-class="item.icon"></svg-icon>
                </div>
                <div class="right" :style="{ borderBottom: item.id !== data.length ? '1px solid #F5F5F5' : '' }">
                    <span class="title">{{ item.value }}</span>
                    <svg-icon icon-class="arrows-icon"></svg-icon>
                </div>
            </div>
        </div>
        <!-- <button @click="OutLogin">退出登录</button> -->
    </div>



</template>

<script setup lang="ts">
import { onMounted, reactive, ref, toRefs } from 'vue'
import { router } from '@/router'
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const state = reactive({
    circleUrl: localStorage.getItem('avatar'),
    uname: localStorage.getItem('nickname'),
    id: localStorage.getItem('userId')
})
const { circleUrl, uname, id } = toRefs(state)
const data = ref([
    { id: 1, value: t('miniprogram.privacy'), icon: 'ys-icon', name: 'privacy' },
    { id: 2, value: t('miniprogram.serve'), icon: 'fw-icon', name: 'agreements' }
])

const goto = (name: string) => {
    let miniprogram: any;
    miniprogram = navigator.userAgent.includes('miniProgram')
    if (miniprogram) {
        (window as any).wx.miniProgram.navigateTo({
            url: `/pages/index1/index?go=${name}`,
        });
    } else {
        router.push({ name: name })
    }
}

const OutLogin = () => {
    localStorage.clear();
    let miniprogram: any;
    miniprogram = navigator.userAgent.includes('miniProgram')
    if (miniprogram) {
        (window as any).wx.miniProgram.postMessage({
            data: {
                login: false,
            }
        });
        (window as any).wx.miniProgram.redirectTo({
            url: '/pages/index/index',
        });
    }
}


onMounted(() => {

})

</script>

<style lang="scss" scoped>
.about {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .user {
        display: flex;
        align-items: center;
        gap: 16px;
        height: 94px;
        margin: 0 14px;
        padding: 0 4px;
        box-sizing: border-box;


        .avatar {
            width: 70px;
            height: 70px;

            img {
                width: 100%;
                height: 100%;
                border-radius: 100%;
            }
        }

        .info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 9px;

            .name {
                font-size: 18px;
                font-weight: 500;
                color: #262626;
            }

            .id {
                font-size: 13px;
                font-weight: 400;
                color: #8C8C8C;
            }
        }
    }

    .other {
        margin: 0 14px;
        padding: 4px 0;
        border-radius: 6px;
        background: #FFFFFF;
        box-sizing: border-box;
        border: 1px solid #F1F2F2;
        box-shadow: inset 0px -1px 0px 0px #F0F0F0;

        .item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            height: 64px;
            padding: 0 20px 0 24px;
            box-sizing: border-box;

            .left {
                display: flex;
                align-items: center;

                svg {
                    width: 20px;
                    height: 20px;

                }
            }

            .right {
                flex: 1;
                height: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;

                span {
                    line-height: 20px;
                    font-size: 14px;
                    font-weight: 400;
                    color: #000000;
                }

                svg {
                    margin-right: 8px;
                    width: 10px;
                    height: 10px;
                }
            }
        }
    }

    button {
        outline: none;
        border: none;
        margin: 0 14px;
        border-radius: 6px;
        height: 44px;
        background-color: #18f;
        color: white;
        font-size: 14px;
    }
}
</style>
