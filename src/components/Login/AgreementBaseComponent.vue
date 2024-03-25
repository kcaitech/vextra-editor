<template>
    <div style="height: 100%;width: 100%;">
    <div class="header-container">
        <div class="kc-header">
            <div class="logo" @click="$router.go(-1)">
                <img class="logo-img" :src=avatar alt="ProtoDesign">
            </div>
            <button class="loginbnt" v-if="!isMobile" type="button" @click.stop="router.push({ name: 'login' })">
                {{ t('system.btn_login') }}
            </button>
        </div>
    </div>
    <div v-if="isMobile" class="phonetips"> {{ t('system.phonetips') }}</div>
    <div class="content-container" :style="{ top: isMobile ? 96 + 'px' : 56 + 'px' }">
        <slot></slot>
    </div>
    <div class="footer-container" :style="{ top: isMobile ? 96 + 'px' : 56 + 'px' }">
        <Footer />
    </div>
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
let tiemr: any
function updateDeviceType() {
    tiemr = setTimeout(() => {
        isMobile.value = isMobileDevice()
        clearTimeout(tiemr)
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
    position: fixed;
    font-size: 12px;
    font-weight: 600;
    line-height: 40px;
    color: white;
    top: 56px;
    width: 100%;
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
        height: 56px;
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
                width: 160px;
                height: 56px;
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
                border: 1px solid #1878F5;
                color: #1878F5;
            }
        }
    }
}

.content-container {
    position: relative;
    top: 56px;
    display: flex;
    justify-content: center;
}


.footer-container {
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 56px;
    position: relative;
    top: 56px;
    // background-color: #9775fa;

    .footer {
        position: relative;
    }
}
</style>
