<script setup lang="ts">
import {RefAttriListItem} from "@/utils/symbol";
import {useI18n} from "vue-i18n";

import {Context} from "@/context";
import {ref} from "vue";

const {t} = useI18n();

interface Props {
    context: Context
    data: RefAttriListItem
}

const props = defineProps<Props>();
const open = ref(false);
</script>
<template>
    <div class="item-wrap">
        <div class="name">{{ props.data.variable.name }}</div>
        <el-switch v-model="open" size="small" style="margin-left: 10px;--el-switch-on-color: #9775fa"/>
    </div>
</template>
<style lang="scss" scoped>
.item-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .name {
        flex: 0 0 84px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>