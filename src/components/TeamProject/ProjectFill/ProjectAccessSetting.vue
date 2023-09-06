<script setup lang="ts">
import { ref, watch } from 'vue'
const props = defineProps<{
    title: string
    dialogVisible: boolean
    width: string
}>()
const emit = defineEmits<{
    (e: 'clodeDialog'): void;
}>()
const handleClose = () => {
    emit('clodeDialog')
}

const isshow = ref(false)
watch(() => props.dialogVisible, (newvalue) => {
    isshow.value = newvalue
})
</script>

<template>
    <div>
        <el-dialog v-model="isshow" :title="title" :width="width" align-center :close-on-click-modal="false"
            :before-close="handleClose">
            <div class="body">
                <slot></slot>
            </div>
        </el-dialog>
    </div>
</template>

<style scoped lang="scss">
:deep(.el-dialog__body) {
    padding: 16px !important;
}

:deep(.el-input__inner) {
    font-size: 10px;
}

:deep(.el-dialog__title) {
    font-weight: bold;
}

.body {
    font-size: 10px;
}

.button {
    display: flex;
    justify-content: center;
    margin-top: 10px;

    button {
        width: 80px;
        height: 30px;
        font-size: 10px;
        border: none;
        background-color: var(--active-color-beta);
        color: #fff;
        border: 1px solid var(--active-color-beta);
        border-radius: 4px;
        outline: none;
    }
}</style>