<template>
    <div class="header-container">
        <div class="kc-header">
            <div class="logo" @click="$router.push({ path: '/' })">
                <img class="logo-img" :src=avatar alt="ProtoDesign">
                <span class="logo-text">ProtoDesign</span>
            </div>
            <button class="loginbnt" v-if="!isMobile" type="button" @click.stop="router.push({ name: 'login' })">
                {{ t('system.btn_login') }}
            </button>
        </div>
    </div>
    <div v-if="isMobile" class="phonetips"> {{ t('system.phonetips') }}</div>
    <div class="content-container">
        <slot></slot>
    </div>
    <div class="footer-container">
        <Footer />
    </div>
</template>
<script setup lang="ts">
import avatar from '@/assets/pd-logo-svg.svg'
import { router } from '@/router'
import Footer from './Footer.vue'
import isMobileDevice from '@/utils/mobileDeviceChecker'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
const isMobile = ref(isMobileDevice())

function updateDeviceType() {
    setTimeout(() => {
        isMobile.value = isMobileDevice()
    }, 0)
}

onMounted(() => {
    window.addEventListener('resize', updateDeviceType)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateDeviceType)
})

</script>
<style lang="scss" scoped>
.phonetips {
    position: sticky;
    font-size: 12px;
    font-weight: 600;
    line-height: 40px;
    color: white;
    top: 80px;
    text-align: center;
    background-color: black;
    z-index: 999;
}

.header-container {
    width: 100%;
    background-color: white;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .1);
    display: flex;
    justify-content: center;
    position: fixed;
    z-index: 999;

    .kc-header {
        height: 80px;
        width: 100%;
        max-width: 1200px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .logo {
            display: flex;
            align-items: center;
            cursor: pointer;

            .logo-img {
                width: 80px;
                height: 80px;
            }

            .logo-text {
                font-size: 24px;
                font-weight: 700;
            }
        }

        .loginbnt {
            height: 40px;
            width: 80px;
            border: 1px solid black;
            border-radius: 4px;
            background-color: white;
            cursor: pointer;

            &:hover {
                border: 1px solid #9775fa;
                color: #9775fa;
            }
        }
    }
}

.content-container {
    position: relative;
    top: 80px;
    display: flex;
    justify-content: center;
}


.footer-container {
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 160px;
    position: relative;
    top: 80px;
    background-color: #9775fa;

    .footer {
        position: relative;
    }
}
</style>
