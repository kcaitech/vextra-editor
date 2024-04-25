<script setup lang='ts'>
import Describes from './Describes.vue'
import Footer from './Footer.vue'
import * as user_api from '@/request/users'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue'
import { router } from '@/router'
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus'
import { User } from '@/context/user'
import isMobileDevice from '@/utils/mobileDeviceChecker'

const { t } = useI18n()
const isLoading = ref(false)
const failed = ref<boolean>(false)
const loginshow = ref<boolean>(true)
const userid = ref('')
const Wxcode = ref('')
const codeerror = ref<boolean>(false)
const inputfocus = ref<any>([])
const isComposing = ref<boolean>(false)

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
                    const page_id = params.get('page_id');
                    const query = params.get('page_id') ? { id, page_id } : { id };
                    router.push({
                        name: path,
                        query
                    })
                } else {
                    if (isMobileDevice()) {
                        router.push({ name: 'mobilehome' })
                    } else {
                        router.push({ name: 'apphome' })
                    }

                }
            } else if (result.code === 400) {
                codeerror.value = true
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
    // if (isMobileDevice()) return
    new (window as any).WxLogin({
        self_redirect: true,
        id: "login_container",
        appid: "wx42bb87f7f2e86a6e",
        scope: "snsapi_login",
        // redirect_uri: encodeURIComponent("https://protodesign.cn/html/GetCode.html"),
        redirect_uri: encodeURIComponent("https://moss.design/html/GetCode.html"),
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

const miniprogramcode = ref<string>()

async function GetminiProgramCode() {
    const { data, code } = await user_api.GetminiProgramCode({ scene: encodeURIComponent("home=pages/index/index") })
    if (code === 0) {
        miniprogramcode.value = data
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

let timer: any
const keydownevent = (index: number) => {
    if (0 < index) {
        timer = setTimeout(() => {
            (inputfocus.value[index - 1] as HTMLInputElement).focus()
            clearTimeout(timer)
        }, 0);
        if (codeerror.value) {
            codeerror.value = false
        }
    }
}

const inputevent = (e: Event, index: number) => {
    const inputs = document.querySelectorAll('.inputitem')
    if (isComposing.value) return
    if ((e.target! as HTMLInputElement).value === " ") {
        inputvalues[index].value = ''
        return
    }
    if (index < inputs.length - 1 && (e.target! as HTMLInputElement).value !== "") {
        (inputs[index + 1] as HTMLInputElement).focus()
    }
}

const allValuesFilled = computed(() => {
    return inputvalues.every(item => item.value !== "")
})

const codevalue = computed(() => {
    return inputvalues.reduce((accumulator, item) => accumulator + item.value, "")
})

const handleCompositionStart = () => {
    isComposing.value = true
}

const handleCompositionEnd = (e: any, index: number) => {
    isComposing.value = false
    inputvalues[index].value = ""
    inputfocus.value[index].focus()
}

const pasteEvent = async (e: any) => {
    e.preventDefault();
    try {
        let pasteContent = e.clipboardData.getData('text/plain') || await navigator.clipboard.readText();
        if (pasteContent && pasteContent.length > 8) {
            pasteContent = pasteContent.slice(0, 8)
        }
        for (let i = 0; i < pasteContent.length; i++) {
            inputvalues[i].value = pasteContent[i]
        }
        inputfocus.value[pasteContent.length - 1].focus()
    } catch (error) {
        console.error('Unable to read clipboard data:', error);
    }

}

function changesize(e: HTMLElement) {
    if (window.innerWidth > window.innerHeight) {
        e.style.aspectRatio = '8/6'
    } else {
        e.style.aspectRatio = '8/10'
    }
}

onMounted(() => {

    if (isMobileDevice()) {
        const el = document.querySelector('.login') as HTMLElement
        window.onresize = () => { changesize(el) }
        changesize(el)
    }
})

</script>

<template>
    <div class="bgiamge">
        <div class="content">
            <div class="top">
                <Describes></Describes>
                <div class="login" :style="{ transform: `rotateY(${loginshow ? 0 : 180}deg)` }">
                    <div class="login-page" v-if="loginshow">
                        <div class="title">{{ t('system.wx_login') }}</div>
                        <div v-if="!isMobileDevice()" id="login_container" :class="{ 'login_container_hover': failed }"
                            v-loading="isLoading">
                        </div>
                        <div v-else style="width: 200px;height: 200px;" v-loading="isLoading">
                            <img v-if="miniprogramcode" style="width: 100%;height: 100%;" :src="miniprogramcode" alt="code">
                        </div>
                        <div class="tips">
                            <span>{{ t('system.login_read') }}</span>
                            <span @click.prevent="handleOpenNewWindow('serviceagreement')">{{ t('system.read_TOS')
                                }}</span>
                            <span @click.prevent="handleOpenNewWindow('privacypolicy')">{{ t('system.read_Privacy')
                                }}</span>
                        </div>
                    </div>
                    <div class="login-code" v-else>
                        <div class="back" @click.stop="loginshow = true">
                            <svg-icon icon-class="back-icon"></svg-icon>
                        </div>
                        <span class="Invitation_code">{{ t('home.invitation_code_tips') }}</span>
                        <div class="inputs">
                            <input class="inputitem" type="text" ref="inputfocus" v-for="(input, index) in inputvalues"
                                :key="index" v-model="input.value" maxlength="1" :autofocus="index === 0"
                                @input="inputevent($event, index)" @compositionstart="handleCompositionStart"
                                @compositionend="handleCompositionEnd($event, index)"
                                @keydown.delete="keydownevent(index)" @paste="pasteEvent($event)" />
                            <Transition name="slide-up">
                                <span v-if="codeerror" class="code_error_tips">验证码已被使用或不存在，请更换验证码</span>
                            </Transition>
                        </div>

                        <button class="affirm" @click="clickaffirm" ref="affirm" :disabled="!allValuesFilled">{{
                    t('percenter.affirm')
                            }}</button>
                    </div>
                </div>
            </div>
            <Footer></Footer>
        </div>
    </div>
</template>

<style lang='scss' scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.25s ease-out;
}

.slide-up-enter-from {
    opacity: 0;
    transform: translateY(-16px);
}

.slide-up-leave-to {
    opacity: 0;
    transform: translateY(16px);
}


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
    background-image: url("@/assets/bgimg2.png");
    background-size: cover;
    background-repeat: no-repeat;
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

        .login {
            width: 80%;
            // height: 80%;
            // max-height: 480px;
            max-width: 400px;
            background: white;
            border-radius: 32px;
            border: 1px solid #F0F0F0;
            box-shadow: 0px 20px 50px 0px rgba(12, 84, 178, 0.08);
            box-sizing: border-box;
            transform-style: preserve-3d;
            transition: transform 0.5s;
            aspect-ratio: 8/9.6;

            .login-page {
                display: flex;
                flex-direction: column;
                flex-wrap: nowrap;
                align-items: center;
                height: 100%;
                justify-content: space-evenly;

                #login_container {
                    width: 200px;
                    height: 200px;
                }



                .title {
                    font-size: 20px;
                    font-weight: 600;
                    // margin-top: 74px;
                    // margin-bottom: 46px;
                    color: rgba(67, 67, 67, 1);
                    opacity: 0.8;
                }

                .tips {
                    display: flex;
                    gap: 4px;
                    font-size: 13px;
                    font-weight: 500;
                    color: rgb(146 146 146);
                    // margin-top: 24px;

                    span:nth-child(n + 2) {
                        cursor: pointer;
                        color: #1878f5;
                        font-weight: 500;
                        opacity: 0.6;
                    }
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

                .Invitation_code {
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
}
</style>
