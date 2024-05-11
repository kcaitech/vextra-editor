import * as user_api from '@/request/users'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useCounterStore = defineStore('team', () => {
    const teamlist = ref<any[]>([])
    const projectlist = ref<any[]>([])
    const tips = ref<string>('')


    async function GetteamList() {
        try {
            const { code, data, message } = await user_api.GetteamList()
            if (code === 0) {
                teamlist.value = data
            } else {
                tips.value = message
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function GetprojectLists() {
        try {
            const { code, data, message } = await user_api.GetprojectLists()
            if (code === 0) {
                projectlist.value = data
            } else {
                tips.value = message
            }
            return data
        } catch (error) {
            console.log(error);
        }
    }
    return { teamlist, projectlist, tips, GetteamList, GetprojectLists }
})

