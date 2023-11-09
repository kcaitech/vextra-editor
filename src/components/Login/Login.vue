<script setup lang='ts'>
import Describes from './Describes.vue'
import Footer from './Footer.vue'
import * as user_api from '@/request/users'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { router } from '@/router'
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus'
import avatar from '@/assets/pd-logo-svg.svg';
import { User } from '@/context/user'
import { Path } from '@kcdesign/data'

const { t } = useI18n()
const isLoading = ref(false)
const codeinput = ref()
const codevalue = ref('')
const failed = ref<boolean>(false)
const loginshow = ref<boolean>(true)
const affirm = ref()
const userid = ref('')
const Wxcode = ref('')
const isShow = ref(true)

function onmessage(e: any) {
    if (e.data?.type !== "GetWxCode") return
    isLoading.value = true
    Wxcode.value = e.data.code
    getlogin(Wxcode.value)
}

async function getlogin(code: string, invite_code: string = '', id: string = '') {
    user_api.PostLogin({ code: code, invite_code: invite_code, id: id }).then((linfo: any) => {
        if (linfo) {
            const user = new User(linfo.data);
            (window as any).skuser = user
            if (linfo.code === 0 && linfo.data.token !== '') {
                localStorage.setItem('token', linfo.data.token)
                localStorage.setItem('avatar', linfo.data.avatar)
                localStorage.setItem('nickname', linfo.data.nickname)
                localStorage.setItem('userId', linfo.data.id)
                isLoading.value = false
                const perRoute = localStorage.getItem('perRoute') || ''
                if (perRoute) {
                    if (perRoute.includes('?')) {
                        const params = new URLSearchParams(perRoute.split('?')[1]);
                        const path = perRoute.split('?')[0].replace('/', '');
                        if (params.get('id') != null) {
                            const id = params.get('id');
                            router.push({
                                name: path,
                                query: {
                                    id: id
                                }
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
                    router.push({ name: 'apphome' })
                }
            } else if (linfo.code === 400) {
                userid.value = linfo.data.id
                loginshow.value = false
                nextTick(() => {
                    codeinput.value.focus()
                    codevalue.value = ''
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

function clickaffirm() {
    user_api.PostLogin({ code: Wxcode.value, invite_code: codevalue.value, id: userid.value }).then((result: any) => {
        if (result) {
            if (result.code === 0 && result.data.token !== '') {
                localStorage.setItem('token', result.data.token)
                localStorage.setItem('avatar', result.data.avatar)
                localStorage.setItem('nickname', result.data.nickname)
                localStorage.setItem('userId', result.data.id)
                isLoading.value = false
                const perRoute = localStorage.getItem('perRoute') || ''
                if (perRoute) {
                    const params = new URLSearchParams(perRoute.split('?')[1]);
                    const path = perRoute.split('?')[0].replace('/', '');
                    const id = params.get('id');
                    router.push({
                        name: path,
                        query: {
                            id: id
                        }
                    })
                } else {
                    router.push({ name: 'apphome' })
                }
            } else if (result.code === 400) {
                codeinput.value.focus()
                codevalue.value = ''
                ElMessage.error({ duration: 1500, message: result.message })
            }
        }
    }).catch((result: any) => {
        if (result.data.code === -1) {
            loginshow.value = true
            nextTick(() => {
                ElMessage.error({ duration: 1500, message: result.data.message })
                isLoading.value = true
                wxcode()
                const login: any = document.querySelector('iframe')
                login.addEventListener('load', function () {
                    isLoading.value = false
                })
                login.removeEventListener('load', function () { })
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
        redirect_uri: encodeURIComponent("https://protodesign.cn/html/GetCode.html"),
        state: "STATE",
        style: "",
        href: 'data:text/css;base64,LmltcG93ZXJCb3ggLnRpdGxlIHtkaXNwbGF5OiBub25lO30KLmltcG93ZXJCb3ggLmluZm8ge2Rpc3BsYXk6IG5vbmU7fQouaW1wb3dlckJveCAucXJjb2RlIHtib3JkZXI6IG5vbmU7Ym9yZGVyLXJhZGl1czo2cHh9Ci5zdGF0dXNfaWNvbiB7ZGlzcGxheTogbm9uZTt9Ci5pbXBvd2VyQm94IC5zdGF0dXMge2Rpc3BsYXk6IG5vbmU7fQoud2ViX3FyY29kZV90eXBlX2lmcmFtZSB7d2lkdGg6IDMwMHB4O2hlaWdodDogMzAwcHg7fQ==',
    })
}

const handleOpenNewWindow = (routeName: string) => {
    const routeLocation = router.resolve({
        name: routeName
    })
    window.open(routeLocation.href, '_blank');
}

onMounted(() => {
    setTimeout(() => {
        isLoading.value = true
        wxcode()
        const login: any = document.querySelector('iframe')
        login.addEventListener('load', function () {
            isLoading.value = false
        })
    }, 500);
    window.addEventListener('message', onmessage, false)
    const userAgent = navigator.userAgent
    for (const keyword of mobileKeywords) {
        if (userAgent.includes(keyword)) {
            const el = document.querySelector('.login')
            el?.classList.add('loginmin')
            return isShow.value = false
        } else {
            isShow.value = true
        }
    }
})
onUnmounted(() => {
    window.removeEventListener('message', onmessage)
})

const mobileKeywords = [
    "Android",
    "webOS",
    "iPhone",
    "iPad",
    "iPod",
    "BlackBerry",
    "Windows Phone",
]

</script>

<template>
    <div class="main">
        <div class="all" v-if="loginshow">
            <Describes v-if="isShow" />
            <div class="login">
                <div class="img-logo" v-if="!isShow">
                    <img :src="avatar" alt="ProtoDesign">
                </div>
                <span>{{ t('system.wx_login') }}</span>
                <div id="login_container" :class="{ 'login_container_hover': failed }" v-loading="isLoading"></div>
                <p>{{ t('system.login_read') }}
                    <a href="" @click.prevent="handleOpenNewWindow('serviceagreement')">{{ t('system.read_TOS') }}</a>&nbsp;
                    <a href="" @click.prevent="handleOpenNewWindow('privacypolicy')">{{ t('system.read_Privacy') }}</a>
                </p>
            </div>
            <Footer v-if="isShow" />
        </div>
        <div class="code_input" v-else>
            <div class="top">
                <div class="img">
                    <img :src="avatar" alt="ProtoDesign" />
                    <span>{{ t('system.product_name') }}</span>
                </div>
            </div>
            <span class="Invitation_code">{{ t('home.invitation_code_tips') }}</span>
            <input ref="codeinput" v-model="codevalue" maxlength="8" @keyup.enter="clickaffirm" />
            <button class="affirm" @click="clickaffirm" ref="affirm" :disabled="codevalue == '' ? true : false">{{
                t('percenter.affirm')
            }}</button>
        </div>
    </div>
</template>

<style lang='scss' scoped>
.loginmin {
    margin: 0px !important;
    width: 100% !important;
    height: 100% !important;
    border-radius: 0 !important;
    background: conic-gradient(from 207deg at 100% 0%, rgba(73, 125, 202, 0.00) -113deg, #542FDB 93deg, rgba(84, 47, 219, 0.54) 155deg, rgba(84, 47, 219, 0.31) 195deg, rgba(73, 125, 202, 0.00) 247deg, #542FDB 453deg) !important;
    background-blend-mode: color-dodge !important;
    color: white;
}

.img-logo {
    position: absolute;
    top: 20px;
    left: 20px;
}

.main {
    width: 100vw;
    height: 100vh;
    background: conic-gradient(from 207deg at 100% 0%, rgba(73, 125, 202, 0.00) -113deg, #542FDB 93deg, rgba(84, 47, 219, 0.54) 155deg, rgba(84, 47, 219, 0.31) 195deg, rgba(73, 125, 202, 0.00) 247deg, #542FDB 453deg);
    background-blend-mode: color-dodge;
}

.affirm {
    width: 120px;
    height: 48px;
    font-size: 18px;
    letter-spacing: 10px;
    text-indent: 10px;
    padding: 0;
    border: 1px rgb(69, 69, 255) solid;
    border-radius: 5px;
    background: rgb(69, 69, 255);
    color: white;
    margin: 50px 0 200px 0;
    text-align: center;

    &:hover {
        background: rgba(80, 80, 255, 0.884);
    }

    &[disabled] {
        background: rgba(195, 195, 246, 0.884);
        border: 1px rgba(195, 195, 246, 0.884) solid;
    }
}

.code_input {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    animation: moveup .5s;

    .top {
        position: absolute;
        left: 0;
        top: 0;

        .img {
            display: flex;
            align-items: center;

            span {
                font-size: 48px;
                font-weight: 600;
                color: white;
            }

            img {
                height: 160px;
                width: 160px;
            }
        }
    }

    .Invitation_code {
        font-size: 32px;
        font-weight: 600;
        margin: 0;
        letter-spacing: 5px;
        color: white;
    }

    input {
        min-width: 20%;
        height: 60px;
        font-size: 48px;
        color: rgba(0, 0, 0, 0.8);
        text-align: center;
        border-radius: 10px;
        border: 2px rgb(50, 50, 255) solid;
        outline: none;
        margin-top: 50px;
        letter-spacing: 20px;

        &:hover {
            border-radius: 10px;
            border: 2px rgb(69, 69, 255) solid;
        }

        &:focus {
            border-radius: 10px;
            border: 2px rgb(69, 69, 255) solid;
        }
    }

}

.login_container_hover {
    background-color: #00000030;
    line-height: 300px;
    margin: 20px 0;
}

.login_container_hover:hover {
    background-color: #00000010;
}

.all {
    overflow: auto;
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: center;
    flex-wrap: wrap;
    width: 100vw;
    height: 100vh;

    .login {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        margin: 0 0 160px 100px;
        width: 400px;
        height: 480px;
        text-align: center;
        background: white;
        border-radius: 6px;
        z-index: 2;
        box-shadow: rgba(17, 17, 26, 0.1) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 48px;
        animation: moveleft .5s;

        #login_container {
            width: 300px;
            height: 300px;
        }


        span {
            font-size: 18px;
            font-weight: bold;
            margin-top: 40px;
            margin-bottom: 20px;
            letter-spacing: 10px;
        }

        p {
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 2px;
            color: rgb(146 146 146);
            margin-top: 20px;

        }

    }
}



@keyframes moveleft {
    0% {
        opacity: 0;
        transform: translateX(200px);
    }

    100% {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes moveup {
    0% {
        opacity: 0;
        transform: translateY(-100%);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>



