<script setup lang="ts">
import { watch, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import CloseIcon from '../common/CloseIcon.vue';
const { t } = useI18n()
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

const changemargin = () => {
    const el = document.querySelector('.el-dialog__header') as HTMLElement
    el.style.marginRight = '0px'
}

</script>

<template>
    <el-dialog v-model="isshow" width=480 align-center :append-to-body="true" :close-on-click-modal="false"
        :before-close="handleClose" :show-close="false" @open="changemargin">
        <template #header>
            <div class="my-header">
                <div class="title">{{ title }}</div>
                <CloseIcon :size="20" @close="handleClose" />
            </div>
        </template>
        {{ context }}
        <template #footer>
            <div class="dialog-footer">
                <el-button class="quit" @click="quitProject" style="background-color: #9775fa; color: #fff;">{{ confirmBtn
                }}</el-button>
                <el-button class="quit" style="background-color: #fff; color: #000;" @click.stop="handleClose">
                    {{ t('Createteam.cancel') }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped lang="scss">
.my-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
        color: #3D3D3D;
        font-weight: 600;
    }
}

:deep(.el-button:focus, .el-button:hover) {
    background-color: #9775fa;
    border-color: #9775fa;
    color: #fff;
    outline: none;
}
</style>