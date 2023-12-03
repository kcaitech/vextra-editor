<script setup lang='ts'>
import Describes from './Describes.vue'
import Footer from './Footer.vue'
import * as user_api from '@/request/users'
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { router } from '@/router'
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus'
import { User } from '@/context/user'

const { t } = useI18n()
const isLoading = ref(false)
const codeinput = ref()
const codevalue = ref('')
const failed = ref<boolean>(false)
const loginshow = ref<boolean>(true)
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
        href: 'data:text/css;base64,LmltcG93ZXJCb3ggLnRpdGxlIHtkaXNwbGF5OiBub25lO30KLmltcG93ZXJCb3ggLmluZm8ge2Rpc3BsYXk6IG5vbmU7fQouaW1wb3dlckJveCAucXJjb2RlIHtib3JkZXI6IG5vbmU7bWFyZ2luLXRvcDowcHg7Ym9yZGVyLXJhZGl1czo2cHg7d2lkdGg6MjAwcHg7fQouc3RhdHVzX2ljb24ge2Rpc3BsYXk6IG5vbmU7fQouaW1wb3dlckJveCAuc3RhdHVzIHtkaXNwbGF5OiBub25lO30KLndlYl9xcmNvZGVfdHlwZV9pZnJhbWUge3dpZHRoOiAyMDBweDtoZWlnaHQ6IDIwMHB4O30=',
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

const keyword = (e: Event, index: number) => {
    const inputs = document.querySelectorAll('.inputitem')
    console.log(e);
    
    if ((e.target! as HTMLInputElement).value === " "){
        inputvalues[index].value=''
        return
    } 
    if (index < inputs.length - 1) {
        (inputs[index + 1] as HTMLInputElement).focus()
    }
//     if((e as HTMLInputElement).inputType==='deleteContentBackward'){
// console.log('1111');

//     }
}

</script>

<template>
    <div class="main">
        <div class="all">
            <Describes></Describes>
            <div class="login">
                <div class="login-page" v-if="!loginshow">
                    <span>{{ t('system.wx_login') }}</span>
                    <div id="login_container" :class="{ 'login_container_hover': failed }" v-loading="isLoading"></div>
                    <p>{{ t('system.login_read') }}
                        <a href="" @click.prevent="handleOpenNewWindow('serviceagreement')">{{ t('system.read_TOS')
                        }}</a>&nbsp;
                        <a href="" @click.prevent="handleOpenNewWindow('privacypolicy')">{{ t('system.read_Privacy') }}</a>
                    </p>
                </div>
                <div class="login-code" v-else>
                    <span class="Invitation_code">{{ t('home.invitation_code_tips') }}</span>
                    <div class="inputs">
                        <input class="inputitem" v-for="(input, index) in inputvalues" :key="index" v-model="input.value"
                            maxlength="1" :autofocus="index === 0" @input="keyword($event, index)" />
                    </div>
                    <button class="affirm" @click="clickaffirm" ref="affirm" :disabled="codevalue == '' ? true : false">{{
                        t('percenter.affirm')
                    }}</button>
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

.main {
    width: 100vw;
    height: 100vh;
    background-color: #ffffff;
    backdrop-filter: blur(51px);
    background-image:
        url('@/assets/login-img1.svg'),
        url("@/assets/login-img2.svg"),
        url("@/assets/login-img3.svg"),
        url("@/assets/login-img4.svg"),
        url("@/assets/login-img5.svg");
    background-position:
        0, 80vw,
        45vw -100vh,
        30vw -30vh,
        -55vw 25vh;
    background-size:
        80% 100%,
        contain,
        cover,
        cover,
        cover;
    background-repeat: no-repeat;
    box-sizing: border-box;

}

.all {
    display: flex;
    align-items: flex-start;
    align-content: flex-start;
    justify-content: center;
    flex-wrap: nowrap;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .login {
        position: relative;
        top: 200px;
        left: 40px;
        width: 400px;
        min-width: 400px;
        height: 480px;
        background: white;
        border-radius: 10px;
        border: 1px solid #F0F0F0;
        box-shadow: 0px 20px 50px 0px rgba(12, 84, 178, 0.08);
        box-sizing: border-box;

        .login-page {
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            align-items: center;


            #login_container {
                width: 200px;
                height: 200px;
            }


            span {
                font-size: 20px;
                font-weight: 600;
                margin-top: 74px;
                margin-bottom: 46px;
                color: rgba(67, 67, 67, 1);
            }

            p {
                font-size: 13px;
                font-weight: 500;
                color: rgb(146 146 146);
                margin-top: 24px;

                a {
                    font-weight: 600;
                }
            }
        }

        .login-code {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;

            .Invitation_code {
                font-size: 20px;
                font-weight: 600;
                color: rgba(67, 67, 67, 1);
            }

            .inputs {
                display: flex;
                justify-content: space-between;
                width: 344px;

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

            .affirm {
                width: 344px;
                height: 44px;
                font-size: 14px;
                border: none;
                border-radius: 6px;
                background-color: rgba(24, 120, 245, 1);
                color: white;
                text-align: center;

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



