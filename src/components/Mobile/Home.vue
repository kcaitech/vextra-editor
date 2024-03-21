<template>
    <div class="tab">
        <div class="tab-item" :class="{ 'item-select': activeTab === index }" v-for="(item, index) in  bntdata "
            :key="index" @click="activeTab = index">
            {{ item }}
            <div class="choose" :style="{ visibility: activeTab === index ? 'visible' : 'hidden' }"></div>
        </div>
    </div>
    <div class="list">
        <div class="list-item" v-for=" item  in lists" :key="item.document.id">
            {{ item.document.name }}
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n'
import { getRecentlydata, getSharedata, getStardata } from './files'

const bntdata = ['最近', '收到的共享', '标星']
const activeTab = ref<number>(0)
const lists = ref<any[]>([])

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
})

onMounted(() => {

})

</script>
<style lang="scss" scoped>
.tab {
    display: flex;
    align-items: center;
    gap: 20px;
    height: 40px;

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
}

.item-select {
    color: #1F1F1F !important;
    font-size: 15px !important;
    font-weight: 500 !important;
}
</style>
