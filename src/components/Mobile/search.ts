import { computed, ref, watchEffect } from 'vue'
import { getDoucment, getSharedata } from './files'
import { defineStore } from 'pinia'
import PinyinMatch from 'pinyin-match'

export const useSearchData = defineStore('search', () => {
    const searchKey = ref<string>('')
    const filelist = ref<any[]>([])
    const sharelist = ref<any[]>([])

    getDoucment().then((res) => {
        filelist.value = res.data
        
        
    })
    getSharedata().then((res) => {
        sharelist.value = res.data
    })

    const searchData = computed(() => {
        return filelist.value.concat(sharelist.value).filter((item: any) => {
            if(item.document.name){
              return  PinyinMatch.match(item.document.name.toLowerCase(), searchKey.value.toLowerCase())
            }
        })
    })
    return { searchData, searchKey }
})


