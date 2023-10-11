<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@element-plus/icons-vue'
import { Context } from '@/context';
interface Props {
    context: Context
}
const props = defineProps<Props>();
const isLable = ref(false);
</script>

<template>
    <div class="content_lable">
        <el-switch v-model="isLable" :active-action-icon="Switch" :inactive-action-icon="Switch" style="--el-switch-on-color: #898989; --el-switch-off-color: #898989"/>
    </div>
</template>

<style scoped lang="scss">
.content_lable {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 50px;
    margin: 0 10px;

    .el-switch {
        :deep(.el-switch__core .el-switch__action) {
            background-color: black;
        }

    }

    :deep(.el-switch.is-checked .el-switch__core .el-switch__action) {
        background-color: #a544e6 !important;
    }

}
</style>