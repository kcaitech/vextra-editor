<template>
    <div class="test">
        <div class="tab">
            <div :class="{ 'tab-item': true, 'item-select': activeTab === index }" v-for="(item, index) in  bntdata "
                :key="index" @click="activeTab = index">
                {{ item }}
                <div class="choose" :style="{ visibility: activeTab === index ? 'visible' : 'hidden' }"></div>
            </div>
        </div>
        <div ref="ellist" class="list">
            <FilesItem :data="lists"></FilesItem>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n'
import { getRecentlydata, getSharedata, getStardata } from './files'
import FilesItem from './FilesItem.vue'

const bntdata = ['最近', '收到的共享', '标星']
const activeTab = ref<number>(0)
const lists = ref<any[]>([])
const ellist = ref<HTMLElement>()
watchEffect(async () => {
    switch (activeTab.value) {
        case 0:
            lists.value = await getRecentlydata()
            break;
        case 1:
            lists.value = await getSharedata()
            break;
        case 2:
            lists.value = await getStardata()
            break;
        default:
            break;
    }
    if (ellist.value) {
        ellist.value.scrollTo(0,0);
    }
})



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
