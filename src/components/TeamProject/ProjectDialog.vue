<script setup lang="ts">
import { watch, ref } from 'vue';

const props = defineProps<{
    projectVisible: boolean
    title: string
    context: string
    confirmBtn: string
    body?: boolean
}>();
const isshow = ref(false)
watch(() => props.projectVisible, (newvalue) => {
    isshow.value = newvalue
})

const emit = defineEmits<{
    (e: 'clodeDialog'): void;
    (e: 'confirm'): void;
}>()
const handleClose = () => {
    emit('clodeDialog')
}

const quitProject = () => {
    emit('confirm');
}
</script>

<template>
    <el-dialog v-model="isshow" width=20% :title="title" align-center :append-to-body="body" :close-on-click-modal="false"
        :before-close="handleClose">
        <div class="context">
            {{ context }}
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button class="quit" @click="quitProject" style="background-color: #9775fa; color: #fff;">{{ confirmBtn }}</el-button>
                <el-button class="quit" style="background-color: #fff; color: #000;" @click="handleClose">
                    取消
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped lang="scss">
:deep(.el-button:focus, .el-button:hover) {
    background-color: #9775fa;
    border-color: #9775fa;
    color: #fff;
    outline: none;
}
</style>