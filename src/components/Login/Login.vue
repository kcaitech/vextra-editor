<script setup lang='ts'>
import Describes from './Describes.vue'
import Footer from './Footer.vue'
import * as user_api from '@/apis/users'
import { onMounted, ref } from 'vue'
import { router } from '@/router'
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const isLoading = ref(false);

async function onmessage(e: any) {
    if (e.data?.type !== "GetWxCode") {
        return
    }
    isLoading.value = true
    let code = e.data.code
    const linfo: any = await user_api.PostLogin({ code: code });
    if (linfo.code === 0 && linfo.data.token !== '') {
        localStorage.setItem('token', linfo.data.token)
        localStorage.setItem('avatar', linfo.data.avatar)
        localStorage.setItem('nickname', linfo.data.nickname)
        localStorage.setItem('id', linfo.data.id)
        isLoading.value = false
        router.push({ name: 'apphome' })
    }
}

onMounted(() => {

    setTimeout(() => {
        isLoading.value = true
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
        const login: any = document.querySelector('iframe')
        login.addEventListener('load', function () {
            isLoading.value = false
        })
    }, 500);

    window.addEventListener('message', onmessage, false)

})

</script>

<template>
    <html>
    <Describes />
    <div class="login">
        <span>{{ t('system.wx_login') }}</span>
        <div id="login_container" v-loading="isLoading"></div>
        <p>{{ t('system.login_read') }}
            <a href="">{{ t('system.read_TOS') }}</a>&nbsp;
            <a href="">{{ t('system.read_Privacy') }}</a>
        </p>
    </div>
    <Footer />

    </html>
</template>

<style lang='scss' scoped>
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
        div{
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
            color: rgb(152, 148, 148);
            margin-top: 20px;

        }

    }
}
</style>



