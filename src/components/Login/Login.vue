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
const loginshow = ref<boolean>(true)
const userid = ref('')
const Wxcode = ref('')
const codeerror = ref<boolean>(false)
const inputfocus = ref<any>([])

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
                const perRoute = sessionStorage.getItem('perRoute') || ''
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
                    localStorage.removeItem('perRoute')
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
                loginshow.value = false
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
            loginshow.value = true
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
    // if (isMobileDevice()) return
    new (window as any).WxLogin({
        self_redirect: true,
        id: "login_container",
        appid: "wx42bb87f7f2e86a6e",
        scope: "snsapi_login",
        // redirect_uri: encodeURIComponent("https://protodesign.cn/html/GetCode.html"),
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
    if (loginshow.value) {
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
    } else {
        inputvalues.forEach(item => { item.value = ""; })
        codeerror.value = false
        setTimeout(() => {
            inputfocus.value[0].focus()

        }, 0)
    }
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

    // if (isMobileDevice()) {
    //     router.push({ name: "privacypolicy" })
    // } else {
    //     window.addEventListener('message', onmessage, false)
    // }
    window.addEventListener('message', onmessage, false)
})

onUnmounted(() => {
    window.removeEventListener('message', onmessage)
})

const inputvalues = reactive([
    { value: "" },
    { value: "" },
    { value: "" },
    { value: "" },
    { value: "" },
    { value: "" },
    { value: "" },
    { value: "" },
])

function changesize(e: HTMLElement) {
    if (window.innerWidth > window.innerHeight) {
        e.style.aspectRatio = '8/6'
    } else {
        e.style.aspectRatio = '8/10'
    }
}

onMounted(() => {

    if (isMobileDevice()) {
        const el = document.querySelector('.login-page') as HTMLElement
        window.onresize = () => { changesize(el) }
        changesize(el)
    }
})

</script>

<template>

    <div class="bgiamge">
        <svg-icon class="svg" icon-class="newlogo"></svg-icon>
        <div class="content">
            <div class="top">
                <Describes></Describes>
                <div class="login-page">
                    <div class="title">{{ t('system.wx_login') }}</div>
                    <div v-if="!isMobileDevice()" id="login_container" :class="{ 'login_container_hover': failed }"
                        v-loading="isLoading">
                    </div>
                    <div v-else style="width: 200px;height: 200px;" v-loading="isLoading">
                        <img v-if="miniprogramcode" style="width: 100%;height: 100%;" :src="miniprogramcode" alt="code">
                    </div>
                    <div class="tips" :lang="locale">
                        <span class="tips_content">{{ t('system.login_read') }}</span>
                        <span class="tips_button" @click.prevent="handleOpenNewWindow('serviceagreement')">{{
                            t('system.read_TOS')
                        }}</span>
                        <span class="tips_button" @click.prevent="handleOpenNewWindow('privacypolicy')">{{
                            t('system.read_Privacy')
                        }}</span>
                    </div>
                </div>
            </div>
            <Footer></Footer>
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
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    background-image: url("@/assets/bgimg3.png");
    background-size: cover;
    background-repeat: no-repeat;

    svg {
        position: fixed;
        top: 2%;
        left: 3%;
        width: 136px;
        height: 36px;
    }
}

.content {
    height: 100%;
    display: flex;
    justify-content: center;

    .top {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;


        .login-page {

            position: relative;
            top: -30px;
            width: 80%;
            height: 460px;
            max-width: 360px;
            background: white;
            border-radius: 10px;
            border: 1px solid #F0F0F0;
            box-shadow: 0px 20px 50px 0px rgba(12, 84, 178, 0.08);
            box-sizing: border-box;
            transform-style: preserve-3d;
            transition: transform 0.5s;
            aspect-ratio: 8/9.6;

            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            align-items: center;
            justify-content: space-evenly;

            #login_container {
                width: 200px;
                height: 200px;
            }

            .title {
                font-size: 20px;
                font-weight: 500;
                // margin-top: 74px;
                // margin-bottom: 46px;
                color:black;
                opacity: 0.8;
            }

            .tips {
                display: grid;
                gap: 4px;
                font-size: 13px;
                font-weight: 500;
                color: rgb(146 146 146);
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
                    opacity: 0.6;
                }
            }

            .tips:lang(zh) {
                grid-template-columns: auto auto auto auto;
                grid-template-areas:
                    "header header auto auto";
            }
        }

        .login-code {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            align-items: center;
            transform-style: preserve-3d;
            transform: rotateY(180deg);

            .back {
                width: 28px;
                height: 28px;
                position: absolute;
                top: 20px;
                left: 16px;
                padding: 4px;
                border-radius: 6px;
                box-sizing: border-box;

                &:hover {
                    background-color: rgba(240, 240, 240, 1);
                }

                &:active {
                    background-color: rgba(243, 243, 245, 1);
                }

                svg {
                    width: 100%;
                    height: 100%;
                }
            }

            .invitation_code {
                font-size: 20px;
                font-weight: 600;
                color: rgba(67, 67, 67, 1);
                // margin: 74px 0 106px 0;
            }

            .inputs {
                position: relative;
                display: flex;
                justify-content: space-evenly;
                width: 344px;
                width: 100%;

                // margin-bottom: 56px;



                input {
                    width: 36px;
                    height: 48px;
                    border-radius: 6px;
                    font-size: 24px;
                    font-weight: 600;
                    color: rgba(0, 0, 0, 1);
                    text-align: center;
                    background-color: rgba(235, 235, 235, 1);
                    border: 1px solid #EBEBEB;
                    box-sizing: border-box;
                    outline: none;
                }
            }

            .code_error_tips {
                position: absolute;
                top: 58px;
                font-size: 12px;
                font-weight: 400;
                color: rgba(234, 0, 0, 1);

            }

            .affirm {
                // width: 344px;
                width: 80%;
                height: 44px;
                font-size: 14px;
                border: none;
                border-radius: 6px;
                background-color: rgba(24, 120, 245, 1);
                color: white;
                text-align: center;
                outline: none;

                &:hover {
                    background-color: rgba(66, 154, 255, 1);
                }

                &:active {
                    background-color: rgba(10, 89, 207, 1);
                }

                &[disabled] {
                    background-color: rgba(189, 226, 255, 1);
                }
            }
        }
    }

}
</style>
