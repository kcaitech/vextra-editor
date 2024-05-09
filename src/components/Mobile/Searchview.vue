<template>
    <div class="container">
        <div class="search-input">
            <div class="s-header">
                <svg-icon icon-class="search-icon2"></svg-icon>
            </div>
            <input v-focus type="text" :placeholder="t('system.placeholder')" v-model="searchKey">
            <div v-if="searchKey.trim()" class="s-footer" @click="searchKey = ''">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="search-list">
            <FilesItem :data="data" @changeStar="changeStar" :searchkey="searchKey"></FilesItem>
        </div>
    </div>

</template>

<script setup lang="ts">
import FilesItem from './FilesItem.vue'
import { useSearchData } from './search'
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n'
import { changeStar as change } from './files'
import { ElMessage } from 'element-plus';
import { ref, toRaw, watch } from 'vue';
import { onMounted } from 'vue';

const { t } = useI18n()
const Data = useSearchData()
const { searchKey, searchData } = storeToRefs(Data)
const data = ref<any[]>([])


const changeStar = async (id: number, b: boolean) => {
    if (await change(id, b)) {
        searchData.value.filter((item) => {
            if (item.document.id === id) {
                item.document_favorites.is_favorite = !b
            }
            return item
        })
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: !b ? t('home.star_ok') : t('home.star_cancel') })
    }
}

watch(searchKey, () => {
    const test = toRaw(searchData)
    data.value = test.value
})


onMounted(() => {
    const test = toRaw(searchData)
    data.value = test.value
})
</script>


<style lang="scss" scoped>
.container {
    height: 100%;
    width: 100%;

    .search-input {
        flex: 80%;
        display: flex;
        align-items: center;
        height: 34px;
        border-radius: 8px;
        background: #FFFFFF;
        box-sizing: border-box;
        border: 1px solid #F5F5F5;
        margin: 8px 14px;

        &:focus-within {
            border-color: rgba(24, 120, 245, 1);
        }

        .s-header,
        .s-footer {
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 8px;

            svg {
                width: 100%;
                height: 100%;
            }

        }

        input {
            flex: 1;
            height: 100%;
            outline: none;
            border: none;
            background-color: initial;
            padding: 0;
            box-sizing: border-box;
        }
    }

    .search-list {
        position: relative;
        height: calc(100% - 50px)
    }
}
</style>
