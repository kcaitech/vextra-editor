<script setup lang="ts">
import { ref, defineProps } from 'vue'
import { Context } from '@/context';
import { Back } from '@element-plus/icons-vue'
const props = defineProps<{
    context: Context
}>()
const textarea = ref('')
</script>

<template>
    <div class="comment-input">
        <div class="comment-icon"></div>
        <div class="textarea">
            <el-input
                v-model="textarea"
                :autosize="{ minRows: 1, maxRows: 12 }"
                type="textarea"
                placeholder="输入评论"
                resize="none"
                size="small"
            />
            <div class="send"><el-icon :size="14"><Back /></el-icon></div>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .comment-input {
        position: relative;
        top: 50%;
        left: 50%;
        width: 330px;
        z-index: 99;
        font-size: var(--font-default-fontsize);
        .comment-icon {
            position: absolute;
            bottom: 0;
            left: -40px;
            width: 30px;
            height: 30px;
            border-radius: calc(15px);
            border-bottom-left-radius: 0;
            background-color: var(--active-color);
            box-shadow: 0px 5px 10px rgba(0,0,0,0.15);
        }
        .textarea {
            display: flex;
            padding: 12px;
            background-color: #fff;
            box-shadow: 0px 5px 10px rgba(0,0,0,0.15);
            border-radius: 4px;
            .send {
                margin-left: 5px;
                color: #fff;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 28px;
                height: 28px;
                background-color: var(--active-color);
                border-radius: 50%;
            }
        }
    }
    :deep(.el-textarea__inner) {
        border: none;
        box-shadow: none;
    }
    :deep(.el-textarea__inner::-webkit-scrollbar){
     width: 6px ;
    }
    :deep(.el-textarea__inner::-webkit-scrollbar-thumb) {
        border-radius: 3px ;
        -moz-border-radius: 3px ;
        -webkit-border-radius: 3px ;
        background-color: #c3c3c3 ;
    }
    :deep(.el-textarea__inner::-webkit-scrollbar-track) {
        background-color: transparent ;
    }
</style>