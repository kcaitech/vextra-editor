<template>
    <div ref="ellist" class="list">
        <FilesItem :err-network="errnetwork" :data="lists" @changeStar="changeStar" @refresh="getdocument"></FilesItem>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { getDoucment } from './files'
import FilesItem from './FilesItem.vue';
import { changeStar as change } from './files'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

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
        })
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: !b ? t('home.star_ok') : t('home.star_cancel') })
    }
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
    await getdocument()
})

onUnmounted(() => {

})
</script>

<style lang="scss" scoped>
.list {
    height: 100%;
    overflow-y: scroll;

}
</style>
