
<template>
    <RecycleScroller class="scroller" :items="props.items" :item-size="56" key-field="document" v-slot="{ item }">
        <div :class="{ 'user': 'user', 'selected': selectedId === item.document.id }" @click="selectedId = item.document.id"
            @contextmenu="rightmeun($event, item, item.document.id)" @dblclick="$emit('dbclickopen', item.document.id)">
            <span> {{ item.document.name }}</span>
            <span> {{ item.document_access_record.last_access_time }}</span>
            <span> {{ item.document.size }}</span>
            <div>
                <el-icon :size="20" v-if="iconlist.includes('star') && !item.document_favorites.is_favorite">
                    <el-tooltip :content="t('home.star')" :show-after="1000">
                        <svg-icon class="svg star" icon-class="star" @click.stop="$emit('updatestar', item)">
                        </svg-icon>
                    </el-tooltip>
                </el-icon>
                <el-icon :size="20" style="display: inline-block;" v-if="iconlist.includes('star') && item.document_favorites.is_favorite">
                    <el-tooltip :content="t('home.de_star')" :show-after="1000">
                        <svg-icon class="svg star" icon-class="stared" @click.stop="$emit('updatestar', item)">
                        </svg-icon>
                    </el-tooltip>
                </el-icon>
                <el-icon v-if="iconlist.includes('share')" :size="20">
                    <el-tooltip :content="t('home.share')" :show-after="1000">
                        <Share @click.stop="$emit('share', item)" />
                    </el-tooltip>
                </el-icon>
                <el-icon v-if="iconlist.includes('delete')" :size="20">
                    <el-tooltip :content="t('home.delete')" :show-after="1000">
                        <Delete @click.stop="$emit('deletefile', item)" />
                    </el-tooltip>
                </el-icon>
                <el-icon v-if="iconlist.includes('remove')" :size="20">
                    <el-tooltip :content="t('home.de_access_record')" :show-after="1000">
                        <Remove @click.stop=" $emit('remove', item)" />
                    </el-tooltip>
                </el-icon>
                <el-icon v-if="iconlist.includes('restore')" :size="20">
                    <el-tooltip :content="t('home.restore')" :show-after="1000" :hide-after="0">
                        <svg-icon class="svg restore" icon-class="restore"
                            @click.stop.prevent="  $emit('restore', item)"></svg-icon>
                    </el-tooltip>
                </el-icon>
                <el-icon v-if="iconlist.includes('Delete')" :size="20">
                    <el-tooltip :content="t('home.completely_delete')" :show-after="1000" :hide-after="0">
                        <Delete @click.stop.prevent=" $emit('ndelete', item)" />
                    </el-tooltip>
                </el-icon>
                <el-icon v-if="iconlist.includes('EXshare')" :size="20">
                    <el-tooltip :content="t('home.exit_share')" show-after="1000">
                        <svg-icon class="svg star" icon-class="exitshar" @click.stop=" $emit('exit_share', item)">
                        </svg-icon>
                    </el-tooltip>
                </el-icon>
            </div>
        </div>
    </RecycleScroller>
</template>

<script setup lang="ts">
import { Share, Delete, Remove, Star } from '@element-plus/icons-vue'
import { ref } from 'vue';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const selectedId = ref(-1)

const props = defineProps<{
    items: any;
    iconlist: any

}>()


const emits = defineEmits(['rightMeun', 'updatestar', 'share', 'deletefile', 'remove', 'restore', 'ndelete', 'exit_share','dbclickopen'])

function rightmeun(e: MouseEvent, data: object, docid: number) {
    selectedId.value = docid
    emits('rightMeun', e, data)
}

</script>
<style lang="scss" scoped>

.scroller {
    height: 100%;

    &::-webkit-scrollbar {
        width: 5px;
        height: auto;
    }

    &:hover::-webkit-scrollbar-thumb {
        border-radius: 3px;
        background-color: #b5b5b5be;
    }
}

.user {
    height: 56%;
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    font-size: 14px;
    color: #606266;

    span {
        height: 56px;
        line-height: 56px;
        overflow: hidden;
    }

    span:nth-child(1) {
        flex: 2;
    }

    span:not(:nth-child(1)) {
        flex: 1;

    }

    div {
        display: flex;
        align-items: center;
        flex: 1;

    }

}

.el-icon {
    display: none;
    margin: 0 6px 0 0;

    &:hover {
        color: #6395f9;
        background: rgba(185, 185, 185, 0.5);
        border-radius: 2px;
        cursor: pointer;
    }

    &:active {
        color: #145ff6;
    }
}

.hover {
    .el-icon {
        display: block;
    }
}



:deep(.el-icon) {
    &>:focus {
        outline: none;
    }
}
</style>
