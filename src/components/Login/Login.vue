<script setup lang='ts'>
import Describes from './Describes.vue'
import Footer from './Footer.vue'
import * as user_api from '@/apis/users'
import { ref } from 'vue'
import { router } from '@/router'
import { ElLoading } from 'element-plus'
import { ElMessage } from 'element-plus'

const isLife = ref(false)
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

async function getUserItems() {
    // fullscreenLoading.value = true
    // const param = {
    //     nickname: '1'
    // }    
    loading.value = true
    try {
        const res = await user_api.PostLogin();
        loading.value = false
        const token: any = res.data.token
        localStorage.setItem('token', token)
        ElMessage('登录成功')
        router.push({ name: 'apphome' })
    } catch (error) {
        loading.value = false
        ElMessage.error('访问失败，请检测网络')
    }
}

async function getUserInfo() {
    try {
        const res1 = await user_api.GetDocumentsList();
        console.log(res1);

    } catch (error) {
        // 
    }
}
// console.log(res);
// console.log(res.code);

// if (res.code === 0) {

//     fullscreenLoading.value = false
//     router.push({ name: 'apphome' })
// }





    // const res2 = await user_api.GetDocumentsList()

    // console.log(res2)

</script>

<template>
    <html>
    <Describes></Describes>
    <div class="login" v-loading="loading" :element-loading-svg="svg" element-loading-svg-view-box="-10, -10, 50, 50">
        <div>
            <button type="button" id="button1" @click="getUserItems">手机登录</button>
            <button type="button" id="button2" @click="getUserInfo">微信登录</button>
        </div>
        <div v-if="isLife = !isLife" id="login-container"> 我是手机登录</div>
        <div v-if="isLife = !isLife" id="login-container"> 我是微信登录</div>
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

    div {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-evenly;
        align-items: center;

        button {
            width: 80%;
            width: 100px;
            height: 40px;
            background: none;
            border: none;
            box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.2);
            border-radius: 5px;
            color: black;
            font-weight: bold;
            letter-spacing: 2px;
            padding: 5px;
            margin-left: 20px;
            margin-right: 20px;
            margin-bottom: 40px;
            &:hover {
                background-color: rgb(72, 72, 240);
                color: white;
                cursor: pointer;
            }


        }



    }


    >img {
        width: 50%;
        box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.2);
    }

    >p {
        font-size: 80%;
        font-weight: bold;
        letter-spacing: 2px;
        color: rgb(152, 148, 148);
        margin-top: 60px;
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



