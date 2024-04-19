<template>

    <button v-if="route.query.code" @click="Login">点击登录</button>

    <div>{{ route.query.code }}</div>
</template>

<script setup lang="ts">
import { router } from "@/router";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import * as user_api from '@/request/users'
import { ElMessage } from "element-plus";
const route = useRoute()
const userid = ref('')
async function Login() {
    console.log('触发登录');
    
    user_api.PostWxLogin({ code: route.query.code }).then((linfo: any) => {
        if (linfo) {
            if (linfo.code === 0 && linfo.data.token !== '') {
                localStorage.setItem('token', linfo.data.token)
                localStorage.setItem('avatar', linfo.data.avatar)
                localStorage.setItem('nickname', linfo.data.nickname)
                localStorage.setItem('userId', linfo.data.id)
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
                    router.push({ name: 'mobilehome' })
                }
            } else if (linfo.code === 400) {
                userid.value = linfo.data.id

            } else if (linfo.code === -1) {

                ElMessage.error({ duration: 1500, message: '服务异常，请稍后再试' })

            }
        }
    }).catch((linfo: any) => {
        if (linfo.data.code === -1) {
            ElMessage.error(linfo.data.message)

        }

    })
}

onMounted(() => {
    Login()
})
</script>

<style lang="scss" scoped></style>
