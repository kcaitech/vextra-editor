<template>
    <template v-if="!showtips">
        <div v-bind="containerProps" style="height: 100%;padding: 0 14px;">
            <div v-bind="wrapperProps">
                <div class="list-item" v-for=" item in list" :key="item.data.document.id" style="height: 84px;"
                    @click="openfile(item.data.document.id)">
                    <div class="image">
                        <img src="@/assets/file-default-icon.png" alt="file-icon">
                    </div>
                    <div class="content">
                        <div class="left">
                            <span class="name"> {{ item.data.document.name }}</span>
                            <span class="time">{{ !item.data.last ? item.data.document.created_at :
        item.data.document_access_record.last_access_time }}</span>
                        </div>
                        <div class="right" @click.stop>
                            <div class="share" @click="shareTo(item.data.document.id)">
                                <svg-icon icon-class="mShare"></svg-icon>
                            </div>
                            <div class="star"
                                @click="emits('changeStar', item.data.document.id, item.data.document_favorites.is_favorite)">
                                <svg-icon
                                    :style="{ padding: item.data.document_favorites.is_favorite ? '3.67px 3.27px' : '' }"
                                    :icon-class="item.data.document_favorites.is_favorite ? 'mStar-select' : 'mStar'"></svg-icon>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </template>
    <Loading v-if="loading" :size="20"></Loading>
    <div v-if="showtips && !props.errNetwork" class="null"><span>{{ searchkey ? t('miniprogram.search') : t('miniprogram.listnull') }}</span></div>
    <div v-if="props.errNetwork && !loading" class="errnetwork" @click="changeload">
        <span>{{ t('miniprogram.flushed') }}</span>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick, onUnmounted } from 'vue';
import Loading from '../common/Loading.vue';
import { useVirtualList } from '@vueuse/core'
import { router } from '@/router';
import { useI18n } from 'vue-i18n';

const {t}=useI18n()
const showtips = ref<boolean>(false)
const loading = ref<boolean>(true)
const props = withDefaults(defineProps<{
    data: any[],
    errNetwork?: boolean,
    index?: string,
    searchkey?: string,
}>(), {
    index: '0',
})

const filteredList = computed(() => props.data.filter(item => item))

const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(
    filteredList,
    {
        itemHeight: 84,
    },
)

const openfile = (id: string) => {
    router.push(({ name: 'pageviews', query: { id: id } }))
    const index = filteredList.value.findIndex(item => item.document.id === id)
    sessionStorage.setItem('scrollTop', index.toString())
}

const shareTo = (id: string) => {
    router.push({ name: 'share', query: { id: id } })
    const index = filteredList.value.findIndex(item => item.document.id === id)
    sessionStorage.setItem('scrollTop', index.toString())
}

const emits = defineEmits<{
    (e: 'changeStar', docID: number, b: boolean): void;
    (e: 'openfile', docID: number, index: number): void;
    (e: 'refresh', tab?: number): void;
    (e: 'sharefile', data: object): void;
}>()


watch([() => props.data, () => props.errNetwork], () => {
    if (props.data && props.data.length === 0) {
        showtips.value = true
    } else {
        showtips.value = false
    }
    loading.value = false
    nextTick(() => {
        if (Number(sessionStorage.getItem('scrollTop')) > 0) {
            scrollTo(Number(sessionStorage.getItem('scrollTop')))
            sessionStorage.removeItem('scrollTop')
        }
    })
})


const changeload = () => {
    loading.value = true
    emits('refresh', Number(sessionStorage.getItem('activeTab')))
}


onMounted(() => {

})

onUnmounted(() => {
    // 
})

</script>

<style lang="scss" scoped>
.errnetwork {
    height: 100%;
    display: flex;

    span {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 32px;
        background-color: #1878F5;
        box-shadow: 0 0 5px #1878F5;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 400;
        color: white;
        margin: auto;
    }
}

.null {
    display: flex;
    height: 100%;

    span {
        font-size: 14px;
        color: #BFBFBF;
        font-weight: 500;
        margin: auto;
    }
}

.list-item {
    display: flex;
    align-items: center;
    height: 84px;
    gap: 14px;
    width: 100%;
    overflow: hidden;

    .image {
        width: 40px;
        height: 40px;

        img {
            width: 100%;
            height: 100%;
        }
    }

    .content {
        display: flex;
        align-items: center;
        width: calc(100% - 54px);

        .left {
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: 100%;
            overflow: hidden;

            .name {
                line-height: 22px;
                font-size: 16px;
                font-weight: 500;
                color: #1F1F1F;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .time {
                line-height: 16px;
                font-size: 13px;
                font-weight: 400;
                color: #8C8C8C;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }

        .right {
            display: flex;
            align-items: center;
            gap: 8px;

            .share,
            .star {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;

                svg {
                    width: 24px;
                    height: 24px;
                    box-sizing: border-box;
                }
            }

        }
    }
}
</style>
