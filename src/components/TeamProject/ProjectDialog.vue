<script setup lang="ts">
import { watch, ref, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const props = defineProps<{
    projectVisible: boolean
    title: string
    context?: string
    confirmBtn: string
    showinput?: boolean
    inputvalue?: any
}>();
const emit = defineEmits<{
    (e: 'clodeDialog'): void;
    (e: 'confirm'): void;
    (e: 'updateinputvalue', value: string): void;
}>()
const isshow = ref(false)
const inputvalue = ref<any>()
const handleClose = () => {
    emit('clodeDialog')
}

const quitProject = () => {
    emit('confirm');
}

const updateinputvalue = (value: any) => {
    emit('updateinputvalue', value)
}

let itmer: any
watch(() => props.projectVisible, (newvalue) => {
    isshow.value = newvalue
    nextTick(() => {
        const el_input = document.querySelector('.input_text') as HTMLInputElement
        if (el_input) {
            inputvalue.value = props.inputvalue
            itmer = setTimeout(() => {
                el_input.focus()
                el_input.select()
                clearTimeout(itmer)
            }, 0);
        }
    })
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
        <div v-if="$props.context" class="content" :style="{
            fontSize: props.showinput ? '12px' : '',
            color: props.showinput ? 'rgba(140, 140, 140, 1)' : ''
        }
            ">
            {{ context }}
        </div>
        <input v-if="$props.showinput" class="input_text" type="text" v-model="inputvalue"
            @change="updateinputvalue(inputvalue)">
        <template #footer>
            <div class="dialog-footer">
                <button class="bnt_cancel" type="button" @click.stop="handleClose">{{ t('Createteam.cancel') }}</button>
                <button :class="{ 'bnt_confirm': !props.showinput, 'bnt_confirm2': props.showinput }" type="button"
                    @click.stop="quitProject" :disabled="$props.showinput && !inputvalue">{{
                        confirmBtn }}</button>
            </div>
        </template>
    </el-dialog>
</template>

<style  lang="scss">
.my_content {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, 0);
    padding: 0 24px;
    border-radius: 14px;
    box-sizing: border-box;
    z-index: 9999;

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
                display: flex;
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
        flex-direction: column;
        padding: 0;
        margin: 0;


        .content {
            display: flex;
            align-items: center;
            height: 38px;
            font-size: 13px;
            color: rgba(38, 38, 38, 1);
        }

        .input_text {
            height: 36px;
            font-size: 13px;
            padding: 7px 12px;
            outline: none;
            border-radius: 6px;
            background: #F5F5F5;
            box-sizing: border-box;
            border: 1px solid #1878F5;

        }

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

            .bnt_confirm2 {
                color: white;
                background-color: rgba(24, 120, 245, 1);

                &:hover {
                    background-color: rgba(66, 154, 255, 1);
                }

                &:active {
                    background-color: rgba(10, 89, 207, 1);
                }

                &:disabled {
                    background-color: rgba(189, 226, 255, 1);
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