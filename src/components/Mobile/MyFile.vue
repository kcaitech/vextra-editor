<template>
    <div ref="ellist" class="list">
        <FilesItem :err-network="errnetwork" :data="lists" @changeStar="changeStar" @openfile="openfile"
            @refresh="getdocument" @sharefile="data"></FilesItem>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { getDoucment } from './files'
import FilesItem from './FilesItem.vue';
import { changeStar as change } from './files'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { router } from '@/router';

const { t } = useI18n()
const lists = ref<any[]>([])
const ellist = ref<HTMLElement>()
const errnetwork = ref<boolean>(false)

const emits = defineEmits<{
    testevnt: [data: object]
}>()

const data = (data: object) => {
    emits('testevnt', data)
}

const changeStar = async (id: number, b: boolean) => {
    if (await change(id, b)) {
        lists.value = lists.value.map((item) => {
            if (item.document.id === id) {
                item.document_favorites.is_favorite = !b
            }
            return item
        }
        )
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: !b ? t('home.star_ok') : t('home.star_cancel') })
    }
}

const openfile = (id: number) => {
    sessionStorage.setItem('scrolltop', ellist.value!.scrollTop.toString())
    router.push(({ name: 'pageviews', query: { id: id } }))
}

async function getdocument() {
    let data: any
    try {
        data = await getDoucment()
        if (data.state === 'success') {
            errnetwork.value = false
            lists.value = data.data
        } else {
            errnetwork.value = true
            lists.value = []
            ElMessage.error({ duration: 3000, message: data.data.message })
        }
    } catch (error) {
        console.log(error);

    }
}


onMounted(async () => {
    const value = Number(sessionStorage.getItem('scrolltop'))
    await getdocument()
    if (ellist.value !== undefined) {
        setTimeout(() => {
            if (ellist.value !== undefined) {
                if (ellist.value.scrollTop === null) {
                    return
                }
                ellist.value.scrollTop = value
            }
            sessionStorage.setItem('scrolltop', '0')
        }, 0)
    }
})

onUnmounted(() => {

})
</script>

<style lang="scss" scoped>
.list {
    height: 100%;
    overflow-y: scroll;
    padding: 0 14px;
}
</style>
