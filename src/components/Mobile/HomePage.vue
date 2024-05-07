<template>
    <div class="test">
        <div class="tab">
            <div :class="{ 'tab-item': true, 'item-select': activeTab === index }" v-for="(item, index) in  bntdata "
                :key="index" @click="changetab(index)">
                {{ item }}
                <div class="choose" :style="{ visibility: activeTab === index ? 'visible' : 'hidden' }"></div>
            </div>
        </div>
        <div ref="ellist" class="list">
            <component :is="FilesItem" :data="lists" :tab="activeTab" :err-network="errnetwork" @changeStar="changeStar"
                @refresh="refreshTab"></component>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n'
import { getRecentlydata, getSharedata, getStardata, changeStar as change } from './files'
import FilesItem from './FilesItem.vue'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const bntdata = [t('miniprogram.recent'), t('miniprogram.share'), t('miniprogram.star')]
const activeTab = ref<number>(Number(sessionStorage.getItem('activeTab')) || 0)
const lists = ref<any[]>([])
const errnetwork = ref<boolean>(false)
const changetab = (id: number) => {
    activeTab.value = id
    sessionStorage.setItem('activeTab', id.toLocaleString())
}


const refreshTab = async (tab?: number): Promise<void> => {
    let data: any
    switch (tab) {
        case 0:
            data = await getRecentlydata()
            break;
        case 1:
            data = await getSharedata()
            break;
        case 2:
            data = await getStardata()
            break;
        default:
            break;
    }
    if (data.state === 'success') {
        errnetwork.value = false
        lists.value = data.data
    } else {
        errnetwork.value = true
        lists.value = []
        ElMessage.error({ duration: 3000, message: data.data.message })
    }
}

watchEffect(async () => {
    let data: any
    switch (activeTab.value) {
        case 0:
            data = await getRecentlydata()
            break;
        case 1:
            data = await getSharedata()
            break;
        case 2:
            data = await getStardata()
            break;
        default:
            break;
    }
    if (data.state === 'success') {
        errnetwork.value = false
        lists.value = data.data
    } else {
        errnetwork.value = true
        lists.value = []
        ElMessage.error({ duration: 3000, message: data.data.message })
    }
})


const changeStar = async (id: number, b: boolean) => {
    if (await change(id, b)) {
        if (activeTab.value === 2) {
            lists.value = lists.value.filter(item => item.document.id !== id)
        } else {
            lists.value = lists.value.map((item) => {
                if (item.document.id === id) {
                    item.document_favorites.is_favorite = !b
                }
                return item
            }
            )
        }
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: !b ? t('home.star_ok') : t('home.star_cancel') })
    }
}


onMounted(() => {

})

</script>

<style lang="scss" scoped>
.test {
    width: 100%;
    height: 100%;

    .tab {
        display: flex;
        align-items: center;
        gap: 20px;
        height: 40px;
        border-bottom: 1px solid #F1F2F2;

        .tab-item:nth-child(1) {
            margin-left: 14px;
        }

        .tab-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: #8C8C8C;
            font-size: 14px;
            font-weight: 400;
            gap: 2px;

            .choose {
                width: 12px;
                height: 2px;
                background-color: #1a1c1f;
                border-radius: 100px;
            }
        }
    }

    .list {
        height: calc(100% - 40px);
        overflow-y: scroll;
    }
}

.item-select {
    color: #1F1F1F !important;
    font-size: 15px !important;
    font-weight: 500 !important;
}
</style>
