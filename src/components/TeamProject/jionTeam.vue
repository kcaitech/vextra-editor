<template>
    <div class="container">
        <Header :switch="false" />
        <div class="content">
            <div class="img" style="width: 400px;height: 400px;background-color: silver;border-radius: 4px;"></div>
            <div v-if="teaminfo?.invited_switch" class="join">
                <p>
                    申请加入团队：<strong>{{ teaminfo?.name }}</strong>
                    <span>（权限：<strong>{{ checktype(teaminfo?.invited_perm_type) }}</strong>）</span>
                </p>
                <p>加入团队后，可访问该团队中的项目、文件、资源</p>
                <button v-if="showjoinbnt" type="button" @click.stop="joinTeam(teaminfo?.id, undefined)">申请加入</button>
                <p v-else style="font-size: 18px;">已发送申请，{{ time }}s即将进入应用首页，待审批通过后，可查看该团队内容</p>
            </div>
            <div v-else class="offtips">
                <p style="font-size: 18px;">团队邀请已关闭，如需加入团队，请联系团队管理员处理。</p>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import Header from '@/components/AppHome/Header.vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus';
import { router } from '@/router';

interface teaminfotype {
    id: string,
    name: string,
    invited_perm_type: number,
    self_perm_type: number,
    invited_switch: boolean
}

const route = useRoute()
const teaminfo = ref<teaminfotype>()
const showjoinbnt = ref(true)
const Getteaminfo = async (teamid: string) => {
    try {
        const { code, data } = await user_api.Getteaminfo({ team_id: teamid })
        if (code === 0) {
            teaminfo.value = data
        } else {
            ElMessage.error('获取失败')
        }
    } catch (error) {

    }
}

const time = ref(5)
const tohome = (() => {
    const timer = setInterval(() => {
        time.value -= 1
        if (time.value === 0) {
            router.push({ name: "apphome" })
            if (timer) clearInterval(timer)
        }
    }, 1000)
})


const joinTeam = async (id: any, notes?: any) => {
    try {
        const { code, message, data } = await user_api.JoinTeam({ team_id: id, applicant_notes: notes })
        if (code === 0) {
            showjoinbnt.value = false
            tohome()
        } else if (code === 400) {
            if (data.code === 1) ElMessage.error('团队不存在')
            if (data.code === 2) return
            if (data.code === 3) router.push({ path: `/apphome/teams/${id}` })
            if (data.code === 4) showjoinbnt.value = false, tohome()
        } else {
            ElMessage.error(message)
        }
    } catch (error) {

    }
}

const checktype = (type: any) => {
    switch (type) {
        case 0:
            return '阅读'
        case 1:
            return '编辑'
        default:
            break
    }
}

onMounted(() => {
    if (typeof route.query.teamid === 'string') {
        Getteaminfo(route.query.teamid)
    }
})
</script>
<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100vh;
    box-sizing: border-box;
    padding: 8px 24px;

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 200px;

        .join {
            font-size: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;

            button {
                cursor: pointer;
                border: none;
                width: 120px;
                height: 40px;
                border-radius: 4px;
                background-color: #9775fa;
                box-sizing: border-box;
                transition: all 0.5s ease-out;
                color: white;
                font-weight: 600;
                letter-spacing: 2px;

                &:hover {
                    background-color: rgba(150, 117, 250, 0.862745098);
                }
            }
        }
    }
}
</style>
