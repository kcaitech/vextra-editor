<template>
    <div class="failed">
        <button v-if="loginFailed" @click="againLogin">重新登录</button>
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
        (window as any).uni.redirectTo({
            url: '/pages/index/index',
        });
        (window as any).uni.postMessage({
            data: {
                login: 'false',
            }
        });
    }
}

async function Login() {
    user_api.PostWxLogin({ code: route.query.code }).then((linfo: any) => {
        if (linfo) {
            if (linfo.code === 0 && linfo.data.token !== '') {
                localStorage.setItem('token', linfo.data.token)
                localStorage.setItem('avatar', linfo.data.avatar)
                localStorage.setItem('nickname', linfo.data.nickname)
                localStorage.setItem('userId', linfo.data.id)
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
                    router.push({ name: 'mobilehome' })
                }
            } else if (linfo.code === 400) {
                userid.value = linfo.data.id

            } else if (linfo.code === -1) {
                ElMessage.error({ duration: 1500, message: '服务异常，请稍后再试' })
                loginFailed.value = true
            }
        }
    }).catch((linfo: any) => {
        if (linfo.data.code === -1) {
            ElMessage.error(linfo.data.message)
        }
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
</style>
