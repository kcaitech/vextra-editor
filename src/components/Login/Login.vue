<script setup lang='ts'>
import Describes from './Describes.vue'
import Footer from './Footer.vue'
import * as user_api from '@/request/users'
import { nextTick, onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue'
import { router } from '@/router'
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus'
import isMobileDevice from '@/utils/mobileDeviceChecker'
import kcdesk from '@/kcdesk'
import { locale } from '@/locale'

const { t } = useI18n()
const isLoading = ref(false)
const failed = ref<boolean>(false)
const userid = ref('')
const Wxcode = ref('')

function onmessage(e: any) {
    if (e.data?.type !== "GetWxCode") return
    isLoading.value = true
    Wxcode.value = e.data.code
    getlogin(Wxcode.value)
}

async function getlogin(code: string, invite_code: string = '', id: string = '') {
    user_api.PostLogin({ code: code, invite_code: invite_code, id: id }).then((linfo: any) => {
        if (linfo) {
            if (linfo.code === 0 && linfo.data.token !== '') {
                kcdesk?.setLogined(true);
                localStorage.setItem('token', linfo.data.token)
                localStorage.setItem('avatar', linfo.data.avatar)
                localStorage.setItem('nickname', linfo.data.nickname)
                localStorage.setItem('userId', linfo.data.id)
                isLoading.value = false
                const perRoute = decodeURIComponent(sessionStorage.getItem('perRoute') || '')
                if (perRoute) {
                    if (perRoute.includes('?')) {
                        const params = new URLSearchParams(perRoute.split('?')[1]);
                        const path = perRoute.split('?')[0].replace('/', '');
                        if (params.get('id') != null) {
                            const id = params.get('id');
                            const page_id = params.get('page_id');
                            const query = params.get('page_id') ? { id, page_id } : { id };
                            router.push({
                                name: path,
                                query
                            })
                        }
                        if (params.get('teamid') != null) {
                            const key = params.get('key')
                            const id = params.get('teamid')
                            router.push({
                                name: path,
                                query: {
                                    key: key,
                                    teamid: id
                                }
                            })
                        }
                    } else {
                        router.push({ path: perRoute })
                    }
                    sessionStorage.removeItem('perRoute')
                }
                else {
                    if (isMobileDevice()) {
                        router.push({ name: 'mobilehome' })
                    } else {
                        router.push({ name: 'apphome' })
                    }

                }
            } else if (linfo.code === 400) {
                userid.value = linfo.data.id
            } else if (linfo.code === -1) {
                isLoading.value = false
                ElMessage.error({ duration: 1500, message: '服务异常，请稍后再试' })
                nextTick(() => {
                    wxcode()
                    const login: any = document.querySelector('iframe')
                    login.addEventListener('load', function () {
                        isLoading.value = false
                    })
                })
            }
        }
    }).catch((linfo: any) => {
        if (linfo.data.code === -1) {
            ElMessage.error(linfo.data.message)
            nextTick(() => {
                isLoading.value = true
                wxcode()
                const login: any = document.querySelector('iframe')
                login.addEventListener('load', function () {
                    isLoading.value = false
                })
            })
        }

    })
}

function wxcode() {
    new (window as any).WxLogin({
        self_redirect: true,
        id: "login_container",
        appid: "wx42bb87f7f2e86a6e",
        scope: "snsapi_login",
        redirect_uri: encodeURIComponent("https://moss.design/static/GetCode.html"),
        state: "STATE",
        style: "",
        href: 'data:text/css;base64,LmltcG93ZXJCb3ggLnRpdGxlIHtkaXNwbGF5OiBub25lO30KLmltcG93ZXJCb3ggLmluZm8ge2Rpc3BsYXk6IG5vbmU7fQouaW1wb3dlckJveCAucXJjb2RlIHtib3JkZXI6IG5vbmU7bWFyZ2luLXRvcDowcHg7Ym9yZGVyLXJhZGl1czo2cHg7d2lkdGg6MjAwcHg7fQouc3RhdHVzX2ljb24ge2Rpc3BsYXk6IG5vbmU7fQouaW1wb3dlckJveCAuc3RhdHVzIHtkaXNwbGF5OiBub25lO30KLndlYl9xcmNvZGVfdHlwZV9pZnJhbWUge3dpZHRoOiAyMDBweDtoZWlnaHQ6IDIwMHB4O30=',
    })
}

const handleOpenNewWindow = (routeName: string) => {
    const routeLocation = router.resolve({
        name: routeName
    })
    window.open(routeLocation.href, '_blank');
}

watchEffect(() => {
    setTimeout(async () => {
        isLoading.value = true
        if (isMobileDevice()) {
            await GetminiProgramCode()
            isLoading.value = false
        } else {
            wxcode()
            const login: any = document.querySelector('iframe')
            login.addEventListener('load', function () {
                isLoading.value = false
            })
        }
    }, 500);
})

const miniprogramcode = ref<string>('')

async function GetminiProgramCode() {
    const perRoute = decodeURIComponent(sessionStorage.getItem('perRoute') || '')
    if (perRoute.includes('document') || perRoute.includes('pageviews')) {
        if (perRoute.includes('?')) {
            const params = new URLSearchParams(perRoute.split('?')[1]);
            if (params.get('id')?.split(' ')[0] != null) {
                const id = params.get('id')?.split(' ')[0];
                const { data, code } = await user_api.GetminiProgramCode({ scene: `id=${encodeURIComponent(id as string)}` })
                if (code === 0) {
                    miniprogramcode.value = data
                }
            }
        }
    } else {
        const { data, code } = await user_api.GetminiProgramCode({ scene: "Home" })
        if (code === 0) {
            miniprogramcode.value = data
        }
    }
}

onMounted(() => {
    window.addEventListener('message', onmessage, false)
})

onUnmounted(() => {
    window.removeEventListener('message', onmessage)
})



onMounted(() => {

})

</script>

<template>

    <div class="bgiamge">
        <div class="header">
            <svg-icon class="svg" icon-class="newlogo" @click.stop="router.push({ path: '/' })"></svg-icon>
        </div>
        <div class="content">
            <div class="login-left">
                <div class="welcome">{{ t("login.welcome") }}</div>
                <div class="name">{{ t("login.name") }}</div>
                <div class="describe">{{ t("login.describe") }}</div>
            </div>
            <div class="login-right">
                <div class="title">{{ !isMobileDevice() ? t('system.wx_login') : t("login.scan_code") }}
                </div>
                <div v-if="!isMobileDevice()" id="login_container" :class="{ 'login_container_hover': failed }"
                    v-loading="isLoading">
                </div>
                <div v-else class="miniprogarm" v-loading="isLoading">
                    <img v-if="miniprogramcode" :src="miniprogramcode" alt="code">
                    <span>{{ t("login.miniprogram") }}</span>
                </div>
                <div class="tips" :lang="locale">
                    <span class="tips_content">{{ t('system.login_read') }}</span>
                    <span class="tips_button" @click="handleOpenNewWindow('serviceagreement')">{{
                t('system.read_TOS')
            }}</span>
                    <span class="tips_button" @click="handleOpenNewWindow('privacypolicy')">{{
                t('system.read_Privacy')
                        }}</span>
                </div>
            </div>
        </div>

    </div>
</template>

<style lang='scss' scoped>
.login_container_hover {
    background-color: #00000030;
    line-height: 300px;
    margin: 20px 0;
}

.login_container_hover:hover {
    background-color: #00000010;
}

.bgiamge {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: #F4F8FB;
    background-image: url("@/assets/bgimg4.svg");
    background-size: cover;
    background-repeat: no-repeat;
    overflow: auto;

    .header {
        width: 100%;
        max-width: 1440px;
        margin: 0 auto;

        svg {
            cursor: pointer;
            width: 122px;
            height: 64px;
            margin-left: 40px;
        }
    }

}

.content {
    display: flex;
    position: relative;
    width: 100%;
    max-width: 840px;
    height: 640px;
    border-radius: 16px;
    border: 1px solid #F0F0F0;
    box-shadow: 0px 20px 50px 0px rgba(12, 84, 178, 0.08);
    margin: auto;
    background-color: #fff;
    transform-style: preserve-3d;
    transform: translateX(-20px);


    .login-left {
        width: 50%;
        height: 100%;
        padding: 64px 87px 0 64px;
        box-sizing: border-box;

        .welcome,
        .name {
            font-family: "zihunbiantaoti";
            font-size: 56px;
            font-weight: 400;
        }

        .welcome {
            color: #1F1F1F;
        }

        .name {
            color: #1878F5;
        }

        .describe {
            color: #BFBFBF;
            font-size: 18px;
            margin-top: 24px;
        }
    }

    .login-right {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 50%;
        height: 100%;
        background-color: #FAFBFC;
        box-sizing: border-box;
        border-top-right-radius: 16px;
        border-bottom-right-radius: 16px;



        .title {
            font-size: 20px;
            font-weight: 500;
            line-height: 20px;
            color: #141414;
            letter-spacing: 2px;
        }

        #login_container {
            width: 200px;
            height: 200px;
            margin: 67px 0 84px 0;
        }

        .tips {
            display: grid;
            gap: 4px;
            font-size: 13px;
            font-weight: 400;
            color: #262626;
            align-items: center;
            justify-items: center;
            grid-template-columns: auto auto;
            grid-template-rows: auto;
            grid-template-areas:
                "header header"
                "auto auto";

            .tips_content {
                grid-area: header;
            }

            .tips_button {
                cursor: pointer;
                color: #1878f5;
                font-weight: 500;
            }
        }

        .tips:lang(zh) {
            grid-template-columns: auto auto auto auto;
            grid-template-areas:
                "header header auto auto";
        }

        .miniprogarm {
            width: 200px;
            height: 200px;
            text-align: center;
            margin: 67px 0 84px 0;

            img {
                width: 100%;
                height: 100%;
            }

            span {
                font-size: 14px;
                color: #c8c8c8;
                letter-spacing: 1px;
            }
        }

    }

    &::before {
        content: "";
        position: absolute;
        transform: translate3d(0, 0, -1px);
        top: -79px;
        right: -79px;
        width: 158px;
        height: 158px;
        border-radius: 50%;
        background: linear-gradient(180deg, #E8F0FA 0%, rgba(232, 240, 250, 0) 88%);
    }

    &::after {
        content: "";
        position: absolute;
        bottom: 0;
        width: 465px;
        height: 294px;
        background-image: url("@/assets/content-img.svg");
        background-repeat: no-repeat;
    }
}


@media (max-width:1440px) {
    .bgiamge .content {
        transform: translateX(0px);
    }
}

@media (max-width:480px) {
    .bgiamge {
        min-width: 100%;
        overflow: hidden;
    }

    .bgiamge .content {
        width: calc(100% - 20px);
        height: 60%;
        min-height: 450px;
        transform: translateX(0px);
    }

    .bgiamge .content .login-left {
        display: none;
    }

    .bgiamge .content .login-right {
        width: 100%;
        border-radius: 16px;
    }

    .bgiamge .content::after {
        content: none;
    }
}
</style>
