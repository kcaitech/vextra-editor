<template>
    <div class="container" v-if="projectInfo">
        <Header :switch="false" />
        <div class="content">
            <div class="img" style="width: 200px;height: 200px;background-color: #9775fa;border-radius: 4px;"></div>
            <div class="join" v-if="switchstate">
                <p>
                    申请加入项目：<strong></strong>
                    <span>（权限：<strong></strong>）</span>
                </p>
                <p>加入项目后，可访问该项目中的所有文件、资源</p>
                <button type="button" @click.stop="appluJoinProject" v-if="!isApply">申请加入</button>
                <p v-else>已发送申请，{{ time }}s即将进入应用首页，待审批通过后，可查看该项目内容</p>
            </div>
            <div class="offtips" v-else-if="projectInfo.self_perm_type === null">
                <p>您还未加入该项目的团队</p>
            </div>
            <div class="offtips" v-else>
                <p>项目邀请已关闭，如需加入项目，请联系项目管理员处理。</p>
            </div>
            <div class="join" v-if="!switchstate"><button type="button" @click.stop="backHome">返回首页</button></div>
        </div>
    </div>
</template>
<script setup lang="ts">
import Header from '@/components/AppHome/Header.vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import * as team_api from '@/apis/team'
import { router } from '@/router';

const route = useRoute();
const projectInfo = ref();
const switchstate = ref<boolean>();
const isApply = ref(false);

const getProjectInvitedInfo = async () => {
    try {
        const { data } = await team_api.getProjectInvitedInfoAPI({ project_id: route.query.id });
        projectInfo.value = data;
        if (data.self_perm_type >= data.invited_perm_type) {
            router.push({ path: '/apphome/project/' + route.query.id });
        }
    } catch (error) {
        console.log(error);
    }
}

const GetprojectLists = async () => {
    try {
        const { data } = await team_api.GetprojectLists()
        const project = data.filter((item: any) => item.project.id === route.query.id);
        switchstate.value = project[0].project.invited_switch;
        console.log(project,'project');
        
    } catch (error) {
        console.log(error);
    }
}

const time = ref(5)
const tohome = (() => {
    const timer = setInterval(() => {
        time.value -= 1
        if (time.value === 0) {
            router.push({ name: "apphome" })
            clearInterval(timer)
        }
    }, 1000)
})

const backHome = (() => {
    router.push({ name: "apphome" })
})

const appluJoinProject = () => {
    isApply.value = true;
    tohome();
    postApplyJoinProject();
}

const postApplyJoinProject = async () => {
    try {
        await team_api.applyJoinProjectAPI({ project_id: route.query.id });
    } catch (err) {
        console.log(err);
    }
}

onMounted(() => {
    getProjectInvitedInfo();
    GetprojectLists();
})
</script>
<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100vh;
    box-sizing: border-box;
    padding: 8px 24px;
    font-size: 13px;

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 200px;

        .join {
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

.img {
    margin-bottom: 20px;
}
</style>
