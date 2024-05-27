<template>
    <div class="failed">
        <button v-if="loginFailed" @click="againLogin">重新加载</button>
        <div v-else class="container">
            <div class="loading"></div>
            <div class="content">正在加载</div>
        </div>
    </div>
    
</template>

<script setup lang="ts">
import { router } from "@/router";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import * as user_api from '@/request/users'
import { ElMessage } from "element-plus";

const route = useRoute()
const userid = ref('')
const loginFailed = ref<boolean>(false)

const againLogin = () => {
    localStorage.clear();
    // window.location.href = window.location.href + "#wechat_redirect";
    let miniprogram: any;
    miniprogram = navigator.userAgent.includes('miniProgram')
    if (miniprogram) {
        (window as any).wx.miniProgram.postMessage({
            data: {
                login: false,
            }
        });
        (window as any).wx.miniProgram.redirectTo({
            url: '/pages/index/index',
        });

    }
}

async function Login() {
    await user_api.PostWxLogin({ code: route.query.code }).then((linfo: any) => {
        if (linfo) {
            console.log(linfo);
            if (linfo.code === 0 && linfo.data.token !== '') {
                localStorage.setItem('token', linfo.data.token);
                localStorage.setItem('avatar', linfo.data.avatar);
                localStorage.setItem('nickname', linfo.data.nickname);
                localStorage.setItem('userId', linfo.data.id);

                (window as any).wx.miniProgram.redirectTo({
                    url: '/pages/index1/index',
                });
                (window as any).wx.miniProgram.postMessage({
                    data: {
                        login: true,
                    }
                })

            } else if (linfo.code === 400) {
                userid.value = linfo.data.id
                loginFailed.value = true
            } else if (linfo.code === -1) {
                ElMessage.error({ duration: 1500, message: '服务异常，请稍后再试' })
                loginFailed.value = true
            }
        }
    }).catch((linfo: any) => {
        alert(linfo)
        loginFailed.value = true
    })
}

onMounted(() => {
    Login()
})
</script>

<style lang="scss" scoped>
.failed {
    display: flex;
    width: 100%;
    height: 100%;

    button {
        margin: auto;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        color: white;
        font-size: 13px;
        background-color: rgba(24, 120, 245, 1);
    }
}

.container {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading {
    border: 2px solid transparent;
    border-top: 2px solid blue;
    border-left: 2px solid blue;
    border-bottom: 2px solid blue;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    color: #000;
    animation: spin 1s linear infinite;
}

.content {
    margin-left: 8px;
    font-size: 14px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
