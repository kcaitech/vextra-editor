<template>
    <div class="header">
        <div class="header-left">
            <div class="logo" @click="router.go(-1)">
                <img class="logo-img" :src="avatar" alt="墨师设计">
            </div>
        </div>
        <div class="header-right">
            <div class="login-bnt">
                <button class="loginbnt" type="button" @click.stop="router.push({ name: 'login' })">
                    {{ t('system.btn_login') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import avatar from '@/assets/h-logo3.svg'
import { router } from '@/router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.header {
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 30%;
    position: sticky;
    top: 0;
    width: 100%;
    height: 64px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(15px);
    --webkit-backdrop-filter: blur(15px);
    border-bottom: 1px solid #FAFAFA;
    z-index: 999;

    .header-left {}

    .header-right {
        .login-bnt {
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
}


</style>
