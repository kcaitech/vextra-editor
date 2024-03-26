<template>
    <div ref="ellist" class="list">
        <FilesItem :data="lists" @changeStar="changeStar" @openfile="openfile"></FilesItem>
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



onMounted(async () => {
    let data: any
    try {
        data = await getDoucment()
        if (data.state === 'success') {
            errnetwork.value = false
            lists.value = data.data
        } else {
            errnetwork.value = true
            ElMessage.error({ duration: 3000, message: data.data.message })
        }
    } catch (error) {
        console.log(error);

    }

    if (ellist.value) {
        setTimeout(() => {
            ellist.value!.scrollTop = Number(sessionStorage.getItem('scrolltop'))
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
