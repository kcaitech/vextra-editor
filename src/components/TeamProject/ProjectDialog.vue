<script setup lang="ts">
import { watch, ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const props = defineProps<{
    projectVisible: boolean
    title: string
    context: string
    confirmBtn: string
}>();
const emit = defineEmits<{
    (e: 'clodeDialog'): void;
    (e: 'confirm'): void;
}>()
const isshow = ref(false)

const handleClose = () => {
    emit('clodeDialog')
}

const quitProject = () => {
    emit('confirm');
}

watch(() => props.projectVisible, (newvalue) => {
    isshow.value = newvalue
})

</script>

<template>
    <el-dialog class="my_content" v-model="isshow" width=480 align-center :close-on-click-modal="false"
        :before-close="handleClose" :show-close="false">
        <template #header>
            <div class="my-header">
                <div class="title">{{ title }}</div>
                <div class="close" @click.stop="handleClose">
                    <svg-icon icon-class="close"></svg-icon>
                </div>
            </div>
        </template>
        {{ context }}
        <template #footer>
            <div class="dialog-footer">
                <button class="bnt_cancel" type="button" @click.stop="handleClose">{{ t('Createteam.cancel') }}</button>
                <button class="bnt_confirm" type="button" @click.stop="quitProject">{{ confirmBtn }}</button>
            </div>
        </template>
    </el-dialog>
</template>

<style  lang="scss">
.my_content {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -25%);
    padding: 0 24px;
    border-radius: 14px;
    box-sizing: border-box;

    .el-dialog__header {
        margin: 0;
        padding: 0;

        .my-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 64px;

            .title {
                font-size: 16px;
                color: #3D3D3D;
                font-weight: 600;
            }

            .close {
                width: 16px;
                height: 16px;
                padding: 4px;
                border-radius: 6px;

                &:hover {
                    background-color: rgb(243, 243, 245);
                    cursor: pointer;
                }

                svg {
                    color: #262626;
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }

    .el-dialog__body {
        display: flex;
        align-items: center;
        padding: 0;
        margin: 0;
        height: 38px;

    }

    .el-dialog__footer {
        padding: 0;
        margin: 0;
        display: flex;
        justify-content: flex-end;
        height: 64px;

        .dialog-footer {
            display: flex;
            align-items: center;
            gap: 11px;
            button {
                cursor: pointer;
                font-size: 13px;
                width: 70px;
                height: 36px;
                border: none;
                border-radius: 6px;
                box-sizing: border-box;
            }

            .bnt_confirm {
                color: #E22424;
                background: rgba(255, 255, 255, 1);
                border: 1px solid #E22424;

                &:hover {
                    background-color: rgba(199, 8, 8, 0.08);
                }

                &:active {
                    background-color: rgba(248, 225, 225, 1);
                    border: 1px solid #C70808;
                }
            }

            .bnt_cancel {
                color: rgba(51, 51, 51, 1);
                background-color: #FFFFFF;
                border: 1px solid #F0F0F0;

                &:hover {
                    background-color: rgba(247, 247, 249, 1);
                }

                &:active {
                    background-color: rgba(243, 243, 245, 1);
                }
            }
        }
    }
}
</style>