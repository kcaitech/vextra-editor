import * as user_api from '@/request/users'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useCounterStore = defineStore('team', () => {
    const list = ref<any[] | string>('')

    

    async function GetteamList() {
        try {
            const { code, data, message } = await user_api.GetteamList()
            if (code === 0) {
                list.value = data
            } else {
                list.value = message
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function GetprojectLists() {
        try {
            const { code, data, message } = await user_api.GetprojectLists()
            if (code === 0) {
                list.value = data
            } else {
                list.value = message
            }
            return data
        } catch (error) {
            console.log(error);
        }
    }
    return { list, GetteamList, GetprojectLists }
})

