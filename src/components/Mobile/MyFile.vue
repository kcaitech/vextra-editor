<template>
    <div class="list">
        <FilesItem :data="lists" @changeStar="changeStar"></FilesItem>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getDoucment } from './files'
import FilesItem from './FilesItem.vue';
import { changeStar as change } from './files'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const lists = ref<any[]>([])

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

onMounted(async () => {
    lists.value = await getDoucment()
})
</script>

<style lang="scss" scoped>
.list {
    height: 100%;
    overflow-y: scroll;
    padding: 0 14px;
}
</style>
