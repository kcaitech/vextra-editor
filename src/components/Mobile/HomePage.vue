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
            <FilesItem :err-network="errnetwork" :data="lists" @changeStar="changeStar" @openfile="openfile"
                @refresh="refreshTab" @sharefile="data" :index=listindex>
            </FilesItem>
        </div>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch, watchEffect, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n'
import { getRecentlydata, getSharedata, getStardata, changeStar as change } from './files'
import FilesItem from './FilesItem.vue'
import { ElMessage } from 'element-plus'
import { router } from '@/router';

const { t } = useI18n()
const bntdata = ['最近', '收到的共享', '标星']
const activeTab = ref<number>(Number(sessionStorage.getItem('activeTab')) || 0)
const lists = ref<any[]>([])
const listindex = ref<number>(0)
const errnetwork = ref<boolean>(false)
const changetab = (id: number) => {
    activeTab.value = id
    sessionStorage.setItem('activeTab', id.toLocaleString())
}

const emits = defineEmits<{
    testevnt: [data: object]
}>()

const data = (data: object) => {
    emits('testevnt', data)
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

    listindex.value = Number(sessionStorage.getItem('scrolltop'))

})

watch(activeTab, () => {
    sessionStorage.setItem('scrolltop', '0')
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

const openfile = (id: number, index: number) => {
    sessionStorage.setItem('scrolltop', index.toString())
    router.push(({ name: 'pageviews', query: { id: id } }))
}

onMounted(() => {
    window.document.title = '首页'
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
            transition: all 0.25s ease-in;

            .choose {
                width: 12px;
                height: 2px;
                background-color: #1878F5;
                border-radius: 100px;
            }
        }
    }

    .list {
        height: calc(100% - 40px);
        overflow-y: scroll;
        padding: 0 14px;

    }
}

.item-select {
    color: #1F1F1F !important;
    font-size: 15px !important;
    font-weight: 500 !important;
}
</style>
