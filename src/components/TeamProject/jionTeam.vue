<template>
    <div class="container">
        <Header :switch="false" />
        <div class="content" v-if="teaminfo">
            <div class="img" style="width: 400px;height: 400px;background-color: silver;border-radius: 4px;"></div>
            <div v-if="switchstate" class="join">
                <p>
                    {{ t('joinTeam.jointeamtipsA') }}<strong>{{ teaminfo?.name }}</strong>
                    <span>（{{ t('Createteam.jurisdiction') }}：<strong>{{ checktype(teaminfo?.invited_perm_type)
                    }}</strong>）</span>
                </p>
                <p>{{ t('joinTeam.jurisdiction') }}</p>
                <button v-if="showjoinbnt" type="button"
                    @click.stop="joinTeam(teaminfo?.id, undefined)">{{ t('joinTeam.jointeamtipsB') }}</button>
                <p v-else style="font-size: 18px;">{{ t('joinTeam.jointeamtipsC') }}{{ time
                }}s{{ t('joinTeam.jointeamtipsC1') }}</p>
            </div>
            <div v-else class="offtips">
                <p style="font-size: 18px;">{{ t('joinTeam.jointeamtipsD') }}</p>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import Header from '@/components/AppHome/Header.vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import * as user_api from '@/request/users'
import { ElMessage } from 'element-plus';
import { router } from '@/router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
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
const switchstate = ref<boolean>()

const Getteaminfo = async (teamid: string) => {
    try {
        const { code, data, message } = await user_api.Getteaminfo({ team_id: teamid })
        if (code === 0) {
            if (data.self_perm_type != null && data.self_perm_type !== 255) {
                if (data.self_perm_type >= data.invited_perm_type) {
                    return router.push({ path: '/apphome/teams/' + teamid });
                }
            }
            teaminfo.value = data
            switchstate.value = teaminfo.value?.invited_switch
        } else {
            ElMessage.error(message)
            router.push({name:'apphome'})
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
            sessionStorage.setItem('index', '1');
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
            if (data.code === 2) switchstate.value = false
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
            return t('joinTeam.read')
        case 1:
            return t('joinTeam.edit')
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
}</style>
