<script setup lang="ts">
import { ref, watch } from 'vue'
import { Switch } from '@element-plus/icons-vue'
import { Context } from '@/context';

interface Props {
    context: Context
}
const props = defineProps<Props>();
const isLable = ref(false);
const visible = ref(false)
const vis = ref(false);
watch(isLable, (v) => {
    props.context.tool.setLableSwitch(v);
    vis.value = true;
})

var timer: any = null
const onMouseenter = () => {
    timer = setTimeout(() => {
        visible.value = true
        clearTimeout(timer)
    }, 600)
}
const onMouseleave = () => {
    clearTimeout(timer);
    visible.value = false;
    vis.value = false;
}

</script>

<template>
    <div class="content_lable">
        <el-tooltip class="box-item" effect="dark" content="开发模式" placement="bottom" :show-after="600" :offset="10"
            :hide-after="0" :visible="vis ? false : visible">
            <el-switch @mouseenter.stop="onMouseenter" @mouseleave.stop="onMouseleave" v-model="isLable"
                :active-action-icon="Switch" :inactive-action-icon="Switch"
                style="--el-switch-on-color: #898989; --el-switch-off-color: #898989" />
        </el-tooltip>
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

    :deep(.el-switch__core) {
        height: 25px;

        .el-switch__action {
            width: 20px;
            height: 20px;

            svg {
                color: #fff;
            }
        }
    }

    :deep(.el-switch.is-checked .el-switch__core .el-switch__action) {
        background-color: #a42bc5 !important;
        left: calc(100% - 20px);
    }

}</style>