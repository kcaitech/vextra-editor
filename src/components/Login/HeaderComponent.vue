<template>
    <div class="header-container">
        <div class="header">
            <div class="header-left">
                <div class="logo" @click="router.push({ path: '/' })">
                    <img class="logo-img" :src="avatar" alt="墨师设计">
                </div>
            </div>
            <div class="header-right">
                <div class="login-bnt">
                    <transition enter-active-class="animate__animated animate__fadeInDown"
                        leave-active-class="animate__animated animate__fadeOutUp">
                        <div v-if="show" class="login" @click.stop="router.push({ name: 'login' })">
                            {{ t("pub.login_1") }}
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import avatar from '@/assets/h-logo3.svg'
import { router } from '@/router'
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
const show = ref<boolean>(false)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.intersectionRatio === 0) {
            show.value = true
        } else {
            show.value = false
        }
    })
})

const startObserving = (elements: any) => {
    elements.forEach((el: any) => {
        if (el as HTMLElement) {
            observer.observe(el);
        }
    })
}
onMounted(() => {
    const containerElements = document.querySelectorAll('.start .content .login')
    startObserving(containerElements)
})
</script>

<style lang="scss" scoped>
.header-container {
    display: flex;
    position: sticky;
    top: 0;
    width: 100%;
    min-width: 1152px;
    height: 64px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(15px);
    --webkit-backdrop-filter: blur(15px);
    border-bottom: 1px solid #FAFAFA;
    z-index: 999;

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: auto;
        width: 100%;
        max-width: 1440px;
        min-width: 1152px;

        .header-left {
            // margin-left: 40px;
        }

        .header-right {
            // margin-right: 40px;

            .login-bnt {
                // width: 140px;

                .login {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 110px;
                    height: 36px;
                    border-radius: 6px;
                    background-color: #1878F5;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 500;

                    &:hover {
                        background-color: #429AFF;
                    }

                    &:active {
                        background-color: #0A59CF;
                    }
                }
            }
        }
    }
}

@media (max-width:1440px) {
    .header-container .header {
        .header-left {
            margin-left: 40px;
        }

        .header-right {
            margin-right: 40px;
        }
    }
}

@media (max-width:480px) {
    .header-container {
        min-width: 100%;

        .header {
            min-width: 100%;
            padding: 0 12px;
            box-sizing: border-box;

            .header-left,
            .header-right {
                margin: 0;

                .login-bnt {
                    width: 110px;
                }
            }
        }
    }
}
</style>
