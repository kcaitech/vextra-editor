<template>
    <div class="projectfile">
        <div class="header">
            <svg-icon icon-class="back-icon" @click="router.go(-1)"></svg-icon>
            <span>{{ filename }}</span>
        </div>
        <div ref="ellist" class="list">
            <FilesItem :err-network="errnetwork" :data="lists" @changeStar="changeStar" @openfile="openfile"
                @refresh="getdocument" @sharefile="data"></FilesItem>
        </div>
        <ShareFile class="share" v-if="docid" @close="docid = ''" :docId="docid"></ShareFile>
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
import { useRoute } from 'vue-router'
import ShareFile from './ShareFile.vue';

const route = useRoute()
const { t } = useI18n()
const lists = ref<any[]>([])
const ellist = ref<HTMLElement>()
const errnetwork = ref<boolean>(false)
const filename = ref<string>(route.query.name as string)
const docid = ref<string>('')

const data = (data: any) => {
    docid.value = data.document.id
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
        data = await getDoucment(route.query.id as string)
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
    const value = Number(sessionStorage.getItem('scrolltop')) || 0
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
.projectfile {
    height: 100%;
    width: 100%;
    background-color: #fff;


    .header {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 44px;

        svg {
            position: absolute;
            width: 28px;
            height: 28px;
            left: 14px;
        }

        span {}
    }

    .list {
        height: calc(100% - 44px);
        overflow-y: scroll;
        padding: 0 14px;
    }
}
</style>
