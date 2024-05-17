import { defineStore } from 'pinia'
import * as share_api from '@/request/share';
import * as team_api from '@/request/team';
import { computed, ref } from 'vue';

export const useMessage = defineStore('message', () => {
    const applyList = ref<any[]>([]);
    const teamApplyList = ref<any[]>([]);
    const projectApplyList = ref<any[]>([]);
    const notifyPApplyList = ref<any[]>([]);
    const notifyTApplyList = ref<any[]>([]);


    const totalList = computed(() => {
        return teamApplyList.value.concat(projectApplyList.value).concat(notifyPApplyList.value).concat(notifyTApplyList.value).sort((a: any, b: any) => {
            const timeA = new Date(a.request.created_at.replace(/-/g, '/').slice(0, 18)).getTime();
            const timeB = new Date(b.request.created_at.replace(/-/g, '/').slice(0, 18)).getTime();
            // 返回结果以实现降序排序
            return timeB - timeA;
        })
    })

    //获取文件申请列表
    function getApplyFile() {
        share_api.getApplyListAPI().then(({ code, data }) => {
            if (code === 0) {
                applyList.value = data
            } else {
                return
            }

        }).catch((error) => {

        })
    }


    //获取团队申请列表
    function getApplyTeam() {
        team_api.getTeamApplyAPI().then(({ code, data }) => {
            if (code === 0) {
                teamApplyList.value = data
            } else {
                return
            }
        }).catch(() => {

        })
    }

    //获取项目申请列表
    function getApplyProject() {
        team_api.getTeamProjectApplyAPI().then(({ code, data }) => {
            if (code === 0) {
                projectApplyList.value = data
            } else {
                return
            }
        }).catch(() => {

        })
    }


    //获取自身申请团队列表
    function getNoticeTeam() {
        team_api.getTeamNoticeAPI().then(({ code, data }) => {
            if (code === 0) {
                notifyTApplyList.value = data
            }
        }).catch(() => {

        })
    }

    //获取自身申请项目列表
    function getNoticeProject() {
        team_api.getProjectNoticeAPI().then(({ code, data }) => {
            if (code === 0) {
                notifyPApplyList.value = data
            }
        }).catch(() => {

        })
    }

    const applynum = computed(() => {
        return applyList.value.filter(item => item.apply.status === 0).length
    });
    const teamnum = computed(() => {
        return totalList.value.filter(item => item.request.status === 0).length
    });
    
    getApplyFile();
    getApplyTeam();
    getApplyProject();
    getNoticeTeam();
    getNoticeProject();

    return { applyList, totalList, applynum, teamnum, getApplyFile, getApplyTeam, getApplyProject, getNoticeTeam, getNoticeProject }
})