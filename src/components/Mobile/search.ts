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
        return filelist.value.concat(sharelist.value).filter((el: any) => PinyinMatch.match(el.document.name.toLowerCase(), searchKey.value.toLowerCase()))
    })

    watchEffect(()=>{
        console.log(searchKey.value,searchData.value);
        
    })

    return { searchData, searchKey }
})


