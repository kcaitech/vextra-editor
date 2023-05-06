<script setup lang='ts'>
import Describes from './Describes.vue'
import Footer from './Footer.vue'
import * as user_api from '@/apis/users'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { router } from '@/router'
import { ElLoading } from 'element-plus'
import { ElMessage } from 'element-plus'
const loading = ref(false)
const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `

async function onmessage(e: any) {
    if (e.data?.type !== "GetWxCode") {
        return
    }
    let code = e.data.code
    const linfo: any = await user_api.PostLogin({ code: code });
    if (linfo.code === 0 && linfo.data.token !== '') {
        localStorage.setItem('token', linfo.data.token)
        router.push({ name: 'apphome' })
    }
}

async function getUserInfo() {
    try {
        const res1 = await user_api.GetDocumentsList();
        
    } catch (error) {
        // 
    }
}
// console.log(res);
// console.log(res.code);
onMounted(() => {
    setTimeout(() => {
        new (window as any).WxLogin({
            self_redirect: true,
            id: "login_container",
            appid: "wx42bb87f7f2e86a6e",
            scope: "snsapi_login",
            redirect_uri: encodeURIComponent("http://protodesign.cn/html/GetCode.html"),
            state: "STATE",
            style: "",
            href: 'data:text/css;base64,LmltcG93ZXJCb3ggLnRpdGxlIHtkaXNwbGF5OiBub25lO30KLmltcG93ZXJCb3ggLmluZm8ge2Rpc3BsYXk6IG5vbmU7fQouc3RhdHVzX2ljb24ge2Rpc3BsYXk6IG5vbmU7fQouaW1wb3dlckJveCAuc3RhdHVzIHtkaXNwbGF5OiBub25lO30KLndlYl9xcmNvZGVfdHlwZV9pZnJhbWUge3dpZHRoOiAzMDBweDtoZWlnaHQ6IDMwMHB4O30=',
        })
    }, 1000);

    window.addEventListener('message', onmessage, false)
})

onBeforeUnmount(() => {
    window.removeEventListener('message', onmessage)
})

</script>

<template>
    <html>
    <Describes></Describes>
    <div class="login">
        <span>微信登录</span>
        <div id="login_container"></div>
        <p>扫码表示已阅读并同意<a href="">《使用协议》</a>及<a href="">《隐私政策》</a></p>
    </div>
    <Footer></Footer>

    </html>
</template>

<style lang='scss' scoped>
html {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    width: 100vw;
    height: 100vh;
    background: conic-gradient(from 207deg at 100% 0%, rgba(73, 125, 202, 0.00) -113deg, #542FDB 93deg, rgba(84, 47, 219, 0.54) 155deg, rgba(84, 47, 219, 0.31) 195deg, rgba(73, 125, 202, 0.00) 247deg, #542FDB 453deg);
    background-blend-mode: color-dodge;
}

.login {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    margin: 0 100px;
    width: 480px;
    height: 560px;
    text-align: center;
    background: #FFFFFF;
    border-radius: 5px;
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.2);
    animation: myfirst 2s;

    span {
        font-size: 18px;
        font-weight: bold;
        margin-top: 40px;
        margin-bottom: 20px;
        letter-spacing: 2px;
    }

    p {
        font-size: 80%;
        font-weight: bold;
        letter-spacing: 2px;
        color: rgb(152, 148, 148);
        margin-top: 20px;

    }


}



@keyframes myfirst {
    0% {
        opacity: 0;
        width: 240px;
        height: 280px;
    }

    25% {
        opacity: 0;
    }

    50% {
        opacity: 0.5;
    }

    75% {
        opacity: 0.8;
    }

    100% {
        opacity: 1;
        width: 480px;
        height: 560px;
    }
}

@media screen and (max-width: 800px) {
    .login {
        width: 400px;
        height: 450px;
    }

    .logo {
        display: none;
    }

}

@media screen and (max-height: 1000px) {
    .login {
        width: 400px;
        height: 450px;
    }

    .logo {
        display: none;
    }

}
</style>



