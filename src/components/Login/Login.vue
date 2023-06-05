<script setup lang='ts'>
import Describes from './Describes.vue'
import Footer from './Footer.vue'
import * as user_api from '@/apis/users'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { router } from '@/router'
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus'

const { t } = useI18n();
const isLoading = ref(false);
const showCode = ref(false)
const code = ref()
const codevalue = ref('')
const failed = ref<boolean>(false);
async function onmessage(e: any) {
    if (e.data?.type !== "GetWxCode") {
        return
    }
    isLoading.value = true
    let code = e.data.code
    //此处获取邀请码，并添加到请求参数中
    const tips: any = document.querySelector('#login_container')
    user_api.PostLogin({ code: code, invite_code: codevalue.value }).then((linfo: any) => {
        if (linfo) {
            if (linfo.code === 0 && linfo.data.token !== '') {
                localStorage.setItem('token', linfo.data.token)
                localStorage.setItem('avatar', linfo.data.avatar)
                localStorage.setItem('nickname', linfo.data.nickname)
                localStorage.setItem('userId', linfo.data.id)
                isLoading.value = false
                router.push({ name: 'apphome' })
            } else if (linfo.code === 400) {
                ElMessage.error(linfo.message)
                failed.value = true;
                tips.innerHTML = `${t('home.login_refresh')}`
                tips.addEventListener('click', () => {
                    wxcode()
                    failed.value = false;
                })

            } else {
                ElMessage.error(t('home.login_failed'))
                failed.value = true;
                tips.innerHTML = `${t('home.login_refresh')}`
                tips.addEventListener('click', () => {
                    wxcode()
                    failed.value = false;
                })
            }
        } else {
            ElMessage.error(t('home.login_failed'))
            failed.value = true;
            tips.innerHTML = `${t('home.login_refresh')}`
            tips.addEventListener('click', () => {
                wxcode()
                failed.value = false;
            })
        }
    }).catch(() => {
        ElMessage.error(t('home.login_failed'))
        failed.value = true;
        tips.innerHTML = `${t('home.login_refresh')}`
        tips.addEventListener('click', () => {
            wxcode()
            failed.value = false;
        })
    })
}

function wxcode() {
    new (window as any).WxLogin({
        self_redirect: true,
        id: "login_container",
        appid: "wx42bb87f7f2e86a6e",
        scope: "snsapi_login",
        redirect_uri: encodeURIComponent("http://protodesign.cn/html/GetCode.html"),
        state: "STATE",
        style: "",
        href: 'data:text/css;base64,LmltcG93ZXJCb3ggLnRpdGxlIHtkaXNwbGF5OiBub25lO30KLmltcG93ZXJCb3ggLmluZm8ge2Rpc3BsYXk6IG5vbmU7fQouaW1wb3dlckJveCAucXJjb2RlIHtib3JkZXI6IG5vbmU7fQouc3RhdHVzX2ljb24ge2Rpc3BsYXk6IG5vbmU7fQouaW1wb3dlckJveCAuc3RhdHVzIHtkaXNwbGF5OiBub25lO30KLndlYl9xcmNvZGVfdHlwZV9pZnJhbWUge3dpZHRoOiAzMDBweDtoZWlnaHQ6IDMwMHB4O30=',
    })
}

onMounted(() => {
    setTimeout(() => {
        isLoading.value = true
        wxcode()
        const login: any = document.querySelector('iframe')
        login.addEventListener('load', function () {
            isLoading.value = false
            showCode.value = true
            nextTick(() => {
                code.value.focus()
            })

        })
    }, 500);
    window.addEventListener('message', onmessage, false)
})

onUnmounted(() => {
    window.removeEventListener('message', onmessage)
})

</script>

<template>
    <html lang="en">
    <Describes />
    <div class="login">
        <span>{{ t('system.wx_login') }}</span>
        <div id="login_container" :class="{ 'login_container_hover': failed }" v-loading="isLoading"></div>
        <span class="Invitation_code" v-if="showCode">邀请码：<input ref="code" v-model="codevalue" maxlength="8" /></span>
        <p>{{ t('system.login_read') }}
            <a href="">{{ t('system.read_TOS') }}</a>&nbsp;
            <a href="">{{ t('system.read_Privacy') }}</a>
        </p>
    </div>
    <Footer />

    </html>
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

html {
    overflow: auto;
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: center;
    flex-wrap: wrap;
    width: 100vw;
    height: 100vh;
    background: conic-gradient(from 207deg at 100% 0%, rgba(73, 125, 202, 0.00) -113deg, #542FDB 93deg, rgba(84, 47, 219, 0.54) 155deg, rgba(84, 47, 219, 0.31) 195deg, rgba(73, 125, 202, 0.00) 247deg, #542FDB 453deg);
    background-blend-mode: color-dodge;

    .login {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        margin: 0 100px;
        width: 420px;
        height: 500px;
        text-align: center;
        background: #FFFFFF;
        border-radius: 5px;
        z-index: 2;
        box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.2);

        div {
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

        .Invitation_code {
            font-size: 14px;
            font-weight: 600;
            margin: 0;
            letter-spacing: 5px;

            input {
                width: 65px;
                font-size: 14px;
                font-weight: 600;
                color: rgba(0, 0, 0, 0.8);
                text-align: center;
                border-radius: 2px;
                border: 2px rgb(65, 65, 65) solid;
                outline: none;

                &:hover {
                    border-radius: 2px;
                    border: 2px rgb(69, 69, 255) solid;
                    border-color: rgb(69, 69, 255);
                }

                &:focus {
                    border-radius: 2px;
                    border: 2px rgb(69, 69, 255) solid;
                    border-color: rgb(69, 69, 255);
                }
            }

        }

        p {
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 2px;
            color: rgb(152, 148, 148);
            margin-top: 20px;

        }

    }
}
</style>



