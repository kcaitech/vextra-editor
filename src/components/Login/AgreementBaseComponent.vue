<template>
    <div class="container">
        <div class="header-container">
            <div class="kc-header">
                <div class="logo" @click="router.go(-1)">
                    <img class="logo-img" :src="avatar" alt="MossDesign">
                </div>
                <button class="loginbnt" type="button" @click.stop="router.push({ name: 'login' })">
                    {{ t('system.btn_login') }}
                </button>
            </div>
        </div>
        <div class="content-container">
            <slot></slot>
        </div>
        <div class="footer-container">
            <Footer/>
        </div>
    </div>
</template>
<script setup lang="ts">
import avatar from '@/assets/h-logo3.svg'
import { router } from '@/router'
import Footer from './Footer.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n();


</script>
<style lang="scss" scoped>


.container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    .header-container {
        flex: 0 0 56px;
        width: 100%;
        background-color: white;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .1);
        display: flex;
        justify-content: center;
        position: sticky;
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
                    width: 200px;
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
        flex: 1;
        position: relative;
        display: flex;
        justify-content: center;
        overflow: auto;

    }

    .footer-container {
        flex: 0 0 56px;
        width: 100%;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        height: 56px;
        position: relative;

        .footer {
            position: relative;
        }
    }
}

</style>
