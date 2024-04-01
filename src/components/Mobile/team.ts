import * as user_api from '@/request/users'
import { ElMessage } from 'element-plus'
import { ref } from 'vue';

export const GetteamList = async () => {
    try {
        const { data } = await user_api.GetteamList()
        return data
    } catch (error: any) {
        if (error.data.code === 401) {
            return
        } else {
            ElMessage.closeAll('error')
        }
    }
}

export const GetprojectLists = async (teamid: number) => {
    try {
        const { data } = await user_api.GetprojectLists({ team_id: teamid })
        return data
    } catch (error: any) {
        if (error.data.code === 401) {
            return
        } else {
            ElMessage.closeAll('error')
        }
    }
}